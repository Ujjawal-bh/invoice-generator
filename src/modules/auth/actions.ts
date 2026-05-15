"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import type { ActionResult } from "@/types/api";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validations/auth";

export async function registerUser(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.trim().toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return {
      success: false,
      error: "An account with this email already exists",
      fieldErrors: { email: ["Email already registered"] },
    };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      password: hashed,
    },
    select: { id: true },
  });

  return { success: true, data: { userId: user.id } };
}

export async function loginWithCredentials(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!result || (typeof result === "object" && "error" in result && result.error)) {
    redirect(`/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  redirect(callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
}
