"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function getProfitAndLoss(startDate: string, endDate: string) {
  const user = await getCurrentUser();
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: user.organizationId,
      date: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    orderBy: { date: "asc" },
  });

  let revenue = 0;
  let expenses = 0;
  const byCategory = new Map<string, number>();

  for (const t of transactions) {
    const amount = Number(t.amountTTC);
    if (t.type === "SALE" || t.type === "INCOME") {
      revenue += amount;
    } else {
      expenses += amount;
    }
    const cat = t.category || "Non categorise";
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + amount);
  }

  return {
    organizationName: user.organization.name,
    currency: user.organization.currency,
    startDate,
    endDate,
    revenue,
    expenses,
    net: revenue - expenses,
    byCategory: Array.from(byCategory.entries()).map(([name, value]) => ({ name, value })),
    transactionCount: transactions.length,
  };
}

export async function getVatReport(startDate: string, endDate: string) {
  const user = await getCurrentUser();
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: user.organizationId,
      date: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    orderBy: { date: "asc" },
  });

  let vatCollected = 0;
  let vatDeductible = 0;

  const rows = transactions.map((t) => {
    const ht = Number(t.amountHT);
    const ttc = Number(t.amountTTC);
    const vat = ttc - ht;
    if (t.type === "SALE" || t.type === "INCOME") {
      vatCollected += vat;
    } else {
      vatDeductible += vat;
    }
    return {
      date: t.date,
      description: t.description,
      type: t.type,
      amountHT: ht,
      taxRate: Number(t.taxRate),
      vat,
    };
  });

  return {
    organizationName: user.organization.name,
    currency: user.organization.currency,
    startDate,
    endDate,
    vatCollected,
    vatDeductible,
    vatDue: vatCollected - vatDeductible,
    rows,
  };
}

export async function getStockReport() {
  const user = await getCurrentUser();
  const products = await prisma.product.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
  });

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.purchasePrice) * p.stockQuantity,
    0
  );

  return {
    organizationName: user.organization.name,
    currency: user.organization.currency,
    products: products.map((p) => ({
      sku: p.sku,
      name: p.name,
      stockQuantity: p.stockQuantity,
      stockThreshold: p.stockThreshold,
      purchasePrice: Number(p.purchasePrice),
      value: Number(p.purchasePrice) * p.stockQuantity,
      low: p.stockQuantity <= p.stockThreshold,
    })),
    totalValue,
  };
}
