"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteClientAction } from "@/modules/clients/actions";

export function ClientDeleteDialog({
  open,
  onOpenChange,
  userId,
  clientId,
  clientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  clientId: string | null;
  clientName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function confirm() {
    if (!clientId) return;
    startTransition(async () => {
      const result = await deleteClientAction(userId, clientId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Client deleted");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete client?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes{" "}
            <span className="text-foreground font-medium">{clientName}</span> from
            your directory. Invoices linked to this client remain stored.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={confirm}>
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
