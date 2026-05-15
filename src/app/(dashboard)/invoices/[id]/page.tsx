import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { InvoiceDetail } from "@/modules/invoices/invoice-detail";
import { getInvoiceForUser } from "@/services/invoice.service";
import { serializeInvoiceForDetail } from "@/utils/serialize-invoice";

export default async function InvoiceDetailPage({
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

  return (
    <InvoiceDetail
      userId={userId}
      invoice={serializeInvoiceForDetail(invoice)}
    />
  );
}
