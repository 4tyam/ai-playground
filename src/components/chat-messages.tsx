"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { models } from "@/lib/models";
import FormattedMessage from "./formatted-message";
import { useSidebar } from "@/components/ui/sidebar";
import { VList, VListHandle } from "virtua";
import { Message } from "@/types";

type ChatMessagesProps = {
  messages:
    | {
        chatMessages: Message[];
        model: string;
      }
    | Message[]; // Support both new and old format
  model?: string; // Make model optional since it might be in messages object
  onMessagesUpdate?: (messages: Message[]) => void;
};

const BOT_MODEL = {
  id: "bot",
  name: "AI Assistant",
  icon: "/ai-models/bot.svg",
  provider: "undefined",
};

export default function ChatMessages({
  messages,
  model: propModel,
  onMessagesUpdate,
}: ChatMessagesProps) {
  const listRef = useRef<VListHandle>(null);
  const { state } = useSidebar();
  const previousMessageCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const lastMessageRef = useRef<Message | null>(null);

  // Handle both new and old message formats with safety checks
  const { messageList, modelId } = (() => {
    if (!messages) {
      return {
        messageList: [],
        modelId: propModel,
      };
    }

    if (Array.isArray(messages)) {
      return {
        messageList: messages,
        modelId: propModel,
      };
    }

    return {
      messageList: messages.chatMessages || [],
      modelId: messages.model || propModel,
    };
  })();

  // Auto scroll to bottom only for new messages, not updates
  useEffect(() => {
    if (listRef.current && !isInitialLoadRef.current) {
      const lastMessage = messageList[messageList.length - 1];

      // Only scroll if a new message was added (not during updates)
      if (messageList.length > previousMessageCountRef.current) {
        // Check if it's a completely new message, not just an update
        if (lastMessage?.id !== lastMessageRef.current?.id) {
          listRef.current.scrollToIndex(messageList.length - 1, {
            align: "end",
          });
        }
      }
    }

    if (isInitialLoadRef.current && messageList.length > 0) {
      isInitialLoadRef.current = false;
      // Initial scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollToIndex(messageList.length - 1, {
          align: "end",
        });
      }, 0);
    }

    // Update refs
    lastMessageRef.current = messageList[messageList.length - 1];
    previousMessageCountRef.current = messageList.length;
    onMessagesUpdate?.(messageList);
  }, [messageList, onMessagesUpdate]);

  const renderMessage = (message: Message) => {
    // Find the model info with better error handling
    const modelInfo = models.find((m) => m.id === modelId) || BOT_MODEL;

    return (
      <div
        className={cn(
          "flex w-full px-0 sm:px-4",
          message.role === "user" && "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div className="flex shrink-0">
          {message.role === "user" ? (
            <div />
          ) : (
            <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-full border bg-background shadow-sm mt-1">
              <Image
                src={
                  modelInfo.icon.startsWith("/")
                    ? modelInfo.icon
                    : `/ai-models/${modelInfo.icon}`
                }
                alt={modelInfo.name}
                width={16}
                height={16}
                draggable={false}
                className={cn(
                  modelInfo.provider === "openai" ||
                    modelInfo.provider === "anthropic"
                    ? "dark:invert"
                    : ""
                )}
              />
            </div>
          )}
        </div>

        {/* Message */}
        <Card
          className={cn(
            "flex min-h-[40px] py-2 px-3 sm:py-2.5 text-sm sm:text-base shadow-none border-none max-w-[85%]",
            message.role === "user" && "ml-auto bg-muted px-4 py-2.5"
          )}
        >
          <FormattedMessage content={message.content as string} />
        </Card>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "h-full",
        "transition-[padding] duration-300",
        state === "expanded"
          ? "md:px-12 lg:px-24 xl:px-48"
          : "md:px-32 lg:px-64 xl:px-72"
      )}
    >
      <VList
        ref={listRef}
        className="h-full px-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 light:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {messageList?.map((message) => (
          <div key={message.id} className="py-1.5">
            {renderMessage(message)}
          </div>
        )) || null}
      </VList>
    </div>
  );
}
