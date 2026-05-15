"use client";

import { Copy, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteInvoiceAction,
  duplicateInvoiceAction,
} from "@/modules/invoices/actions";
import { InvoiceStatusBadge } from "@/modules/invoices/invoice-status-badge";
import { InvoicesToolbar } from "@/modules/invoices/invoices-toolbar";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/money";
import type { SerializedInvoiceListRow } from "@/utils/serialize-invoice";

export function InvoicesView({
  userId,
  invoices,
  clients,
}: {
  userId: string;
  invoices: SerializedInvoiceListRow[];
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteInvoiceAction(userId, id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Invoice deleted");
      router.refresh();
    });
  }

  function duplicate(id: string) {
    startTransition(async () => {
      const result = await duplicateInvoiceAction(userId, id);
      if (!result.success || !result.data?.id) {
        toast.error(!result.success ? result.error : "Duplicate failed");
        return;
      }
      toast.success("Invoice duplicated");
      router.push(`/invoices/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Track drafts, monitor collections, and export polished PDFs.
          </p>
        </div>
        <Link href="/invoices/new" className={cn(buttonVariants())}>
          New invoice
        </Link>
      </div>

      <InvoicesToolbar clients={clients} />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            {invoices.length} invoice{invoices.length === 1 ? "" : "s"} match your
            filters
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed py-12 text-center text-sm">
              No invoices yet — create your first invoice to populate this list.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Issued</TableHead>
                  <TableHead className="hidden md:table-cell">Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[52px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
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
                    <TableCell className="hidden md:table-cell">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(inv.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={pending}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                          )}
                          aria-label="Invoice actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}`)}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/invoices/${inv.id}/edit`)}
                          >
                            <Pencil className="mr-2 size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/api/invoices/${inv.id}/pdf`, "_blank")
                            }
                          >
                            <Download className="mr-2 size-4" /> PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicate(inv.id)}>
                            <Copy className="mr-2 size-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => remove(inv.id)}
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
