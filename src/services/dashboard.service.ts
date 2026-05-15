import { prisma } from "@/lib/prisma";

export async function getDashboardSummary(userId: string) {
  const [totalInvoices, revenueAgg, recentInvoices] = await Promise.all([
    prisma.invoice.count({ where: { userId } }),
    prisma.invoice.aggregate({
      where: { userId, status: "paid" },
      _sum: { total: true },
    }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        client: {
          select: { id: true, name: true, companyName: true },
        },
      },
    }),
  ]);

  return {
    totalInvoices,
    paidTotal: revenueAgg._sum.total,
    recentInvoices,
  };
}
