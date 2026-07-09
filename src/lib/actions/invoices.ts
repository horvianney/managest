"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { invoiceSchema } from "@/lib/validations/invoice";
import { generateInvoiceNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  const user = await getCurrentUser();
  return prisma.invoice.findMany({
    where: { organizationId: user.organizationId },
    include: { lines: true },
    orderBy: { issueDate: "desc" },
  });
}

export async function getInvoiceById(id: string) {
  const user = await getCurrentUser();
  return prisma.invoice.findFirst({
    where: { id, organizationId: user.organizationId },
    include: { lines: true, customer: true },
  });
}

export async function createInvoice(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = invoiceSchema.parse(formData);

  let subtotalHT = 0;
  let taxAmount = 0;
  const lines = parsed.lines.map((line) => {
    const lineTotalHT = line.quantity * line.unitPrice;
    const lineTax = lineTotalHT * (line.taxRate / 100);
    const lineTotalTTC = lineTotalHT + lineTax;
    subtotalHT += lineTotalHT;
    taxAmount += lineTax;
    return {
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxRate: line.taxRate,
      lineTotalHT,
      lineTotalTTC,
    };
  });
  const totalTTC = subtotalHT + taxAmount;

  const count = await prisma.invoice.count({
    where: { organizationId: user.organizationId, type: parsed.type },
  });
  const prefix = parsed.type === "INVOICE" ? "FAC" : "DEV";
  const invoiceNumber = generateInvoiceNumber(prefix, count + 1);

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: user.organizationId,
      invoiceNumber,
      type: parsed.type,
      status: "DRAFT",
      customerId: parsed.customerId || null,
      customerName: parsed.customerName,
      issueDate: new Date(parsed.issueDate),
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      subtotalHT,
      taxAmount,
      totalTTC,
      currency: parsed.currency,
      notes: parsed.notes || null,
      lines: { create: lines },
    },
    include: { lines: true },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "CREATE",
      entity: "Invoice",
      entityId: invoice.id,
      details: `${parsed.type === "INVOICE" ? "Facture" : "Devis"} ${invoice.invoiceNumber} creee pour ${invoice.customerName}`,
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return invoice;
}

export async function updateInvoiceStatus(id: string, status: string) {
  const user = await getCurrentUser();
  await prisma.invoice.updateMany({
    where: { id, organizationId: user.organizationId },
    data: { status: status as never },
  });
  revalidatePath("/invoices");
}

export async function deleteInvoice(id: string) {
  const user = await getCurrentUser();
  await prisma.invoice.deleteMany({
    where: { id, organizationId: user.organizationId },
  });
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}
