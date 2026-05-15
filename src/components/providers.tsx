"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";

import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ThemeProvider>
        {children}
        <Toaster richColors closeButton position="top-center" />
      </ThemeProvider>
    </SessionProvider>
  );
}
