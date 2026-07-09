import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
});

export const registerSchema = z.object({
  organizationName: z.string().min(2, "Le nom de l'entreprise est requis"),
  firstName: z.string().min(1, "Le prenom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
  currency: z.enum(["EUR", "USD", "XOF"]).default("EUR"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
