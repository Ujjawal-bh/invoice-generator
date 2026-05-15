"use client";

import { useSearchParams } from "next/navigation";

import { loginWithCredentials } from "@/modules/auth/actions";
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

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <Card className="w-full max-w-md border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
        <CardDescription>Sign in to manage invoices and clients.</CardDescription>
      </CardHeader>
      <form action={loginWithCredentials}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-destructive text-sm">
              Invalid email or password. Please try again.
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full">
            Continue
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            No account yet?{" "}
            <a href="/register" className="text-primary font-medium underline-offset-4 hover:underline">
              Create one
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
