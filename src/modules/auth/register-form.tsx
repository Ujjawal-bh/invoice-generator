"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { registerUser } from "@/modules/auth/actions";
import { registerSchema, type RegisterInput } from "@/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function submit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerUser(values);
      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, msgs]) => {
            const msg = msgs?.[0];
            if (!msg) return;
            form.setError(key as keyof RegisterInput, { message: msg });
          });
        }
        return;
      }
      toast.success("Account created — you can sign in now.");
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Create account</CardTitle>
        <CardDescription>
          Secure credential authentication with hashed passwords.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(submit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...form.register("name")} autoComplete="name" />
            <p className="text-destructive text-xs">
              {form.formState.errors.name?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              autoComplete="email"
            />
            <p className="text-destructive text-xs">
              {form.formState.errors.email?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              autoComplete="new-password"
            />
            <p className="text-muted-foreground text-xs">
              Minimum 8 characters with upper, lower, and numeric characters.
            </p>
            <p className="text-destructive text-xs">
              {form.formState.errors.password?.message}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : "Register"}
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
