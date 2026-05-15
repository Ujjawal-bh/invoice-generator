import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SettingsForm } from "@/modules/settings/settings-form";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      companyName: true,
      companyEmail: true,
      companyPhone: true,
      companyAddress: true,
      defaultTaxPercent: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Brand your exports and tune defaults for brand-new invoices.
        </p>
      </div>
      <SettingsForm
        userId={userId}
        initial={{
          name: user.name,
          companyName: user.companyName,
          companyEmail: user.companyEmail,
          companyPhone: user.companyPhone,
          companyAddress: user.companyAddress,
          defaultTaxPercent: user.defaultTaxPercent
            ? Number(user.defaultTaxPercent.toString())
            : null,
        }}
      />
    </div>
  );
}
