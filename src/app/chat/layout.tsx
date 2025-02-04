import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import UserButton from "@/components/user-button";
import { auth } from "../auth";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarToggleText } from "@/components/sidebar-toggle-text";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    return redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2  px-4 pr-8">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="-ml-1" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="flex flex-col items-center">
                    <SidebarToggleText />
                    <div className="flex items-center text-sm text-gray-500 gap-0.5">
                      <span>⌘</span>
                      <span>B</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="text-sm sm:text-base">
            Data Fetching
          </Breadcrumb> */}
          </div>
          <div>
            <UserButton />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
