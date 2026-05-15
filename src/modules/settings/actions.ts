"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import type { ActionResult } from "@/types/api";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().optional(),
  companyEmail: z
    .union([z.string().email("Enter a valid email"), z.literal("")])
    .optional(),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  defaultTaxPercent: z.coerce.number().min(0).max(100).optional(),
});

export async function updateProfileAction(
  userId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: d.name.trim(),
      companyName: d.companyName?.trim() || null,
      companyEmail: d.companyEmail?.trim() || null,
      companyPhone: d.companyPhone?.trim() || null,
      companyAddress: d.companyAddress?.trim() || null,
      ...(typeof d.defaultTaxPercent === "number"
        ? {
            defaultTaxPercent: new Prisma.Decimal(d.defaultTaxPercent.toFixed(4)),
          }
        : {}),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}
