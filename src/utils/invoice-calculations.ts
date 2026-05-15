export type InvoiceLineInput = {
  quantity: number;
  rate: number;
};

export function computeLineTotal(line: InvoiceLineInput): number {
  return roundMoney(line.quantity * line.rate);
}

export function computeInvoiceTotals(
  lines: InvoiceLineInput[],
  taxPercent: number,
): { subtotal: number; tax: number; total: number } {
  const subtotal = roundMoney(
    lines.reduce((sum, line) => sum + line.quantity * line.rate, 0),
  );
  const tax = roundMoney(subtotal * (taxPercent / 100));
  const total = roundMoney(subtotal + tax);
  return { subtotal, tax, total };
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
