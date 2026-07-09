"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { partySchema } from "@/lib/validations/party";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  const user = await getCurrentUser();
  return prisma.customer.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createCustomer(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = partySchema.parse(formData);

  const customer = await prisma.customer.create({
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
      entity: "Customer",
      entityId: customer.id,
      details: `Client "${customer.name}" cree`,
    },
  });

  revalidatePath("/customers");
  return customer;
}

export async function deleteCustomer(id: string) {
  const user = await getCurrentUser();
  await prisma.customer.deleteMany({
    where: { id, organizationId: user.organizationId },
  });
  revalidatePath("/customers");
}
