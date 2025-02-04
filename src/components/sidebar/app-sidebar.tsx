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
import { getChats } from "@/lib/actions";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const chats = await getChats();

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
              {chats.map((chat) => (
                <ChatSidebar
                  key={chat.id}
                  chatId={chat.id}
                  modelId={chat.model}
                  chatTitle={chat.title ?? "Untitled Chat"}
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
