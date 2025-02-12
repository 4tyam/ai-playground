"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Settings,
  X,
  ChevronLeft,
  CircleUserIcon,
  Loader2Icon,
  ReceiptText,
  ChartColumnIncreasing,
  SettingsIcon,
} from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "./ui/separator";
import { useTheme } from "next-themes";
import { ArchivedChats } from "./archived-chats";
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
import { archiveAllChats, deleteAllChats } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AccountTab } from "./settings/account-tab";
import { BillingTab } from "./settings/billing-tab";
import UsageTab from "./settings/usage-tab";

const sidebarItems = [
  { id: "general", icon: SettingsIcon, label: "General" },
  { id: "usage", icon: ChartColumnIncreasing, label: "Usage" },
  { id: "billing", icon: ReceiptText, label: "Billing" },
  { id: "account", icon: CircleUserIcon, label: "Account" },
];

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [showArchiveAllConfirm, setShowArchiveAllConfirm] = useState(false);
  const [isArchivingAll, setIsArchivingAll] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) {
        setShowSidebar(true);
      }
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    setShowSidebar(true);
  };

  const handleArchiveAll = async () => {
    setIsArchivingAll(true);
    try {
      await archiveAllChats();
      toast.success("All chats archived");
      setShowArchiveAllConfirm(false);
      router.refresh();
    } catch {
      toast.error("Failed to archive chats");
    } finally {
      setIsArchivingAll(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllChats();
      toast.success("All chats deleted");
      setShowDeleteAllConfirm(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete chats");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <>
            <div className="flex items-center justify-between -mb-2 mt-2">
              <Label>Theme</Label>
              <Select
                defaultValue={theme}
                onValueChange={(value) => setTheme(value)}
              >
                <SelectTrigger className="w-[120px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="border-none rounded-xl"
                  side="right"
                  align="start"
                >
                  <SelectItem className="rounded-lg" value="light">
                    Light
                  </SelectItem>
                  <SelectItem className="rounded-lg" value="dark">
                    Dark
                  </SelectItem>
                  <SelectItem className="rounded-lg" value="system">
                    System
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t pt-5">
              <Label>Archived chats</Label>
              <Button
                variant="outline"
                className="rounded-xl px-5 py-1 h-8"
                onClick={() => setShowArchivedChats(true)}
              >
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label>Archive all chats</Label>
              <Button
                variant="outline"
                className="rounded-xl px-5 py-1 h-8"
                onClick={() => setShowArchiveAllConfirm(true)}
                disabled={isArchivingAll}
              >
                {isArchivingAll ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Archiving
                  </>
                ) : (
                  "Archive all"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label>Delete all chats</Label>
              <Button
                variant="destructive"
                className="rounded-xl px-5 py-1 h-8"
                onClick={() => setShowDeleteAllConfirm(true)}
                disabled={isDeletingAll}
              >
                {isDeletingAll ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Delete all"
                )}
              </Button>
            </div>
          </>
        );
      case "personalization":
        return (
          <div className="flex items-center justify-between">
            <Label>Display name</Label>
            <Button variant="outline" className="rounded-full px-5 py-1 h-8">
              Edit
            </Button>
          </div>
        );
      case "usage":
        return <UsageTab />;
      case "billing":
        return <BillingTab />;
      case "account":
        return <AccountTab />;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            className="p-2.5 cursor-pointer rounded-xl"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="max-w-xs sm:max-w-[600px] p-0 [&>button]:hidden rounded-2xl pb-4">
          <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden size-7 rounded-full"
                  onClick={() => setShowSidebar(true)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
              )}
              <DialogTitle>
                {!showSidebar
                  ? sidebarItems.find((item) => item.id === activeTab)?.label
                  : "Settings"}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </DialogHeader>

          <div className="flex max-h-[85vh] sm:max-h-[600px] overflow-hidden -mt-4">
            {/* Sidebar */}
            <div
              className={`${
                showSidebar ? "flex" : "hidden"
              } sm:flex w-full sm:w-52 flex-shrink-0 overflow-y-auto`}
            >
              <div className="w-full">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm ${
                      activeTab === item.id
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" />

            {/* Content Area */}
            {(!showSidebar || !isMobile) && (
              <div className="flex-1 px-6 py-4 space-y-8 overflow-y-auto">
                {renderTabContent()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ArchivedChats
        open={showArchivedChats}
        onOpenChange={setShowArchivedChats}
      />

      <AlertDialog
        open={showArchiveAllConfirm}
        onOpenChange={setShowArchiveAllConfirm}
      >
        <AlertDialogContent className="rounded-xl max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive all chats</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive all your chats. You can access them later in the
              archived chats section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={handleArchiveAll}
              disabled={isArchivingAll}
            >
              {isArchivingAll ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Archiving
                </>
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteAllConfirm}
        onOpenChange={setShowDeleteAllConfirm}
      >
        <AlertDialogContent className="rounded-xl max-w-xs sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your chats. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
            >
              {isDeletingAll ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Deleting
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
