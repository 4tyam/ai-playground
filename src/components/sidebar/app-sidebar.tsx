import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import SidebarTopNav from "./sidebar-top-nav";
import ChatSidebar from "../chat-sidebar";

// Add this sample chat data
const sampleChats = [
  {
    chatId: "1",
    modelId: "gpt-4o",
    chatTitle: "Project Discussion",
  },
  {
    chatId: "2",
    modelId: "claude-3-5-sonnet",
    chatTitle: "Code Review",
  },
  {
    chatId: "3",
    modelId: "llama-3.3-70b-versatile",
    chatTitle: "Vegan lasagna homemade recipe",
  },
  {
    chatId: "4",
    modelId: "gemini-2.0-flash-exp",
    chatTitle: "Code Review",
  },
  {
    chatId: "5",
    modelId: "deepseek-r1-distill-llama-70b",
    chatTitle: "Code Review",
  },
  {
    chatId: "6",
    modelId: "claude-3-5-haiku",
    chatTitle: "Code Review",
  },
  {
    chatId: "7",
    modelId: "llama-3.3-70b-versatile",
    chatTitle: "Code Review",
  },
  {
    chatId: "8",
    modelId: "claude-3-5-sonnet",
    chatTitle: "Code Review",
  },

  // Add more sample chats as needed
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarTopNav />
      </SidebarHeader>
      <SidebarContent>
        {/* Chat list section */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col gap-1">
              {sampleChats.map((chat) => (
                <ChatSidebar
                  key={chat.chatId}
                  chatId={chat.chatId}
                  modelId={chat.modelId}
                  chatTitle={chat.chatTitle}
                />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
