"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function ClientsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const debounced = useDebouncedValue(value, 350);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync input when URL `q` changes
    setValue(initial);
  }, [initial]);

  useEffect(() => {
    const q = debounced.trim();
    const current = searchParams.get("q") ?? "";
    if (q === current) return;

    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");

    router.replace(`/clients?${params.toString()}`, { scroll: false });
  }, [debounced, router, searchParams]);

  return (
    <div className="relative max-w-md">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search clients…"
        className="pl-9"
        aria-label="Search clients"
      />
    </div>
  );
}
