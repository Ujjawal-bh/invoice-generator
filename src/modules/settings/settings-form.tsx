"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/modules/settings/actions";

const settingsClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().optional(),
  companyEmail: z
    .union([z.string().email("Enter a valid email"), z.literal("")])
    .optional(),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  defaultTaxPercent: z.coerce.number().min(0).max(100).optional(),
});

type SettingsFormValues = z.infer<typeof settingsClientSchema>;

export function SettingsForm({
  userId,
  initial,
}: {
  userId: string;
  initial: {
    name: string;
    companyName: string | null;
    companyEmail: string | null;
    companyPhone: string | null;
    companyAddress: string | null;
    defaultTaxPercent: number | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(settingsClientSchema),
    defaultValues: {
      name: initial.name,
      companyName: initial.companyName ?? "",
      companyEmail: initial.companyEmail ?? "",
      companyPhone: initial.companyPhone ?? "",
      companyAddress: initial.companyAddress ?? "",
      defaultTaxPercent:
        typeof initial.defaultTaxPercent === "number"
          ? Number(initial.defaultTaxPercent)
          : 0,
    },
  });

  function submit(values: SettingsFormValues) {
    startTransition(async () => {
      const result = await updateProfileAction(userId, values);
      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, msgs]) => {
            const msg = msgs?.[0];
            if (!msg) return;
            form.setError(key as keyof SettingsFormValues, { message: msg });
          });
        }
        return;
      }
      toast.success("Company profile saved");
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Company profile</CardTitle>
        <CardDescription>
          These details appear at the top of generated invoice PDFs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" {...form.register("name")} />
            <p className="text-destructive text-xs">{form.formState.errors.name?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" {...form.register("companyName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Billing email</Label>
            <Input id="companyEmail" type="email" {...form.register("companyEmail")} />
            <p className="text-destructive text-xs">
              {form.formState.errors.companyEmail?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone">Phone</Label>
            <Input id="companyPhone" {...form.register("companyPhone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <Textarea id="companyAddress" rows={3} {...form.register("companyAddress")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultTaxPercent">Default tax percent</Label>
            <Input
              id="defaultTaxPercent"
              type="number"
              step="0.01"
              min={0}
              max={100}
              {...form.register("defaultTaxPercent", { valueAsNumber: true })}
            />
            <p className="text-muted-foreground text-xs">
              Prefills new invoices — you can override per invoice.
            </p>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
