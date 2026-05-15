import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvoiceEditor } from "@/modules/invoices/invoice-editor";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function NewInvoicePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const [clients, user] = await Promise.all([
    prisma.client.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, companyName: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { defaultTaxPercent: true },
    }),
  ]);

  if (clients.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Add a client first</CardTitle>
            <CardDescription>
              Every invoice needs a customer record before you can bill.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients" className={cn(buttonVariants())}>
              Go to clients
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultTax = user?.defaultTaxPercent
    ? Number(user.defaultTaxPercent.toString())
    : 0;

  return (
    <InvoiceEditor
      userId={userId}
      clients={clients}
      defaultTaxPercent={defaultTax}
      mode="create"
    />
  );
}
