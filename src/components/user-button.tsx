import { auth, signOut } from "@/app/auth";
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

const UserButton = async () => {
  const session = await auth();

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="size-8">
            <AvatarImage src={session?.user?.image as string} />
            <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[230px] mr-4 rounded-xl">
          <ThemeToggle />
          <DropdownMenuItem className="p-2.5 cursor-pointer rounded-xl">
            <Sparkles className="mr-2" />
            Upgrade Plan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SettingsDialog />
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild className="p-2.5 cursor-pointer rounded-xl">
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="w-full flex items-center">
                <LogOut className="mr-2 size-4" />
                Log out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
