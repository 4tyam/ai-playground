"use client";

import ChatBar from "@/components/chat-bar";
import ChatMessages from "@/components/chat-messages";
import Loading from "@/components/loading";
import { useEffect, useState } from "react";
import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  sentAt: Date;
  pending?: boolean;
};

const ChatIdPage = ({ params }: { params: Promise<{ chatId: string }> }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { chatId } = use(params);
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/chat/${chatId}/messages`);

        if (response.status === 404) {
          return notFound();
        }

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data.chatMessages);
        setModel(data.model);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load chat");
        router.push("/chat");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, router]);

  const handleMessageSent = (
    userMessage: string,
    aiMessage: string,
    isAIResponse = false
  ) => {
    if (!isAIResponse) {
      // This is the initial optimistic update with just the user message
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        content: userMessage,
        role: "user",
        sentAt: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    } else {
      // This is an update with the AI response
      setMessages((prev) => {
        // Find the last user message and any existing AI message
        const lastUserMessageIndex = prev.findLastIndex(
          (msg) => msg.role === "user"
        );
        const hasAIMessage = lastUserMessageIndex < prev.length - 1;

        if (hasAIMessage) {
          // If we already have an AI message, update it
          return prev.map((msg, index) => {
            if (index > lastUserMessageIndex) {
              return {
                ...msg,
                content: aiMessage,
              };
            }
            return msg;
          });
        } else {
          // If we don't have an AI message yet, add it
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              content: aiMessage,
              role: "assistant",
              sentAt: new Date(),
            },
          ];
        }
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="h-[calc(100vh-80px)] -m-4 relative">
      <div className="absolute inset-0 overflow-y-auto pb-[150px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 light:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
        <ChatMessages messages={messages} model={model} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-background">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-12 lg:px-24">
          <ChatBar
            titleShown={false}
            modelsReadOnly={true}
            params={{ chatId }}
            selectedModel={model}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </main>
  );
};

export default ChatIdPage;
