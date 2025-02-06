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
import { getChats, unarchiveChat, unarchiveAllChats } from "@/lib/actions";
import { toast } from "sonner";
import Image from "next/image";
import { models } from "@/lib/models";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

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
  const [showUnarchiveAllConfirm, setShowUnarchiveAllConfirm] = useState(false);
  const [isUnarchivingAll, setIsUnarchivingAll] = useState(false);

  const router = useRouter();

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

  const handleUnarchiveAll = async () => {
    setIsUnarchivingAll(true);
    try {
      await unarchiveAllChats();
      setArchivedChats([]); // Clear the list
      toast.success("All chats unarchived");
      setShowUnarchiveAllConfirm(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to unarchive chats");
    } finally {
      setIsUnarchivingAll(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xs sm:max-w-[600px] p-0 [&>button]:hidden rounded-xl pb-4">
          <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
            <DialogTitle>Archived Chats</DialogTitle>
            <div className="flex items-center gap-2">
              {archivedChats.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-7"
                  onClick={() => setShowUnarchiveAllConfirm(true)}
                  disabled={isUnarchivingAll}
                >
                  {isUnarchivingAll ? (
                    <>
                      <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />
                      Unarchiving all
                    </>
                  ) : (
                    "Unarchive all"
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full flex-shrink-0"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
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

      <AlertDialog
        open={showUnarchiveAllConfirm}
        onOpenChange={setShowUnarchiveAllConfirm}
      >
        <AlertDialogContent className="rounded-xl max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Unarchive all chats</AlertDialogTitle>
            <AlertDialogDescription>
              This will unarchive all your archived chats. They will appear
              again in your main chat list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={handleUnarchiveAll}
              disabled={isUnarchivingAll}
            >
              {isUnarchivingAll ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Unarchiving
                </>
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
