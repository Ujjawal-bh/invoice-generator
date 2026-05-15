"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoiceStatuses } from "@/validations/invoice";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export type ClientFilterOption = { id: string; name: string };

export function InvoicesToolbar({ clients }: { clients: ClientFilterOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debouncedQ = useDebouncedValue(q, 350);

  const status = searchParams.get("status") ?? "";
  const clientId = searchParams.get("clientId") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync input when URL `q` changes
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const trimmed = debouncedQ.trim();
    const current = searchParams.get("q") ?? "";
    if (trimmed === current) return;

    const next = new URLSearchParams(searchParams.toString());
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");

    router.replace(`/invoices?${next.toString()}`, { scroll: false });
  }, [debouncedQ, router, searchParams]);

  function replaceParams(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, val]) => {
      if (!val) next.delete(key);
      else next.set(key, val);
    });
    router.replace(`/invoices?${next.toString()}`, { scroll: false });
  }

  function patchStatus(value: string | null) {
    if (value === null) return;
    replaceParams({ status: value === "__all__" ? "" : value });
  }

  function patchClient(value: string | null) {
    if (value === null) return;
    replaceParams({ clientId: value === "__all__" ? "" : value });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="relative min-w-[220px] flex-1">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search invoice # or client…"
          className="pl-9"
          aria-label="Search invoices"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Status</Label>
          <Select
            value={status || "__all__"}
            onValueChange={patchStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {invoiceStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Client</Label>
          <Select
            value={clientId || "__all__"}
            onValueChange={patchClient}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="from" className="text-xs">
            From
          </Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => replaceParams({ from: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to" className="text-xs">
            To
          </Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => replaceParams({ to: e.target.value })}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          className="lg:mb-0.5"
          onClick={() => router.replace("/invoices", { scroll: false })}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
