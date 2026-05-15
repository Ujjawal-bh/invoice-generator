"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientDeleteDialog } from "@/modules/clients/client-delete-dialog";
import { ClientFormDialog } from "@/modules/clients/client-form-dialog";
import { ClientsToolbar } from "@/modules/clients/clients-toolbar";

export type ClientRow = {
  id: string;
  name: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
};

export function ClientsView({
  userId,
  clients,
}: {
  userId: string;
  clients: ClientRow[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm">
            Organize customers you invoice most often.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add client
        </Button>
      </div>

      <ClientsToolbar />

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            {clients.length} client{clients.length === 1 ? "" : "s"} shown
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {clients.length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed py-12 text-center text-sm">
              No clients yet — add your first customer to start invoicing.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.companyName ?? "—"}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${c.name}`}
                          onClick={() => {
                            setEditing(c);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${c.name}`}
                          onClick={() => {
                            setDeleteTarget(c);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        userId={userId}
        initial={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                companyName: editing.companyName ?? "",
                email: editing.email,
                phone: editing.phone ?? "",
                address: editing.address ?? "",
              }
            : undefined
        }
      />

      <ClientDeleteDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeleteTarget(null);
        }}
        userId={userId}
        clientId={deleteTarget?.id ?? null}
        clientName={deleteTarget?.name ?? ""}
      />
    </div>
  );
}
