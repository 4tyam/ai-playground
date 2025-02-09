import { streamText } from "ai";
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
        .orderBy(desc(messagesTable.sentAt))
        .limit(10);

      messageHistory = previousMessages.reverse().map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

    let currentChatId = chatId;

    if (!currentChatId) {
      // Create a new chat if we don't have one
      const [newChat] = await db
        .insert(chats)
        .values({
          userId: session.user.id as string,
          model: requestModel,
          title: messageContent.slice(0, 100),
        })
        .returning({ id: chats.id });

      currentChatId = newChat.id;
    } else {
      // Verify chat exists and belongs to user
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
    }

    // Insert user message
    await db.insert(messagesTable).values({
      chatId: currentChatId,
      senderId: session.user.id as string,
      content: messageContent,
      role: "user",
    });

    // Initialize variables for collecting the full response
    let fullText = "";
    let finalUsage = { promptTokens: 0, completionTokens: 0 };

    // Create stream
    const stream = streamText({
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
      onStepFinish(event) {
        if ("tokens" in event) {
          fullText += event.tokens;
        }
      },
      onFinish({ text, usage }) {
        finalUsage = usage;

        // Handle completion here instead of using response.finally
        (async () => {
          try {
            // Ensure we still have session data
            const userId = session?.user?.id;
            const userEmail = session?.user?.email;
            const userName = session?.user?.name;

            if (!userId || !userEmail || !userName) {
              console.error("Session data missing during completion");
              return;
            }

            // Calculate cost
            const cost = calculateCost(
              requestModel,
              finalUsage.promptTokens,
              finalUsage.completionTokens
            );

            // Insert AI response
            const [assistantMessage] = await db
              .insert(messagesTable)
              .values({
                chatId: currentChatId,
                senderId: userId,
                content: text,
                role: "assistant",
              })
              .returning({ id: messagesTable.id });

            // Update user's usage amount and create usage log
            await db.transaction(async (tx) => {
              await tx
                .update(users)
                .set({
                  usageAmount: (Number(usageAmount) + Number(cost)).toFixed(20),
                })
                .where(eq(users.id, userId));

              await tx.insert(usageLogs).values({
                userId,
                userEmail,
                userName,
                messageId: assistantMessage.id,
                model: requestModel,
                promptTokens: finalUsage.promptTokens,
                completionTokens: finalUsage.completionTokens,
                totalCost: cost,
              });
            });
          } catch (error) {
            console.error("Error saving streamed response:", error);
          }
        })();
      },
    });

    // Create a ReadableStream that we can send to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.textStream) {
            // Send each chunk as a server-sent event
            const data = JSON.stringify({ tokens: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Add chatId to response headers
    const headers = new Headers();
    headers.set("X-Chat-Id", currentChatId);
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    return new Response(readable, {
      headers,
      status: 200,
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
