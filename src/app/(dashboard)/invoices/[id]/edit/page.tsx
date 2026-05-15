import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { InvoiceEditor } from "@/modules/invoices/invoice-editor";
import { prisma } from "@/lib/prisma";
import { getInvoiceForUser } from "@/services/invoice.service";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const invoice = await getInvoiceForUser(userId, id);
  if (!invoice) {
    notFound();
  }

  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, companyName: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultTaxPercent: true },
  });

  const defaultTax = user?.defaultTaxPercent
    ? Number(user.defaultTaxPercent.toString())
    : 0;

  return (
    <InvoiceEditor
      userId={userId}
      clients={clients}
      defaultTaxPercent={defaultTax}
      mode="edit"
      initial={{
        id: invoice.id,
        clientId: invoice.clientId,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        taxPercent: Number(invoice.taxPercent.toString()),
        notes: invoice.notes,
        items: invoice.items.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: Number(item.quantity.toString()),
          rate: Number(item.rate.toString()),
        })),
      }}
    />
  );
}
