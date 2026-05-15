"use server";

import { revalidatePath } from "next/cache";

import type { InvoiceStatus } from "@/generated/prisma/enums";
import type { ActionResult } from "@/types/api";
import { prisma } from "@/lib/prisma";
import {
  createInvoiceWithItems,
  deleteInvoice,
  duplicateInvoice,
  updateInvoiceWithItems,
} from "@/services/invoice.service";
import { invoiceUpsertSchema } from "@/validations/invoice";

export async function createInvoiceAction(
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = invoiceUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const payload = parsed.data;

  const clientOk = await prisma.client.findFirst({
    where: { id: payload.clientId, userId },
    select: { id: true },
  });
  if (!clientOk) {
    return { success: false, error: "Selected client was not found" };
  }

  try {
    const invoice = await createInvoiceWithItems({
      userId,
      clientId: payload.clientId,
      status: payload.status as InvoiceStatus,
      invoiceDate: payload.invoiceDate,
      dueDate: payload.dueDate,
      taxPercent: payload.taxPercent,
      notes: payload.notes,
      items: payload.items.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        rate: i.rate,
      })),
    });

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { success: true, data: { id: invoice.id } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Could not create invoice" };
  }
}

export async function updateInvoiceAction(
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = invoiceUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const payload = parsed.data;
  if (!payload.id) {
    return { success: false, error: "Invoice id required" };
  }

  const clientOk = await prisma.client.findFirst({
    where: { id: payload.clientId, userId },
    select: { id: true },
  });
  if (!clientOk) {
    return { success: false, error: "Selected client was not found" };
  }

  try {
    await updateInvoiceWithItems({
      userId,
      invoiceId: payload.id,
      clientId: payload.clientId,
      status: payload.status as InvoiceStatus,
      invoiceDate: payload.invoiceDate,
      dueDate: payload.dueDate,
      taxPercent: payload.taxPercent,
      notes: payload.notes,
      items: payload.items.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        rate: i.rate,
      })),
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${payload.id}`);
    revalidatePath("/dashboard");
    return { success: true, data: { id: payload.id } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Could not update invoice" };
  }
}

export async function deleteInvoiceAction(
  userId: string,
  invoiceId: string,
): Promise<ActionResult> {
  await deleteInvoice(userId, invoiceId);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function duplicateInvoiceAction(
  userId: string,
  invoiceId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const invoice = await duplicateInvoice(userId, invoiceId);
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { success: true, data: { id: invoice.id } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Could not duplicate invoice" };
  }
}
