"use client"

import { SearchIcon, SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useEffect, useState } from "react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useRouter } from "next/navigation";

function SidebarTopNav() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const ButtonWithTooltip = ({ icon, onClick, tooltipContent }: {
    icon: React.ReactNode;
    onClick?: () => void;
    tooltipContent: React.ReactNode;
  }) => {
    const button = (
      <Button 
        variant="ghost"
        className="p-2 hover:bg-accent rounded-md"
        onClick={onClick}
      >
        {icon}
      </Button>
    );

    if (isMobile) return button;

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between pt-1.5 pl-2">
        <div>
          <span className="text-lg font-bold text-black dark:text-white">ai playground</span>
        </div>
        <div className="flex items-center">
          <ButtonWithTooltip 
            icon={<SearchIcon className="size-[18px]"/>}
            onClick={() => setOpen(true)}
            tooltipContent={
              <div className="flex flex-col items-center">
                Search chats
                <div className="flex items-center text-sm text-gray-500/80 gap-0.5">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>
            }
          />
          
          <ButtonWithTooltip 
            icon={<SquarePenIcon className="size-[18px]"/>}
            onClick={() => router.push('/chat')}
            tooltipContent={
              <div className="flex flex-col items-center">
                New chat
                {/* <div className="flex items-center text-sm text-gray-500/80 gap-0.5">
                  <span>⌘</span>
                  <span>N</span>
                </div> */}
              </div>
            }
          />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search commands</DialogTitle>
        <DialogDescription className="sr-only">
          Search through commands and pages using the command palette
        </DialogDescription>
        <CommandInput placeholder="Search chats" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Recents">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Docs</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
            <CommandItem>Billing</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default SidebarTopNav;