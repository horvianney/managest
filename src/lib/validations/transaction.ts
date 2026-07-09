import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["SALE", "PURCHASE", "EXPENSE", "INCOME"]),
  description: z.string().min(1, "La description est requise"),
  amountHT: z.coerce.number().positive("Le montant doit etre positif"),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  currency: z.enum(["EUR", "USD", "XOF"]).default("EUR"),
  category: z.string().optional(),
  date: z.string().min(1, "La date est requise"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
