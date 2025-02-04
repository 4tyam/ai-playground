"use client";

import ChatBar from "@/components/chat-bar";
import ChatMessages from "@/components/chat-messages";
import { useEffect, useState } from "react";
import { use } from "react";

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
  const { chatId } = use(params);

  useEffect(() => {
    // Fetch messages from API route
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data.chatMessages);
        // Get model from the first message since it's included in each message
        if (data.chatMessages.length > 0) {
          setModel(data.chatMessages[0].model);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [chatId]);

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
      // This is the update with the AI response
      // Replace the last two messages (if they were temporary) with the final versions
      setMessages((prev) => {
        const withoutTemp = prev.filter((msg) => !msg.id.startsWith("temp-"));
        return [
          ...withoutTemp,
          {
            id: crypto.randomUUID(),
            content: userMessage,
            role: "user",
            sentAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            content: aiMessage,
            role: "assistant",
            sentAt: new Date(),
          },
        ];
      });
    }
  };

  return (
    <main className="h-[calc(100vh-80px)] -m-4 relative">
      <div className="absolute inset-0 overflow-y-auto pb-[140px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 light:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
        <ChatMessages messages={messages} model={model} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-background">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-12 lg:px-24">
          <ChatBar
            titleShown={false}
            modelsReadOnly={true}
            params={{ chatId }}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </main>
  );
};

export default ChatIdPage;
