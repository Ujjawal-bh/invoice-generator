export function decimalToNumber(value: number | { toString(): string }): number {
  return typeof value === "number" ? value : Number(value.toString());
}

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
