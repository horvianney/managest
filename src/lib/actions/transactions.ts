"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { transactionSchema } from "@/lib/validations/transaction";
import { revalidatePath } from "next/cache";

export async function createTransaction(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = transactionSchema.parse(formData);

  const amountTTC = parsed.amountHT * (1 + parsed.taxRate / 100);

  const transaction = await prisma.transaction.create({
    data: {
      organizationId: user.organizationId,
      type: parsed.type,
      description: parsed.description,
      amountHT: parsed.amountHT,
      taxRate: parsed.taxRate,
      amountTTC,
      currency: parsed.currency,
      category: parsed.category,
      date: new Date(parsed.date),
    },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "CREATE",
      entity: "Transaction",
      entityId: transaction.id,
      details: `Transaction "${transaction.description}" creee (${amountTTC.toFixed(2)} ${parsed.currency})`,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return transaction;
}

export async function deleteTransaction(id: string) {
  const user = await getCurrentUser();

  await prisma.transaction.deleteMany({
    where: { id, organizationId: user.organizationId },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "DELETE",
      entity: "Transaction",
      entityId: id,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function getTransactions() {
  const user = await getCurrentUser();

  return prisma.transaction.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { date: "desc" },
  });
}
