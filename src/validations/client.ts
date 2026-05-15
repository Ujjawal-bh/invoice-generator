import { z } from "zod";

export const clientUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type ClientUpsertInput = z.infer<typeof clientUpsertSchema>;
