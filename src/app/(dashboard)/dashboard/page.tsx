import Link from "next/link";

import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/modules/invoices/invoice-status-badge";
import { getDashboardSummary } from "@/services/dashboard.service";
import { cn } from "@/lib/utils";
import { decimalToNumber, formatMoney } from "@/utils/money";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const summary = await getDashboardSummary(userId);
  const revenue = summary.paidTotal
    ? decimalToNumber(summary.paidTotal)
    : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Snapshot of billing velocity and recently issued invoices.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/invoices/new" className={cn(buttonVariants())}>
            New invoice
          </Link>
          <Link href="/clients" className={cn(buttonVariants({ variant: "outline" }))}>
            Add client
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total invoices</CardDescription>
            <CardTitle className="text-4xl font-semibold">
              {summary.totalInvoices}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Includes every status across your workspace.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Paid revenue</CardDescription>
            <CardTitle className="text-4xl font-semibold">
              {formatMoney(revenue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Aggregated total field for invoices marked paid.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Recent activity</CardDescription>
            <CardTitle className="text-4xl font-semibold">
              {summary.recentInvoices.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Latest rows shown in the table below (max 8).
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Recent invoices</CardTitle>
            <CardDescription>Newest documents across your account.</CardDescription>
          </div>
          <Link
            href="/invoices"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {summary.recentInvoices.length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed py-12 text-center text-sm">
              No invoices yet —{" "}
              <Link href="/invoices/new" className="text-primary underline-offset-4 hover:underline">
                create your first one
              </Link>
              .
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recentInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{inv.client.name}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(decimalToNumber(inv.total))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
