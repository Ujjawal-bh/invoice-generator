import type { InvoiceStatus } from "@/generated/prisma/enums";

/** Plain shape safe to pass from Server → Client Components (no Prisma Decimal). */
export type SerializedInvoiceDetail = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  taxPercent: number;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  client: {
    name: string;
    companyName: string | null;
    email: string;
    phone: string | null;
    address: string | null;
  };
  items: {
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    rate: number;
    total: number;
  }[];
};

export type SerializedInvoiceListRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  client: {
    id: string;
    name: string;
    companyName: string | null;
  };
};

function dec(value: { toString(): string }): number {
  return Number(value.toString());
}

export function serializeInvoiceForDetail(invoice: {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  taxPercent: { toString(): string };
  subtotal: { toString(): string };
  tax: { toString(): string };
  total: { toString(): string };
  notes: string | null;
  client: {
    name: string;
    companyName: string | null;
    email: string;
    phone: string | null;
    address: string | null;
  };
  items: {
    id: string;
    name: string;
    description: string | null;
    quantity: { toString(): string };
    rate: { toString(): string };
    total: { toString(): string };
  }[];
}): SerializedInvoiceDetail {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
    taxPercent: dec(invoice.taxPercent),
    subtotal: dec(invoice.subtotal),
    tax: dec(invoice.tax),
    total: dec(invoice.total),
    notes: invoice.notes,
    client: { ...invoice.client },
    items: invoice.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: dec(item.quantity),
      rate: dec(item.rate),
      total: dec(item.total),
    })),
  };
}

export function serializeInvoiceForList(invoice: {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  total: { toString(): string };
  client: {
    id: string;
    name: string;
    companyName: string | null;
  };
}): SerializedInvoiceListRow {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
    total: dec(invoice.total),
    client: { ...invoice.client },
  };
}
