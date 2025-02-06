"use client";

import * as React from "react";
import { VList } from "virtua";
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
import ChatItem from "../chat-item";
import { getChats } from "@/lib/actions";
import { Loader2Icon } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [chats, setChats] = React.useState<
    Array<{
      id: string;
      model: string;
      title: string | null;
      createdAt: Date;
    }>
  >([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadMoreChats = React.useCallback(async () => {
    if (isLoading || (!hasMore && page !== 1)) return;

    setIsLoading(true);
    try {
      const result = await getChats(page, 40, false);
      setChats((prevChats) => {
        if (page === 1) {
          return result.chats;
        }
        return [...prevChats, ...result.chats];
      });
      setHasMore(result.hasMore);
      setPage((p) => p + 1);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  const handleDeleteChat = React.useCallback(
    (deletedChatId: string) => {
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== deletedChatId)
      );

      if (chats.length === 1) {
        setPage(1);
        setHasMore(true);
        loadMoreChats();
      }
    },
    [chats.length, loadMoreChats]
  );

  const handleArchiveChat = React.useCallback(
    (archivedChatId: string) => {
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== archivedChatId)
      );

      if (chats.length === 1) {
        setPage(1);
        setHasMore(true);
        loadMoreChats();
      }
    },
    [chats.length, loadMoreChats]
  );

  React.useEffect(() => {
    loadMoreChats();
  }, [loadMoreChats]);

  const chatItems = React.useMemo(() => {
    return chats.map((chat) => (
      <ChatItem
        key={chat.id}
        chatId={chat.id}
        modelId={chat.model}
        chatTitle={chat.title ?? "Untitled Chat"}
        onDelete={handleDeleteChat}
        onArchive={handleArchiveChat}
      />
    ));
  }, [chats, handleDeleteChat, handleArchiveChat]);

  return (
    <Sidebar className="border-none" {...props}>
      <SidebarHeader className="border-none">
        <SidebarTopNav />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupLabel className="text-muted-foreground/70">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent className="h-[calc(100vh-120px)]">
            <VList
              className="flex flex-col gap-1 h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 light:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent"
              overscan={20}
              onScrollEnd={hasMore ? loadMoreChats : undefined}
              itemSize={56}
            >
              {chatItems}
              {isLoading && (
                <div className="py-4 flex items-center justify-center pt-14 text-muted-foreground/50">
                  <Loader2Icon className="size-6 animate-spin" />
                </div>
              )}
            </VList>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail className="border-none pointer-events-none" />
    </Sidebar>
  );
}
