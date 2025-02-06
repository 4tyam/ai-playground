"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2Icon, EllipsisIcon, ArchiveIcon, X } from "lucide-react";
import { getChats, unarchiveChat } from "@/lib/actions";
import { toast } from "sonner";
import Image from "next/image";
import { models } from "@/lib/models";
import { Button } from "./ui/button";

interface ArchivedChatsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchivedChats({ open, onOpenChange }: ArchivedChatsProps) {
  const [archivedChats, setArchivedChats] = useState<
    Array<{
      id: string;
      model: string;
      title: string | null;
      createdAt: Date;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingChatId, setProcessingChatId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadArchivedChats();
    }
  }, [open]);

  const loadArchivedChats = async () => {
    setIsLoading(true);
    try {
      const result = await getChats(1, 100, true); // Get archived chats
      setArchivedChats(result.chats);
    } catch (error) {
      console.error("Error loading archived chats:", error);
      toast.error("Failed to load archived chats");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async (chatId: string) => {
    setProcessingChatId(chatId);
    try {
      await unarchiveChat(chatId);
      setArchivedChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== chatId)
      );
      toast.success("Chat unarchived");
    } catch (error) {
      toast.error("Failed to unarchive chat");
    } finally {
      setProcessingChatId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-[600px] p-0 [&>button]:hidden rounded-xl pb-4">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
          <DialogTitle>Archived Chats</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full flex-shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="px-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : archivedChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No archived chats
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4 -mr-4">
              <div className="space-y-2">
                {archivedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-start justify-between p-2 rounded-lg hover:bg-muted/50 gap-2"
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {models.find((m) => m.id === chat.model)?.icon && (
                        <Image
                          src={models.find((m) => m.id === chat.model)!.icon}
                          alt={models.find((m) => m.id === chat.model)!.name}
                          width={14}
                          height={14}
                          className={`flex-shrink-0 mt-1 ${
                            models
                              .find((m) => m.id === chat.model)
                              ?.icon.includes("openai") ||
                            models
                              .find((m) => m.id === chat.model)
                              ?.icon.includes("anthropic")
                              ? "dark:invert"
                              : ""
                          }`}
                        />
                      )}
                      <span className="break-words">
                        {chat.title ?? "Untitled Chat"}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded-md flex-shrink-0">
                          <EllipsisIcon className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-[80px] mr-4 rounded-xl"
                        side="right"
                        align="start"
                        sideOffset={-10}
                        alignOffset={20}
                      >
                        <DropdownMenuItem
                          onClick={() => handleUnarchive(chat.id)}
                          disabled={processingChatId === chat.id}
                          className="cursor-pointer rounded-xl p-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {processingChatId === chat.id ? (
                              <>
                                <Loader2Icon className="size-3.5 animate-spin" />
                                <span>Unarchiving</span>
                              </>
                            ) : (
                              <>
                                <ArchiveIcon className="size-3.5" />
                                <span>Unarchive</span>
                              </>
                            )}
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
