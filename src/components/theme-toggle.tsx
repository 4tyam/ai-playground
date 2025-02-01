"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DropdownMenuItem 
      className="p-2.5 cursor-pointer rounded-xl"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="mr-2 size-4" />
      ) : (
        <Sun className="mr-2 size-4" />
      )}
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </DropdownMenuItem>
  );
}
