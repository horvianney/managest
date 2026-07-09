"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { organizationSchema, taxRateSchema, currencySchema } from "@/lib/validations/settings";
import { revalidatePath } from "next/cache";

export async function getSettingsData() {
  const user = await getCurrentUser();
  const [taxRates, currencies] = await Promise.all([
    prisma.taxRate.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { rate: "desc" },
    }),
    prisma.currency.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { code: "asc" },
    }),
  ]);

  return { organization: user.organization, taxRates, currencies };
}

export async function updateOrganization(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = organizationSchema.parse(formData);

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: {
      name: parsed.name,
      siret: parsed.siret || null,
      vatNumber: parsed.vatNumber || null,
      address: parsed.address || null,
      city: parsed.city || null,
      zipCode: parsed.zipCode || null,
      country: parsed.country || "France",
      currency: parsed.currency,
    },
  });

  revalidatePath("/settings");
}

export async function createTaxRate(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = taxRateSchema.parse(formData);

  await prisma.taxRate.create({
    data: {
      organizationId: user.organizationId,
      name: parsed.name,
      rate: parsed.rate,
      isDefault: parsed.isDefault,
    },
  });

  revalidatePath("/settings");
}

export async function deleteTaxRate(id: string) {
  const user = await getCurrentUser();
  await prisma.taxRate.deleteMany({
    where: { id, organizationId: user.organizationId },
  });
  revalidatePath("/settings");
}

export async function createCurrency(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = currencySchema.parse(formData);

  await prisma.currency.create({
    data: {
      organizationId: user.organizationId,
      code: parsed.code,
      name: parsed.name,
      symbol: parsed.symbol,
      exchangeRate: parsed.exchangeRate,
      isDefault: parsed.isDefault,
    },
  });

  revalidatePath("/settings");
}

export async function deleteCurrency(id: string) {
  const user = await getCurrentUser();
  await prisma.currency.deleteMany({
    where: { id, organizationId: user.organizationId },
  });
  revalidatePath("/settings");
}
