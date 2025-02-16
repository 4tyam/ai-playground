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
import { eq, desc } from "drizzle-orm";
import { calculateCost } from "@/lib/pricing";
import { redis } from "@/lib/redis";
import { CachedData, Message } from "@/types";

export const POST = async (req: Request) => {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const {
      messages,
      data,
      model: requestModel,
      maxTokens,
      provider,
      chatId,
    } = await req.json();

    if (!messages?.length || !requestModel || !provider) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Start usage check in parallel with message processing
    const userInfoPromise = db
      .select({
        usageAmount: users.usageAmount,
        maxAmount: users.maxAmount,
      })
      .from(users)
      .where(eq(users.id, session.user.id as string))
      .limit(1);

    let currentChatId = chatId;
    const currentMessage = messages[messages.length - 1];

    // Structure the message immediately
    const formattedMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      sentAt: new Date(),
      content: data?.imageUrls?.length
        ? [
            { type: "text", text: currentMessage.content },
            ...data.imageUrls.map((imageUrl: string) => ({
              type: "image",
              image: imageUrl,
            })),
          ]
        : currentMessage.content,
    };

    // Fetch message history in parallel with usage check
    const messageHistoryPromise = (async () => {
      if (!chatId) return [];

      const cachedData = await redis.get(`chat:${chatId}`);
      if (
        cachedData &&
        typeof cachedData === "object" &&
        "messages" in cachedData
      ) {
        return (cachedData as CachedData).messages;
      }

      const previousMessages = await db
        .select({
          role: messagesTable.role,
          content: messagesTable.content,
        })
        .from(messagesTable)
        .where(eq(messagesTable.chatId, chatId))
        .orderBy(desc(messagesTable.sentAt))
        .limit(10);

      const messageHistory = previousMessages.reverse().map((msg) => ({
        id: crypto.randomUUID(),
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        sentAt: new Date(),
      }));

      // Cache in background
      redis
        .set(
          `chat:${chatId}`,
          { messages: messageHistory, model: requestModel },
          { ex: 3600 }
        )
        .catch(console.error);

      return messageHistory;
    })();

    // Wait for parallel operations
    const [userInfo, messageHistory] = await Promise.all([
      userInfoPromise,
      messageHistoryPromise,
    ]);

    if (!userInfo.length) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { usageAmount, maxAmount } = userInfo[0];

    if (Number(usageAmount) >= Number(maxAmount)) {
      return new NextResponse("Usage limit exceeded", { status: 403 });
    }

    const allMessages = [
      ...messageHistory,
      ...messages.slice(0, -1),
      formattedMessage,
    ];

    // Create chat if needed with title
    if (!currentChatId) {
      // Use first 50 chars of user message as title
      const chatTitle =
        currentMessage.content.slice(0, 50).trim().replace(/\n/g, " ") + // Replace newlines with spaces
        (currentMessage.content.length > 50 ? "..." : "");

      const [chat] = await db
        .insert(chats)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id as string,
          model: requestModel,
          title: chatTitle,
        })
        .returning({ id: chats.id });

      currentChatId = chat.id;
    }

    // Insert user message in background
    db.insert(messagesTable)
      .values({
        chatId: currentChatId,
        senderId: session.user.id as string,
        content: formattedMessage.content as string,
        role: "user",
      })
      .execute()
      .catch(console.error);

    // Initialize streaming response
    let finalUsage = { promptTokens: 0, completionTokens: 0 };

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
      messages: allMessages,
      onFinish({ text, usage }) {
        finalUsage = usage;

        // Handle completion in background
        (async () => {
          try {
            if (!session?.user?.id) return;

            // Insert AI response
            const [assistantMessage] = await db
              .insert(messagesTable)
              .values({
                chatId: currentChatId,
                senderId: session.user.id,
                content: text,
                role: "assistant",
              })
              .returning({ id: messagesTable.id });

            // Calculate cost
            const cost = calculateCost(
              requestModel,
              finalUsage.promptTokens,
              finalUsage.completionTokens
            );

            // Update usage in background
            await db.transaction(async (tx) => {
              await tx
                .update(users)
                .set({
                  usageAmount: (Number(usageAmount) + Number(cost)).toFixed(20),
                })
                .where(eq(users.id, session?.user?.id as string));

              await tx.insert(usageLogs).values({
                userId: session?.user?.id,
                userEmail: session?.user?.email as string,
                userName: session?.user?.name,
                messageId: assistantMessage.id,
                model: requestModel,
                promptTokens: finalUsage.promptTokens,
                completionTokens: finalUsage.completionTokens,
                totalCost: cost,
              });
            });

            // Update Redis cache
            if (currentChatId) {
              const updatedMessages = [
                ...messageHistory,
                formattedMessage,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: text,
                  sentAt: new Date(),
                },
              ];

              await redis.set(
                `chat:${currentChatId}`,
                {
                  messages: updatedMessages,
                  model: requestModel,
                },
                { ex: 3600 }
              );
            }
          } catch (error) {
            console.error("Error in completion handler:", error);
          }
        })();
      },
    });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.textStream) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ tokens: chunk })}\n\n`)
            );
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Add response headers
    const headers = new Headers();
    headers.set("X-Chat-Id", currentChatId);
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    return new Response(readable, { headers });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
