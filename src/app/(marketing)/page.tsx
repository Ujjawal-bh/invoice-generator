import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
            IK
          </span>
          <span className="font-semibold">InvoiceKit</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Log in
          </Link>
          <Link href="/register" className={cn(buttonVariants())}>
            Get started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-primary mb-4 text-sm font-medium tracking-wide uppercase">
            Invoice Generator MVP
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Ship polished invoices with dynamic line items and instant PDFs.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            A production-ready Next.js stack with Auth.js, Prisma, PostgreSQL, and a
            SaaS-grade dashboard for clients, invoices, and revenue insights.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Start free
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              View dashboard
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>CRM-lite directory with search.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Modal workflows for create, edit, and delete with optimistic routing.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Dynamic rows & smart totals.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Tax-aware calculations, statuses, history, and duplication.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>PDF export</CardTitle>
              <CardDescription>Professional deliverables.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Download branded invoices featuring your company profile.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
