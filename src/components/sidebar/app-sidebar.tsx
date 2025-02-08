"use client";

import * as React from "react";
import { VList } from "virtua";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import SidebarTopNav from "./sidebar-top-nav";
import ChatItem from "../chat-item";
import { getChats } from "@/lib/actions";
import { Loader2Icon, MessagesSquareIcon } from "lucide-react";
import { isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { usePathname } from "next/navigation";

// Add this interface before GroupedChats
interface Chat {
  id: string;
  model: string;
  title: string | null;
  createdAt: Date;
}

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  thisWeek: Chat[];
  thisMonth: Chat[];
  older: Chat[];
};

const GROUP_HEADER_HEIGHT = 24; // Reduced from 28
const CHAT_ITEM_HEIGHT = 35; // Reduced from 56

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const pathname = usePathname();

  const refreshChats = React.useCallback(async () => {
    setIsLoading(true);
    setPage(1);
    try {
      const result = await getChats(1, 40, false);
      setChats(result.chats);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error refreshing chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add this effect to refresh chats when pathname changes
  React.useEffect(() => {
    refreshChats();
  }, [pathname, refreshChats]);

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

  const groupedChats = React.useMemo(() => {
    const groups: GroupedChats = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    };

    chats.forEach((chat) => {
      const date = new Date(chat.createdAt);
      if (isToday(date)) {
        groups.today.push(chat);
      } else if (isYesterday(date)) {
        groups.yesterday.push(chat);
      } else if (isThisWeek(date) && !isYesterday(date)) {
        groups.thisWeek.push(chat);
      } else if (isThisMonth(date) && !isThisWeek(date)) {
        groups.thisMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  }, [chats]);

  const virtualItems = React.useMemo(() => {
    const items: Array<{
      type: "header" | "chat";
      height: number;
      data: { label: string } | Chat;
    }> = [];

    // Add Today section
    if (groupedChats.today.length > 0) {
      items.push({
        type: "header",
        height: GROUP_HEADER_HEIGHT,
        data: { label: "Today" },
      });
      groupedChats.today.forEach((chat) =>
        items.push({ type: "chat", height: CHAT_ITEM_HEIGHT, data: chat })
      );
    }

    // Add Yesterday section
    if (groupedChats.yesterday.length > 0) {
      items.push({
        type: "header",
        height: GROUP_HEADER_HEIGHT,
        data: { label: "Yesterday" },
      });
      groupedChats.yesterday.forEach((chat) =>
        items.push({ type: "chat", height: CHAT_ITEM_HEIGHT, data: chat })
      );
    }

    // Add Previous 7 Days section
    if (groupedChats.thisWeek.length > 0) {
      items.push({
        type: "header",
        height: GROUP_HEADER_HEIGHT,
        data: { label: "Previous 7 Days" },
      });
      groupedChats.thisWeek.forEach((chat) =>
        items.push({ type: "chat", height: CHAT_ITEM_HEIGHT, data: chat })
      );
    }

    // Add Previous 30 Days section
    if (groupedChats.thisMonth.length > 0) {
      items.push({
        type: "header",
        height: GROUP_HEADER_HEIGHT,
        data: { label: "Previous 30 Days" },
      });
      groupedChats.thisMonth.forEach((chat) =>
        items.push({ type: "chat", height: CHAT_ITEM_HEIGHT, data: chat })
      );
    }

    // Add Older section
    if (groupedChats.older.length > 0) {
      items.push({
        type: "header",
        height: GROUP_HEADER_HEIGHT,
        data: { label: "Older" },
      });
      groupedChats.older.forEach((chat) =>
        items.push({ type: "chat", height: CHAT_ITEM_HEIGHT, data: chat })
      );
    }

    return items;
  }, [groupedChats]);

  const renderVirtualItem = (item: (typeof virtualItems)[0]) => {
    if (item.type === "header") {
      return (
        <div className="text-xs font-medium text-muted-foreground/70 px-2 py-2 -mt-2">
          {(item.data as { label: string }).label}
        </div>
      );
    } else {
      const chat = item.data as Chat;
      return (
        <ChatItem
          key={chat.id}
          chatId={chat.id}
          modelId={chat.model}
          chatTitle={chat.title ?? "Untitled Chat"}
          onDelete={handleDeleteChat}
          onArchive={handleArchiveChat}
        />
      );
    }
  };

  return (
    <Sidebar className="border-none" {...props}>
      <SidebarHeader className="border-none">
        <SidebarTopNav />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="h-[calc(100vh-120px)]">
            {!isLoading && chats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="bg-gray-200/50 dark:bg-muted/50 rounded-full p-4">
                  <MessagesSquareIcon className="size-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">No chats yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new chat to begin your conversation
                  </p>
                </div>
              </div>
            ) : (
              <VList
                className="flex flex-col h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 light:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent"
                overscan={20}
                onScrollEnd={hasMore ? loadMoreChats : undefined}
              >
                {virtualItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      height: item.height,
                      paddingTop:
                        item.type === "header" && index !== 0 ? "8px" : "0",
                    }}
                  >
                    {renderVirtualItem(item)}
                  </div>
                ))}
                {isLoading && (
                  <div className="py-4 flex items-center justify-center pt-14 text-muted-foreground/50">
                    <Loader2Icon className="size-6 animate-spin" />
                  </div>
                )}
              </VList>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail className="border-none pointer-events-none" />
    </Sidebar>
  );
}
