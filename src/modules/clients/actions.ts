"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/types/api";
import { prisma } from "@/lib/prisma";
import { clientUpsertSchema } from "@/validations/client";

export async function upsertClientAction(
  userId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = clientUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  if (data.id) {
    const existing = await prisma.client.findFirst({
      where: { id: data.id, userId },
    });
    if (!existing) {
      return { success: false, error: "Client not found" };
    }

    const updated = await prisma.client.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        companyName: data.companyName?.trim() || null,
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
      },
      select: { id: true },
    });
    revalidatePath("/clients");
    return { success: true, data: { id: updated.id } };
  }

  const created = await prisma.client.create({
    data: {
      userId,
      name: data.name.trim(),
      companyName: data.companyName?.trim() || null,
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
    },
    select: { id: true },
  });

  revalidatePath("/clients");
  return { success: true, data: { id: created.id } };
}

export async function deleteClientAction(
  userId: string,
  clientId: string,
): Promise<ActionResult> {
  const result = await prisma.client.deleteMany({
    where: { id: clientId, userId },
  });

  if (result.count === 0) {
    return { success: false, error: "Client not found" };
  }

  revalidatePath("/clients");
  return { success: true, data: undefined };
}
