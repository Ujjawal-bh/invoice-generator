import type { InvoiceStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className:
      "border-transparent bg-muted text-muted-foreground dark:bg-muted/60",
  },
  sent: {
    label: "Sent",
    className: "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  paid: {
    label: "Paid",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  overdue: {
    label: "Overdue",
    className: "border-transparent bg-destructive/15 text-destructive",
  },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = styles[status];
  return (
    <Badge variant="outline" className={cn("capitalize", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}
