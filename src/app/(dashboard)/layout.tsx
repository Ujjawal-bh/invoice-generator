import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AppShell userName={session?.user?.name} userEmail={session?.user?.email}>
      {children}
    </AppShell>
  );
}
