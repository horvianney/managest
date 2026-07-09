import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  currency: z.enum(["EUR", "USD", "XOF"]),
});

export const taxRateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  rate: z.coerce.number().min(0).max(100),
  isDefault: z.boolean().default(false),
});

export const currencySchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  symbol: z.string().min(1, "Le symbole est requis"),
  exchangeRate: z.coerce.number().positive(),
  isDefault: z.boolean().default(false),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type TaxRateInput = z.infer<typeof taxRateSchema>;
export type CurrencyInput = z.infer<typeof currencySchema>;
