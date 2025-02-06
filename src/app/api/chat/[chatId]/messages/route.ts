import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "../../../../../../db";
import { chats, messages } from "../../../../../../db/schema";
import { and, eq } from "drizzle-orm";

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

    const result = await db.transaction(async (tx) => {
      // First check if chat exists and belongs to user
      const chat = await tx
        .select()
        .from(chats)
        .where(
          and(
            eq(chats.id, chatId),
            eq(chats.userId, session?.user?.id as string)
          )
        )
        .limit(1);

      if (!chat.length) {
        return null; // Return null to indicate chat not found
      }

      // If chat exists, get its messages
      const chatMessages = await tx
        .select({
          id: messages.id,
          content: messages.content,
          role: messages.role,
          sentAt: messages.sentAt,
          model: chats.model,
        })
        .from(messages)
        .innerJoin(chats, eq(messages.chatId, chats.id))
        .where(eq(messages.chatId, chatId))
        .orderBy(messages.sentAt);

      return chatMessages;
    });

    if (!result) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    return NextResponse.json({
      chatMessages: result,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
