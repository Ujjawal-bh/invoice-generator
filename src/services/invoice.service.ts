import { format } from "date-fns";

import type { InvoiceStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { computeInvoiceTotals, computeLineTotal } from "@/utils/invoice-calculations";
import { generateInvoiceNumber } from "@/utils/invoice-number";

export type InvoiceListFilters = {
  q?: string;
  status?: InvoiceStatus;
  clientId?: string;
  from?: Date;
  to?: Date;
};

export function listInvoices(userId: string, filters: InvoiceListFilters = {}) {
  const { q, status, clientId, from, to } = filters;

  return prisma.invoice.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
      ...(clientId ? { clientId } : {}),
      ...(from || to
        ? {
            invoiceDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { invoiceNumber: { contains: q, mode: "insensitive" } },
              {
                client: {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { companyName: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        select: { id: true, name: true, companyName: true, email: true },
      },
    },
  });
}

export async function getInvoiceForUser(userId: string, invoiceId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: {
      client: true,
      items: { orderBy: { id: "asc" } },
    },
  });
}

export async function countInvoicesToday(userId: string) {
  const prefix = format(new Date(), "yyyyMMdd");
  return prisma.invoice.count({
    where: {
      userId,
      invoiceNumber: { startsWith: `INV-${prefix}-` },
    },
  });
}

export async function createInvoiceWithItems(params: {
  userId: string;
  clientId: string;
  status: InvoiceStatus;
  invoiceDate: Date;
  dueDate: Date;
  taxPercent: number;
  notes?: string | null;
  items: { name: string; description?: string | null; quantity: number; rate: number }[];
}) {
  const { userId, clientId, status, invoiceDate, dueDate, taxPercent, notes, items } =
    params;

  const totals = computeInvoiceTotals(items, taxPercent);

  const countToday = await countInvoicesToday(userId);
  const invoiceNumber = await generateInvoiceNumber(userId, countToday);

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        userId,
        clientId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        status,
        taxPercent: new Prisma.Decimal(taxPercent.toFixed(4)),
        subtotal: new Prisma.Decimal(totals.subtotal.toFixed(2)),
        tax: new Prisma.Decimal(totals.tax.toFixed(2)),
        total: new Prisma.Decimal(totals.total.toFixed(2)),
        notes: notes ?? null,
        items: {
          create: items.map((item) => {
            const lineTotal = computeLineTotal(item);
            return {
              name: item.name,
              description: item.description ?? null,
              quantity: new Prisma.Decimal(item.quantity.toFixed(4)),
              rate: new Prisma.Decimal(item.rate.toFixed(2)),
              total: new Prisma.Decimal(lineTotal.toFixed(2)),
            };
          }),
        },
      },
    });
    return invoice;
  });
}

export async function updateInvoiceWithItems(params: {
  userId: string;
  invoiceId: string;
  clientId: string;
  status: InvoiceStatus;
  invoiceDate: Date;
  dueDate: Date;
  taxPercent: number;
  notes?: string | null;
  items: { name: string; description?: string | null; quantity: number; rate: number }[];
}) {
  const {
    userId,
    invoiceId,
    clientId,
    status,
    invoiceDate,
    dueDate,
    taxPercent,
    notes,
    items,
  } = params;

  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Invoice not found");
  }

  const totals = computeInvoiceTotals(items, taxPercent);

  await prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId } });

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId,
        status,
        invoiceDate,
        dueDate,
        taxPercent: new Prisma.Decimal(taxPercent.toFixed(4)),
        subtotal: new Prisma.Decimal(totals.subtotal.toFixed(2)),
        tax: new Prisma.Decimal(totals.tax.toFixed(2)),
        total: new Prisma.Decimal(totals.total.toFixed(2)),
        notes: notes ?? null,
        items: {
          create: items.map((item) => {
            const lineTotal = computeLineTotal(item);
            return {
              name: item.name,
              description: item.description ?? null,
              quantity: new Prisma.Decimal(item.quantity.toFixed(4)),
              rate: new Prisma.Decimal(item.rate.toFixed(2)),
              total: new Prisma.Decimal(lineTotal.toFixed(2)),
            };
          }),
        },
      },
    });
  });
}

export async function deleteInvoice(userId: string, invoiceId: string) {
  await prisma.invoice.deleteMany({
    where: { id: invoiceId, userId },
  });
}

export async function duplicateInvoice(userId: string, invoiceId: string) {
  const original = await getInvoiceForUser(userId, invoiceId);
  if (!original) {
    throw new Error("Invoice not found");
  }

  const lines = original.items.map((item) => ({
    name: item.name,
    description: item.description,
    quantity: Number(item.quantity.toString()),
    rate: Number(item.rate.toString()),
  }));

  return createInvoiceWithItems({
    userId,
    clientId: original.clientId,
    status: "draft",
    invoiceDate: new Date(),
    dueDate: original.dueDate,
    taxPercent: Number(original.taxPercent.toString()),
    notes: original.notes,
    items: lines,
  });
}
