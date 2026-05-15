import { format } from "date-fns";

/** Generates a per-user unique-ish invoice number (INV-YYYYMMDD-####). */
export async function generateInvoiceNumber(
  userId: string,
  countForDay: number,
): Promise<string> {
  const prefix = format(new Date(), "yyyyMMdd");
  const seq = String(countForDay + 1).padStart(4, "0");
  return `INV-${prefix}-${seq}`;
}
