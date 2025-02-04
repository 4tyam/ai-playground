import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "../../../../db";
import { chats, messages } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export const POST = async (req: Request) => {
  const session = await auth();
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { prompt, chatId, model } = await req.json();

  try {
    // Generate AI response
    const { text } = await generateText({
      model: openai(model || "gpt-4o-mini"),
      prompt: prompt,
    });

    let currentChatId = chatId;

    if (currentChatId) {
      // We're in a specific chat page, verify chat exists and belongs to user
      const existingChat = await db
        .select({ id: chats.id })
        .from(chats)
        .where(
          and(
            eq(chats.id, currentChatId),
            eq(chats.userId, session.user.id as string)
          )
        )
        .limit(1);

      if (!existingChat.length) {
        return new NextResponse("Chat not found", { status: 404 });
      }
    } else {
      // We're on the main chat page, create a new chat
      const [newChat] = await db
        .insert(chats)
        .values({
          userId: session.user.id as string,
          model: model || "gpt-4o-mini",
          title: prompt.slice(0, 100), // Use first 100 chars of prompt as title
        })
        .returning({ id: chats.id });
      
      currentChatId = newChat.id;
    }

    // Insert user message
    await db.insert(messages).values({
      chatId: currentChatId,
      senderId: session.user.id as string,
      content: prompt,
      role: "user",
    });

    // Insert AI response
    await db.insert(messages).values({
      chatId: currentChatId,
      senderId: session.user.id as string,
      content: text,
      role: "assistant", 
    });

    return NextResponse.json({
      message: text,
      chatId: currentChatId,
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
