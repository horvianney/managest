import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(1, "Le SKU est requis"),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  stockThreshold: z.coerce.number().int().min(0).default(10),
  category: z.string().optional(),
});

export const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().positive("La quantite doit etre positive"),
  reason: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
