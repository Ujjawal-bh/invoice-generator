"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import type { InvoiceStatus } from "@/generated/prisma/enums";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  invoiceUpsertSchema,
  invoiceStatuses,
  type InvoiceUpsertInput,
} from "@/validations/invoice";
import {
  computeInvoiceTotals,
  computeLineTotal,
  roundMoney,
} from "@/utils/invoice-calculations";
import { formatMoney } from "@/utils/money";
import {
  createInvoiceAction,
  updateInvoiceAction,
} from "@/modules/invoices/actions";

type ClientOption = { id: string; name: string; companyName: string | null };

export function InvoiceEditor({
  userId,
  clients,
  defaultTaxPercent,
  mode,
  initial,
}: {
  userId: string;
  clients: ClientOption[];
  defaultTaxPercent?: number | null;
  mode: "create" | "edit";
  initial?: {
    id: string;
    clientId: string;
    status: InvoiceStatus;
    invoiceDate: Date;
    dueDate: Date;
    taxPercent: number;
    notes: string | null;
    items: {
      name: string;
      description: string | null;
      quantity: number;
      rate: number;
    }[];
  };
}) {
  const router = useRouter();
  const taxDefault =
    typeof defaultTaxPercent === "number"
      ? Number(defaultTaxPercent)
      : typeof initial?.taxPercent === "number"
        ? initial.taxPercent
        : 0;

  const form = useForm({
    resolver: zodResolver(invoiceUpsertSchema),
    defaultValues:
      mode === "edit" && initial
        ? {
            id: initial.id,
            clientId: initial.clientId,
            status: initial.status,
            invoiceDate: format(initial.invoiceDate, "yyyy-MM-dd"),
            dueDate: format(initial.dueDate, "yyyy-MM-dd"),
            taxPercent: taxDefault,
            notes: initial.notes ?? "",
            items:
              initial.items.length > 0
                ? initial.items.map((i) => ({
                    name: i.name,
                    description: i.description ?? "",
                    quantity: i.quantity,
                    rate: i.rate,
                  }))
                : [
                    {
                      name: "",
                      description: "",
                      quantity: 1,
                      rate: 100,
                    },
                  ],
          }
        : {
            clientId: clients[0]?.id ?? "",
            status: "draft",
            invoiceDate: format(new Date(), "yyyy-MM-dd"),
            dueDate: format(
              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              "yyyy-MM-dd",
            ),
            taxPercent: taxDefault,
            notes: "",
            items: [{ name: "", description: "", quantity: 1, rate: 100 }],
          },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTax = form.watch("taxPercent");

  const previewTotals = useMemo(() => {
    const lines = (watchedItems ?? []).map((item) => ({
      quantity: Number(item.quantity) || 0,
      rate: Number(item.rate) || 0,
    }));
    return computeInvoiceTotals(lines, Number(watchedTax) || 0);
  }, [watchedItems, watchedTax]);

  async function onSubmit(values: InvoiceUpsertInput) {
    const payload = {
      ...values,
      invoiceDate: new Date(values.invoiceDate),
      dueDate: new Date(values.dueDate),
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
      items: values.items.map((item) => ({
        ...item,
        description: item.description?.trim() ? item.description.trim() : undefined,
      })),
    };

    const result =
      mode === "create"
        ? await createInvoiceAction(userId, payload)
        : await updateInvoiceAction(userId, payload);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([key, msgs]) => {
          const msg = msgs?.[0];
          if (!msg) return;
          form.setError(key as keyof InvoiceUpsertInput, { message: msg });
        });
      }
      return;
    }

    toast.success(mode === "create" ? "Invoice created" : "Invoice updated");
    router.push(`/invoices/${result.data?.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "New invoice" : "Edit invoice"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Dynamic line items, tax, and totals stay in sync as you type.
          </p>
        </div>
        <Link
          href="/invoices"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
          <CardDescription>
            Link the invoice to a client and manage billing dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client</Label>
            <Select
              value={form.watch("clientId") ?? ""}
              onValueChange={(v) => {
                if (v) form.setValue("clientId", v, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="clientId" className="w-full">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.companyName ? `${c.name} · ${c.companyName}` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-destructive text-xs">
              {form.formState.errors.clientId?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch("status") ?? "draft"}
              onValueChange={(v) => {
                if (v)
                  form.setValue("status", v as InvoiceStatus, {
                    shouldValidate: true,
                  });
              }}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {invoiceStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice date</Label>
            <Input id="invoiceDate" type="date" {...form.register("invoiceDate")} />
            <p className="text-destructive text-xs">
              {form.formState.errors.invoiceDate?.message as string | undefined}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" {...form.register("dueDate")} />
            <p className="text-destructive text-xs">
              {form.formState.errors.dueDate?.message}
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="taxPercent">Tax percent</Label>
            <Input
              id="taxPercent"
              type="number"
              step="0.01"
              min={0}
              {...form.register("taxPercent", { valueAsNumber: true })}
            />
            <p className="text-muted-foreground text-xs">
              Tax is calculated as subtotal × (tax percent ÷ 100).
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Line items</CardTitle>
            <CardDescription>Add at least one billable line.</CardDescription>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({ name: "", description: "", quantity: 1, rate: 100 })
            }
          >
            Add item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const itemValues = watchedItems?.[index];
            const linePreview =
              itemValues &&
              roundMoney(
                computeLineTotal({
                  quantity: Number(itemValues.quantity) || 0,
                  rate: Number(itemValues.rate) || 0,
                }),
              );

            return (
              <div
                key={field.id}
                className="border-border bg-muted/40 grid gap-3 rounded-xl border p-4 md:grid-cols-12"
              >
                <div className="md:col-span-4 space-y-2">
                  <Label>Name</Label>
                  <Input {...form.register(`items.${index}.name`)} />
                  <p className="text-destructive text-xs">
                    {form.formState.errors.items?.[index]?.name?.message}
                  </p>
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label>Description</Label>
                  <Input {...form.register(`items.${index}.description`)} />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...form.register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-destructive text-xs">
                    {form.formState.errors.items?.[index]?.quantity?.message}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...form.register(`items.${index}.rate`, {
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-destructive text-xs">
                    {form.formState.errors.items?.[index]?.rate?.message}
                  </p>
                </div>
                <div className="md:col-span-1 flex flex-col gap-2">
                  <Label>Line</Label>
                  <div className="text-sm font-medium pt-2">
                    {formatMoney(linePreview ?? 0)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive md:mt-auto"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <p className="text-destructive text-sm">
            {form.formState.errors.items?.root?.message ||
              form.formState.errors.items?.message}
          </p>

          <div className="flex flex-col items-end gap-1 border-t pt-4 text-sm">
            <div className="flex w-full max-w-xs justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatMoney(previewTotals.subtotal)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">{formatMoney(previewTotals.tax)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(previewTotals.total)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Create invoice"
                : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
