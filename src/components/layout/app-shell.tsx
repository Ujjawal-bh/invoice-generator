"use client";

import {
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
          <ReceiptText className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">InvoiceKit</p>
          <p className="text-muted-foreground text-xs">SaaS MVP</p>
        </div>
      </div>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const initials =
    userName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="bg-muted/40 flex min-h-screen flex-col md:flex-row">
      <aside className="border-border bg-card hidden w-60 shrink-0 flex-col border-r md:flex">
        <SidebarNav />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-border bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "md:hidden",
              )}
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between gap-3">
            <p className="text-muted-foreground hidden text-sm md:block">
              Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}
            </p>
            <div className="flex items-center gap-2 md:ml-auto">
              <ThemeToggle />
              <div className="hidden items-center gap-2 sm:flex">
                <Avatar className="size-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-muted-foreground max-w-[180px] truncate text-xs">
                    {userEmail}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
