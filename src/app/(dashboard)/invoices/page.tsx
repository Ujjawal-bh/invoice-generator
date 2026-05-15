import { auth } from "@/auth";
import { InvoicesView } from "@/modules/invoices/invoices-view";
import { listClients } from "@/services/client.service";
import { listInvoices } from "@/services/invoice.service";
import { parseInvoiceStatusParam } from "@/validations/invoice";
import { parseOptionalDate } from "@/utils/date";
import { serializeInvoiceForList } from "@/utils/serialize-invoice";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    clientId?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const params = await searchParams;
  const from = parseOptionalDate(params.from);
  let to = parseOptionalDate(params.to);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    to = end;
  }

  const invoices = await listInvoices(userId, {
    q: params.q?.trim() || undefined,
    status: parseInvoiceStatusParam(params.status),
    clientId: params.clientId || undefined,
    from,
    to,
  });

  const clients = await listClients(userId);

  return (
    <InvoicesView
      userId={userId}
      invoices={invoices.map(serializeInvoiceForList)}
      clients={clients.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
