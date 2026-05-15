import PDFDocument from "pdfkit";

import type { getInvoiceForUser } from "@/services/invoice.service";
import { decimalToNumber, formatMoney } from "@/utils/money";

type InvoiceDetail = NonNullable<Awaited<ReturnType<typeof getInvoiceForUser>>>;

type Issuer = {
  name: string;
  companyName: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
};

export async function buildInvoicePdfBuffer(
  invoice: InvoiceDetail,
  issuer: Issuer,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: "LETTER", margin: 48 });

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(10);

    doc.fontSize(20).text("INVOICE", { align: "right" });
    doc.moveDown(0.25);
    doc.fontSize(11).fillColor("#333");
    const header = [issuer.companyName || issuer.name];
    if (issuer.companyAddress) header.push(issuer.companyAddress);
    const contactBits = [issuer.companyEmail, issuer.companyPhone].filter(Boolean);
    if (contactBits.length) header.push(contactBits.join(" · "));
    header.forEach((line) => doc.text(line, { align: "right" }));
    doc.fillColor("#000");

    doc.moveDown(2);

    doc.fontSize(12).text("Bill to", { underline: true });
    doc.moveDown(0.35);
    doc.fontSize(11);
    doc.text(invoice.client.name);
    if (invoice.client.companyName) doc.text(invoice.client.companyName);
    doc.text(invoice.client.email);
    if (invoice.client.phone) doc.text(invoice.client.phone);
    if (invoice.client.address) doc.text(invoice.client.address);

    doc.moveDown(1.25);
    doc.fontSize(10);
    doc.text(`Invoice number: ${invoice.invoiceNumber}`);
    doc.text(`Invoice date: ${invoice.invoiceDate.toLocaleDateString()}`);
    doc.text(`Due date: ${invoice.dueDate.toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown(1);

    doc.fontSize(11).text("Line items", { underline: true });
    doc.moveDown(0.5);

    invoice.items.forEach((item, idx) => {
      doc.fontSize(10).font("Helvetica-Bold").text(`${idx + 1}. ${item.name}`);
      doc.font("Helvetica");
      if (item.description) {
        doc.fillColor("#444").text(item.description);
        doc.fillColor("#000");
      }
      doc.text(
        `Qty ${decimalToNumber(item.quantity)} × ${formatMoney(decimalToNumber(item.rate))} → ${formatMoney(decimalToNumber(item.total))}`,
      );
      doc.moveDown(0.35);
    });

    doc.moveDown(0.75);
    doc.fontSize(11).text("Totals", { underline: true });
    doc.moveDown(0.35);
    doc.fontSize(10);
    doc.text(`Subtotal: ${formatMoney(decimalToNumber(invoice.subtotal))}`);
    doc.text(
      `Tax (${decimalToNumber(invoice.taxPercent)}%): ${formatMoney(decimalToNumber(invoice.tax))}`,
    );
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Total due: ${formatMoney(decimalToNumber(invoice.total))}`);
    doc.font("Helvetica").fontSize(10);

    if (invoice.notes) {
      doc.moveDown(1);
      doc.fontSize(11).text("Notes", { underline: true });
      doc.moveDown(0.35);
      doc.fontSize(10).text(invoice.notes);
    }

    doc.end();
  });
}
