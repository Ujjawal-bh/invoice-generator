import { Suspense } from "react";

import { LoginForm } from "@/modules/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl && params.callbackUrl.startsWith("/")
      ? params.callbackUrl
      : "/dashboard";

  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading sign-in…</div>
      }
    >
      <LoginForm callbackUrl={callbackUrl} />
    </Suspense>
  );
}
