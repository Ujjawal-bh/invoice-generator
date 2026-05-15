"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="rounded-full"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="dark:hidden h-[1.1rem] w-[1.1rem]" />
      <Moon className="hidden dark:inline h-[1.1rem] w-[1.1rem]" />
    </Button>
  );
}
