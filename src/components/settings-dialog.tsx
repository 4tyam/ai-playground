"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Settings, UserPen, MessageSquare, Database, Cog, AppWindow, Shield, X, ChevronLeft, CircleUserIcon } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "./ui/separator"
import { useTheme } from "next-themes"

const sidebarItems = [
  { id: "general", icon: Cog, label: "General" },
  { id: "personalization", icon: UserPen, label: "Personalization" },
  { id: "connected-apps", icon: AppWindow, label: "Connected apps" },
  { id: "account", icon: CircleUserIcon, label: "Account" },
]

export function SettingsDialog() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
      if (window.innerWidth >= 640) {
        setShowSidebar(true)
      }
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleTabChange = (id: string) => {
    setActiveTab(id)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    setShowSidebar(true)
  }

  const renderTabContent = () => {
    // You can add different content for each tab here
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
                <SelectContent className="border-none rounded-xl" side="right" align="start">
                  <SelectItem className="rounded-lg" value="light">Light</SelectItem>
                  <SelectItem className="rounded-lg" value="dark">Dark</SelectItem>
                  <SelectItem className="rounded-lg" value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t pt-5">
              <Label>Archived chats</Label>
              <Button variant="outline" className="rounded-xl px-5 py-1 h-8">
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label>Archive all chats</Label>
              <Button variant="outline" className="rounded-xl px-5 py-1 h-8">
                Archive all
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label>Delete all chats</Label>
              <Button variant="destructive" className="rounded-xl px-5 py-1 h-8">
                Delete all
              </Button>
            </div>

            {/* <div className="flex items-center justify-between">
              <Label>Log out on this device</Label>
              <Button variant="outline" className="rounded-xl px-5 py-1 h-8">
                Log out
              </Button>
            </div> */}
          </>
        )
      case "personalization":
        return (
          <div className="flex items-center justify-between">
            <Label>Display name</Label>
            <Button variant="outline" className="rounded-full px-5 py-1 h-8">
              Edit
            </Button>
          </div>
        )
      // Add cases for other tabs as needed
      default:
        return (
          <div className="text-sm text-gray-500">
            Content for {activeTab} will be added here
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            setOpen(true)
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
              {!showSidebar ? sidebarItems.find(item => item.id === activeTab)?.label : 'Settings'}
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
              showSidebar ? 'flex' : 'hidden'
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

          <Separator orientation="vertical"/>

          {/* Content Area */}
          {(!showSidebar || !isMobile) && (
            <div className="flex-1 px-6 py-4 space-y-8 overflow-y-auto">
              {renderTabContent()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}