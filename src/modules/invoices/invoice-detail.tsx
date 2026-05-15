"use client";

import { Copy, Download, Pencil, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  deleteInvoiceAction,
  duplicateInvoiceAction,
} from "@/modules/invoices/actions";
import { InvoiceStatusBadge } from "@/modules/invoices/invoice-status-badge";
import { cn } from "@/lib/utils";
import type { SerializedInvoiceDetail } from "@/utils/serialize-invoice";
import { formatMoney } from "@/utils/money";

export function InvoiceDetail({
  userId,
  invoice,
}: {
  userId: string;
  invoice: SerializedInvoiceDetail;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const issued = new Date(invoice.invoiceDate);
  const due = new Date(invoice.dueDate);

  function printInvoice() {
    window.print();
  }

  function duplicate() {
    startTransition(async () => {
      const result = await duplicateInvoiceAction(userId, invoice.id);
      if (!result.success || !result.data?.id) {
        toast.error(!result.success ? result.error : "Duplicate failed");
        return;
      }
      toast.success("Draft duplicate created");
      router.push(`/invoices/${result.data.id}`);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteInvoiceAction(userId, invoice.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Invoice deleted");
      router.push("/invoices");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-muted-foreground text-sm">Invoice</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Pencil className="mr-2 size-4" /> Edit
          </Link>
          <Button variant="outline" type="button" onClick={printInvoice}>
            <Printer className="mr-2 size-4" /> Print
          </Button>
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            download={`${invoice.invoiceNumber}.pdf`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Download className="mr-2 size-4" /> PDF
          </a>
          <Button
            variant="secondary"
            type="button"
            onClick={duplicate}
            disabled={pending}
          >
            <Copy className="mr-2 size-4" /> Duplicate
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={remove}
            disabled={pending}
          >
            <Trash2 className="mr-2 size-4" /> Delete
          </Button>
        </div>
      </div>

      <Card id="invoice-print-root" className="print:shadow-none">
        <CardHeader className="print:hidden">
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Issued {issued.toLocaleDateString()} · Due {due.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="hidden print:block">
            <p className="text-xl font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-muted-foreground text-sm">
              Issued {issued.toLocaleDateString()} · Due {due.toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs uppercase">Client</p>
              <p className="font-medium">{invoice.client.name}</p>
              {invoice.client.companyName ? (
                <p className="text-sm">{invoice.client.companyName}</p>
              ) : null}
              <p className="text-sm">{invoice.client.email}</p>
              {invoice.client.phone ? (
                <p className="text-sm">{invoice.client.phone}</p>
              ) : null}
              {invoice.client.address ? (
                <p className="text-sm whitespace-pre-line">{invoice.client.address}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:text-right">
              <p className="text-muted-foreground text-xs uppercase">Amount due</p>
              <p className="text-3xl font-semibold">{formatMoney(invoice.total)}</p>
              <p className="text-muted-foreground text-sm">
                Tax {invoice.taxPercent}% · {formatMoney(invoice.tax)}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.description ? (
                      <div className="text-muted-foreground text-sm">{item.description}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(item.rate)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex w-full max-w-xs justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between">
              <span className="text-muted-foreground">
                Tax ({invoice.taxPercent}%)
              </span>
              <span>{formatMoney(invoice.tax)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(invoice.total)}</span>
            </div>
          </div>

          {invoice.notes ? (
            <div>
              <p className="text-muted-foreground text-xs uppercase">Notes</p>
              <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
