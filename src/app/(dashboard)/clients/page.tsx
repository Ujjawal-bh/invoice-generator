import { auth } from "@/auth";
import { ClientsView } from "@/modules/clients/clients-view";
import { listClients } from "@/services/client.service";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const params = await searchParams;
  const clients = await listClients(userId, params.q?.trim() || undefined);

  return <ClientsView userId={userId} clients={clients} />;
}
