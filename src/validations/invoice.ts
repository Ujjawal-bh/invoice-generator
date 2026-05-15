import { z } from "zod";

import type { InvoiceStatus } from "@/generated/prisma/enums";

export const invoiceStatuses = ["draft", "sent", "paid", "overdue"] as const;

export function parseInvoiceStatusParam(
  value: string | null | undefined,
): InvoiceStatus | undefined {
  if (!value) return undefined;
  return (invoiceStatuses as readonly string[]).includes(value)
    ? (value as InvoiceStatus)
    : undefined;
}

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  rate: z.coerce.number().positive("Rate must be greater than 0"),
});

export const invoiceUpsertSchema = z
  .object({
    id: z.string().optional(),
    clientId: z.string().min(1, "Select a client"),
    status: z.enum(invoiceStatuses),
    invoiceDate: z.coerce.date(),
    dueDate: z.coerce.date(),
    taxPercent: z.coerce.number().min(0, "Tax cannot be negative"),
    notes: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate < data.invoiceDate) {
      ctx.addIssue({
        code: "custom",
        message: "Due date cannot be before invoice date",
        path: ["dueDate"],
      });
    }
  });

export type InvoiceUpsertInput = z.infer<typeof invoiceUpsertSchema>;
