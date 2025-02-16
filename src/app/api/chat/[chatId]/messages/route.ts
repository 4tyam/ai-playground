import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "../../../../../../db";
import { chats, messages } from "../../../../../../db/schema";
import { and, eq } from "drizzle-orm";
import { redis } from "@/lib/redis";
import { CachedData } from "@/types";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) => {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { chatId } = await params;

    // Try to get messages from Redis first
    const cachedData = await redis.get(`chat:${chatId}`);

    if (cachedData) {
      // Type guard function to check if the cached data has the correct structure
      const isCachedData = (data: unknown): data is CachedData => {
        return (
          typeof data === "object" &&
          data !== null &&
          "messages" in data &&
          "model" in data &&
          Array.isArray((data as CachedData).messages) &&
          typeof (data as CachedData).model === "string"
        );
      };

      // Check if cached data has the correct structure
      if (isCachedData(cachedData)) {
        return NextResponse.json({
          chatMessages: cachedData.messages,
          model: cachedData.model,
        });
      }
    }

    // If not in cache or invalid cache, get from DB
    const result = await db.transaction(async (tx) => {
      // First check if chat exists and belongs to user
      const chat = await tx
        .select({
          id: chats.id,
          model: chats.model,
        })
        .from(chats)
        .where(
          and(
            eq(chats.id, chatId),
            eq(chats.userId, session?.user?.id as string)
          )
        )
        .limit(1);

      if (!chat.length) {
        return null;
      }

      // If chat exists, get its messages
      const chatMessages = await tx
        .select({
          id: messages.id,
          content: messages.content,
          role: messages.role,
          sentAt: messages.sentAt,
        })
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(messages.sentAt);

      const data = {
        chatMessages,
        model: chat[0].model,
      };

      // Cache the results with the correct structure
      await redis.set(
        `chat:${chatId}`,
        {
          messages: chatMessages,
          model: chat[0].model,
        } as CachedData,
        { ex: 7200 }
      );

      return data;
    });

    if (!result) {
      return new NextResponse("Chat not found", { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
