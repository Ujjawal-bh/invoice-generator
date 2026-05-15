import { prisma } from "@/lib/prisma";

export function listClients(userId: string, query?: string) {
  return prisma.client.findMany({
    where: {
      userId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { companyName: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getClient(userId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, userId },
  });
}
