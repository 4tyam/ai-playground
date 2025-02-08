import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "../../../../db";
import {
  users,
  usageLogs,
  chats,
  messages as messagesTable,
} from "../../../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { calculateCost } from "@/lib/pricing";

// Add Message type
type Message = {
  role: "user" | "assistant";
  content: string;
};

export const POST = async (req: Request) => {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get user's current usage and limits
  const userInfo = await db
    .select({
      usageAmount: users.usageAmount,
      maxAmount: users.maxAmount,
    })
    .from(users)
    .where(eq(users.id, session.user.id as string))
    .limit(1);

  if (!userInfo.length) {
    return new NextResponse("User not found", { status: 404 });
  }

  const { usageAmount, maxAmount } = userInfo[0];

  // Check usage limit before processing anything
  if (Number(usageAmount) >= Number(maxAmount)) {
    return new NextResponse("Usage limit exceeded", { status: 403 });
  }

  const {
    prompt,
    chatId,
    model: requestModel,
    maxTokens,
    provider,
    messages,
  } = await req.json();

  // Ensure we have a valid message content and model
  const messageContent = prompt || messages?.[0]?.content;

  if (!messageContent) {
    return new NextResponse("Message content is required", { status: 400 });
  }

  if (!requestModel || !provider) {
    return new NextResponse("Model and provider are required", { status: 400 });
  }

  try {
    // If we have a chatId, get previous messages for context
    let messageHistory: Message[] = [];
    if (chatId) {
      const previousMessages = await db
        .select({
          role: messagesTable.role,
          content: messagesTable.content,
        })
        .from(messagesTable)
        .where(eq(messagesTable.chatId, chatId))
        .orderBy(desc(messagesTable.sentAt)) // Get newest first
        .limit(10); // Limit to last 10 messages

      messageHistory = previousMessages
        .reverse() // Reverse to get correct chronological order
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
    }

    // Generate AI response with context based on provider
    const { text, usage } = await generateText({
      model: (() => {
        if (provider === "anthropic") {
          return anthropic(requestModel);
        } else if (provider === "openai") {
          return openai(requestModel);
        } else if (provider === "groq") {
          return groq(requestModel);
        } else if (provider === "google") {
          return google(requestModel);
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }
      })(),
      maxTokens: maxTokens || 2000,
      messages: [...messageHistory, { role: "user", content: messageContent }],
    });

    // Calculate cost of this request
    const cost = calculateCost(
      requestModel,
      usage.promptTokens,
      usage.completionTokens
    );

    // Check if this would exceed the user's limit
    // if (Number(usageAmount) + Number(cost) > Number(maxAmount)) {
    //   return new NextResponse("Usage limit exceeded", { status: 403 });
    // }

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
          model: requestModel,
          title: messageContent.slice(0, 100),
        })
        .returning({ id: chats.id });

      currentChatId = newChat.id;
    }

    // Insert user message
    await db.insert(messagesTable).values({
      chatId: currentChatId,
      senderId: session.user.id as string,
      content: messageContent,
      role: "user",
    });

    // Insert AI response and get its ID
    const [assistantMessage] = await db
      .insert(messagesTable)
      .values({
        chatId: currentChatId,
        senderId: session.user.id as string,
        content: text,
        role: "assistant",
      })
      .returning({ id: messagesTable.id });

    // Update user's usage amount and create usage log
    await db.transaction(async (tx) => {
      // Update user's total usage
      await tx
        .update(users)
        .set({
          usageAmount: (Number(usageAmount) + Number(cost)).toFixed(20),
        })
        .where(eq(users.id, session?.user?.id as string));

      // Create usage log entry
      await tx.insert(usageLogs).values({
        userId: session?.user?.id as string,
        userEmail: session?.user?.email as string,
        userName: session?.user?.name as string,
        messageId: assistantMessage.id,
        model: requestModel,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalCost: cost,
      });
    });

    return NextResponse.json({
      message: text,
      chatId: currentChatId,
      usage: {
        ...usage,
        cost,
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

// import { openai } from '@ai-sdk/openai';
// import { streamText } from 'ai';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = streamText({
//     model: openai('gpt-4o-mini'),
//     messages,
//     onFinish({ text }) {
//       console.log(text);
//     }
//   });

//   return result.toDataStreamResponse();
// }
