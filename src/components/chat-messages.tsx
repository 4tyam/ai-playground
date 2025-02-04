"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    onMessagesUpdate?.(messages);
  }, [messages, onMessagesUpdate]);

  return (
    <div className="space-y-4 px-4 sm:px-48 pb-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex w-full px-0 sm:px-4 py-1",
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
                  src={`/ai-models/${
                    model.includes("gpt") ? "openai.svg" : "anthropic.svg"
                  }`}
                  draggable={false}
                  alt="AI"
                  width={16}
                  height={16}
                  className={cn(
                    "size-4",
                    model.includes("gpt") && "dark:invert"
                  )}
                />
              </div>
            )}
          </div>

          {/* Message */}
          <Card
            className={cn(
              "flex min-h-[40px] py-2 px-3 sm:py-2 shadow-none border-none max-w-[85%]",
              message.role === "user" && "ml-auto bg-muted px-4 py-2.5",
              message.pending && "opacity-50"
            )}
          >
            <p className="whitespace-pre-wrap break-words text-[15px] leading-normal">
              {message.content}
            </p>
          </Card>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
