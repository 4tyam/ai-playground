"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut, Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SettingsDialog } from "./settings-dialog";
import { useState } from "react";
import { PricingModal } from "./pricing-modal";

interface UserButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const UserButton = ({ user }: UserButtonProps) => {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="size-8">
            <AvatarImage src={user?.image as string} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[230px] mr-4 rounded-xl">
          <ThemeToggle />
          <SettingsDialog />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowPricing(true)}
            className="p-2.5 cursor-pointer rounded-xl"
          >
            <Sparkles className="mr-2" />
            Upgrade Plan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="p-2.5 cursor-pointer rounded-xl"
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PricingModal open={showPricing} onOpenChange={setShowPricing} />
    </div>
  );
};

export default UserButton;
