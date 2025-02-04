"use client";

import { useSidebar } from "./ui/sidebar";

export function SidebarToggleText() {
  const { open } = useSidebar();
  return <>{open ? "Close Sidebar" : "Open Sidebar"}</>;
}
