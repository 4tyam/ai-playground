"use client";

import { SearchIcon, SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useRouter } from "next/navigation";
import { useSidebar } from "../ui/sidebar";
import Link from "next/link";
import { SearchDialog } from "@/components/search-dialog";

function SidebarTopNav() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  const ButtonWithTooltip = ({
    icon,
    onClick,
    tooltipContent,
  }: {
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
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between pt-1.5 pl-2">
        <div>
          <Link
            href="/chat"
            className="text-lg font-bold text-black dark:text-white"
          >
            ai playground
          </Link>
        </div>
        <div className="flex items-center">
          <ButtonWithTooltip
            icon={<SearchIcon className="size-[18px]" />}
            onClick={() => setOpen(true)}
            tooltipContent={
              <div className="flex flex-col items-center">
                Search chats
                <div className="flex items-center text-sm text-gray-500 gap-0.5">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>
            }
          />

          <ButtonWithTooltip
            icon={<SquarePenIcon className="size-[18px]" />}
            onClick={() => {
              router.push("/chat");
              if (isMobile) {
                setOpenMobile(false);
              }
            }}
            tooltipContent={
              <div className="flex flex-col items-center">New chat</div>
            }
          />
        </div>
      </div>

      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export default SidebarTopNav;
