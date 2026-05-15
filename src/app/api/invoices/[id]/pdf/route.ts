import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdfBuffer } from "@/services/invoice-pdf";
import { getInvoiceForUser } from "@/services/invoice.service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await context.params;
    const invoice = await getInvoiceForUser(session.user.id, id);
    if (!invoice) {
      return new Response("Not found", { status: 404 });
    }

    const issuer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        companyName: true,
        companyEmail: true,
        companyPhone: true,
        companyAddress: true,
      },
    });

    if (!issuer) {
      return new Response("Unauthorized", { status: 401 });
    }

    const pdf = await buildInvoicePdfBuffer(invoice, issuer);

    const safeName = invoice.invoiceNumber.replace(/[^\w.-]+/g, "_");

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[pdf]", err);
    return new Response("PDF generation failed", { status: 500 });
  }
}
