"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrgSchema = z.object({
  supabaseUserId: z.string().uuid(),
  email: z.string().email(),
  organizationName: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  currency: z.enum(["EUR", "USD", "XOF"]).default("EUR"),
});

export async function createOrganizationForUser(
  input: z.infer<typeof createOrgSchema>
) {
  const parsed = createOrgSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (existing) {
    return { userId: existing.id, organizationId: existing.organizationId };
  }

  const organization = await prisma.organization.create({
    data: {
      name: parsed.organizationName,
      currency: parsed.currency,
      taxRates: {
        create: [
          { name: "Standard", rate: 20, isDefault: true },
          { name: "Reduit", rate: 10, isDefault: false },
          { name: "Super reduit", rate: 5.5, isDefault: false },
        ],
      },
      currencies: {
        create: [
          { code: "EUR", name: "Euro", symbol: "€", exchangeRate: 1, isDefault: parsed.currency === "EUR" },
          { code: "USD", name: "Dollar US", symbol: "$", exchangeRate: 1.08, isDefault: parsed.currency === "USD" },
          { code: "XOF", name: "Franc CFA", symbol: "CFA", exchangeRate: 655.96, isDefault: parsed.currency === "XOF" },
        ],
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      id: parsed.supabaseUserId,
      organizationId: organization.id,
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      role: "ADMIN",
    },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: organization.id,
      userId: user.id,
      action: "CREATE",
      entity: "Organization",
      entityId: organization.id,
      details: `Organisation "${organization.name}" creee`,
    },
  });

  return { userId: user.id, organizationId: organization.id };
}
