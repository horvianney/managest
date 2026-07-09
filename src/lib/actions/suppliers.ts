"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { partySchema } from "@/lib/validations/party";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  const user = await getCurrentUser();
  return prisma.supplier.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = partySchema.parse(formData);

  const supplier = await prisma.supplier.create({
    data: {
      organizationId: user.organizationId,
      name: parsed.name,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      city: parsed.city || null,
      zipCode: parsed.zipCode || null,
      country: parsed.country || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "CREATE",
      entity: "Supplier",
      entityId: supplier.id,
      details: `Fournisseur "${supplier.name}" cree`,
    },
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function deleteSupplier(id: string) {
  const user = await getCurrentUser();
  await prisma.supplier.deleteMany({
    where: { id, organizationId: user.organizationId },
  });
  revalidatePath("/suppliers");
}
