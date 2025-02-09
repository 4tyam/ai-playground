"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { models } from "@/lib/models";
import FormattedMessage from "./formatted-message";
import { useSidebar } from "@/components/ui/sidebar";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  sentAt: Date;
  pending?: boolean;
};

type ChatMessagesProps = {
  messages: Message[];
  model: string;
  onMessagesUpdate?: (messages: Message[]) => void;
};

export default function ChatMessages({
  messages,
  model,
  onMessagesUpdate,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state } = useSidebar();

  // Auto scroll to bottom when new messages arrive or when streaming updates occur
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        const behavior = messages[messages.length - 1]?.pending
          ? "auto"
          : "smooth";
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    };

    scrollToBottom();
    onMessagesUpdate?.(messages);
  }, [messages, onMessagesUpdate]);

  return (
    <div
      className={cn(
        "space-y-2.5 px-4 pt-3 pb-4",
        "transition-[padding] duration-300",
        state === "expanded"
          ? "md:px-12 lg:px-24 xl:px-48"
          : "md:px-32 lg:px-64 xl:px-72",
        "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 light:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent"
      )}
    >
      {messages.map((message) => (
        <div
          key={message.id}
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
                  src={models.find((m) => m.id === model)!.icon}
                  alt={models.find((m) => m.id === model)!.name}
                  width={16}
                  height={16}
                  draggable={false}
                  className={`${
                    models
                      .find((m) => m.id === model)
                      ?.icon.includes("openai") ||
                    models
                      .find((m) => m.id === model)
                      ?.icon.includes("anthropic")
                      ? "dark:invert"
                      : ""
                  }`}
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
            <FormattedMessage content={message.content} />
          </Card>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
