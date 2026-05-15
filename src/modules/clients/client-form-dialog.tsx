"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertClientAction } from "@/modules/clients/actions";
import {
  clientUpsertSchema,
  type ClientUpsertInput,
} from "@/validations/client";

export function ClientFormDialog({
  open,
  onOpenChange,
  userId,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initial?: ClientUpsertInput & { id: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<ClientUpsertInput>({
    resolver: zodResolver(clientUpsertSchema),
    values: initial
      ? {
          id: initial.id,
          name: initial.name,
          companyName: initial.companyName ?? "",
          email: initial.email,
          phone: initial.phone ?? "",
          address: initial.address ?? "",
        }
      : {
          name: "",
          companyName: "",
          email: "",
          phone: "",
          address: "",
        },
  });

  function submit(values: ClientUpsertInput) {
    startTransition(async () => {
      const result = await upsertClientAction(userId, values);
      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, msgs]) => {
            const msg = msgs?.[0];
            if (!msg) return;
            form.setError(key as keyof ClientUpsertInput, { message: msg });
          });
        }
        return;
      }
      toast.success(initial ? "Client updated" : "Client added");
      onOpenChange(false);
      form.reset();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit client" : "Add client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="client-name">Name *</Label>
            <Input id="client-name" {...form.register("name")} />
            <p className="text-destructive text-xs">
              {form.formState.errors.name?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-company">Company</Label>
            <Input id="client-company" {...form.register("companyName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-email">Email *</Label>
            <Input id="client-email" type="email" {...form.register("email")} />
            <p className="text-destructive text-xs">
              {form.formState.errors.email?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-phone">Phone</Label>
            <Input id="client-phone" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-address">Address</Label>
            <Textarea id="client-address" rows={3} {...form.register("address")} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
