"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { searchChats } from "@/lib/actions";
import { models } from "@/lib/models";
import { useState, useEffect, useCallback } from "react";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { toast } from "sonner";
import debounce from "lodash/debounce";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      id: string;
      model: string;
      title: string | null;
      createdAt: Date;
    }[]
  >([]);
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    if (!open) {
      setSearchResults([]);
      setQuery("");
    }
  }, [open]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchChats(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching chats:", error);
        toast.error("Failed to search chats");
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-xs sm:max-w-md">
        <DialogTitle className="sr-only">Search chats</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-group]]:px-2">
          <CommandInput
            placeholder="Search chats"
            onValueChange={handleSearch}
            value={query}
            className="border-none focus:ring-0 h-12"
          />
          <CommandList>
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2Icon className="h-3 w-3 animate-spin" />
                  Searching
                </div>
              ) : query && searchResults.length === 0 ? (
                "No chats found"
              ) : searchResults.length > 0 ? (
                `Found ${searchResults.length} result${
                  searchResults.length === 1 ? "" : "s"
                }`
              ) : (
                <div className="py-6">Start typing to search</div>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2">
                {searchResults.map((chat) => {
                  const modelInfo = models.find((m) => m.id === chat.model);
                  return (
                    <button
                      key={chat.id}
                      onClick={() => {
                        router.push(`/chat/${chat.id}`);
                        onOpenChange(false);
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 relative text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {modelInfo?.icon && (
                          <Image
                            src={modelInfo.icon}
                            alt={modelInfo.name}
                            width={14}
                            height={14}
                            className={`flex-shrink-0 ${
                              modelInfo.icon.includes("openai") ||
                              modelInfo.icon.includes("anthropic")
                                ? "dark:invert"
                                : ""
                            }`}
                          />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium">
                            {chat.title || "Untitled Chat"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(chat.createdAt).toLocaleDateString()} ·{" "}
                            {modelInfo?.name}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
