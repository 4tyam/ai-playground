"use client";

import {
  ArchiveIcon,
  EllipsisIcon,
  Loader2Icon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { models } from "@/lib/models";
import { deleteChat, renameChat, archiveChat } from "@/lib/actions";
import { toast } from "sonner";

interface ChatItemProps {
  chatId: string;
  modelId: string;
  chatTitle: string;
  onDelete?: (chatId: string) => void;
  onArchive?: (chatId: string) => void;
}

const ChatItem = ({
  chatId,
  modelId,
  chatTitle,
  onDelete,
  onArchive,
}: ChatItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chatTitle);
  const pathName = usePathname();
  const isActive = pathName.includes(chatId);
  const { setOpenMobile, isMobile } = useSidebar();
  const router = useRouter();

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      setOpenMobile(false);
    }
    router.push(`/chat/${chatId}`);
  };

  const handleStartEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
    setIsOpen(false);
  };

  const handleSave = async () => {
    await renameChat(chatId, editedTitle.trim());
    setIsEditing(false);
    setEditedTitle(editedTitle.trim() || chatTitle); // Fallback to original title if empty
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedTitle(chatTitle); // Reset to original title
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dropdown from closing immediately
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteChat(chatId);
      onDelete?.(chatId);
      if (isActive) {
        router.push("/chat");
      }
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isArchiving) return;

    setIsArchiving(true);
    try {
      await archiveChat(chatId);
      onArchive?.(chatId);
      if (isActive) {
        router.push("/chat");
      }
    } catch {
      toast.error("Failed to archive chat");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Link
      href={`/chat/${chatId}`}
      onClick={handleChatClick}
      className={`flex items-center justify-between p-[6px] mt-0.5 rounded-md text-sm hover:bg-[#f0f0f1] dark:hover:bg-[#27272A] group/item ${
        isActive ? "bg-[#e1e1e1] dark:bg-[#27272A]" : ""
      }`}
    >
      {!isEditing ? (
        <div className="flex items-center gap-2 p-0.5 min-w-0 flex-1 focus:outline-none ml-1">
          {models.find((m) => m.id === modelId)?.icon && (
            <Image
              src={models.find((m) => m.id === modelId)!.icon}
              alt={models.find((m) => m.id === modelId)!.name}
              width={14}
              height={14}
              draggable={false}
              className={`flex-shrink-0 mr-1 ${
                models.find((m) => m.id === modelId)?.icon.includes("openai") ||
                models.find((m) => m.id === modelId)?.icon.includes("anthropic")
                  ? "dark:invert"
                  : ""
              }`}
            />
          )}
          <span className="truncate">{editedTitle}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-0.5 min-w-0 flex-1 focus:outline-none ml-1">
          {models.find((m) => m.id === modelId)?.icon && (
            <Image
              src={models.find((m) => m.id === modelId)!.icon}
              alt={models.find((m) => m.id === modelId)!.name}
              width={14}
              height={14}
              draggable={false}
              className={`flex-shrink-0 mr-1 ${
                models.find((m) => m.id === modelId)?.icon.includes("openai") ||
                models.find((m) => m.id === modelId)?.icon.includes("anthropic")
                  ? "dark:invert"
                  : ""
              }`}
            />
          )}
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#f5f5f5] dark:bg-[#3f3f46] px-2 py-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border border-gray-200 dark:border-gray-700"
            autoFocus
            placeholder="Enter chat title"
          />
        </div>
      )}

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={`p-1 focus:outline-none flex-shrink-0 opacity-0 ${
              isActive || isOpen ? "opacity-100" : ""
            } group-hover/item:opacity-100 transition-opacity duration-200 ease-in-out`}
          >
            <EllipsisIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[80px] mr-4 rounded-xl"
          side="right"
          align="start"
          sideOffset={-10}
          alignOffset={20}
          onClick={(e) => e.stopPropagation()}
        >
          {/* <DropdownMenuItem className="cursor-pointer rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-2">
              <ShareIcon className="size-3.5" />
              <span>Share</span>
            </div>
          </DropdownMenuItem> */}
          <DropdownMenuItem
            className="cursor-pointer rounded-xl p-2.5"
            onClick={handleStartEditing}
          >
            <div className="flex items-center justify-between gap-2">
              <PencilIcon className="size-3.5" />
              <span>Rename</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl p-2.5"
            onClick={handleArchive}
            disabled={isArchiving}
          >
            <div className="flex items-center justify-between gap-2">
              {isArchiving ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  <span>Archiving</span>
                </>
              ) : (
                <>
                  <ArchiveIcon className="size-3.5" />
                  <span>Archive</span>
                </>
              )}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl p-2.5"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <div className="flex items-center justify-between gap-2">
              {isDeleting ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  <span>Deleting</span>
                </>
              ) : (
                <>
                  <TrashIcon className="size-3.5 text-destructive" />
                  <span className="text-destructive">Delete</span>
                </>
              )}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  );
};

export default ChatItem;
