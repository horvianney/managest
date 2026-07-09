import { z } from "zod";

export const invoiceLineSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.coerce.number().positive("Quantite invalide"),
  unitPrice: z.coerce.number().min(0, "Prix invalide"),
  taxRate: z.coerce.number().min(0).max(100).default(20),
});

export const invoiceSchema = z.object({
  type: z.enum(["INVOICE", "QUOTE"]),
  customerName: z.string().min(1, "Le nom du client est requis"),
  customerId: z.string().uuid().optional().nullable(),
  issueDate: z.string().min(1, "La date est requise"),
  dueDate: z.string().optional(),
  currency: z.enum(["EUR", "USD", "XOF"]).default("EUR"),
  notes: z.string().optional(),
  lines: z.array(invoiceLineSchema).min(1, "Au moins une ligne est requise"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;
