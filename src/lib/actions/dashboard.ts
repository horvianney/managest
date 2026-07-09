"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(date);
}

export async function getDashboardData() {
  const user = await getCurrentUser();
  const organizationId = user.organizationId;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [transactions, products] = await Promise.all([
    prisma.transaction.findMany({
      where: { organizationId, date: { gte: sixMonthsAgo } },
      orderBy: { date: "asc" },
    }),
    prisma.product.findMany({
      where: { organizationId },
    }),
  ]);

  const months: { key: string; label: string; ca: number; depenses: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    months.push({ key: monthKey(d), label: monthLabel(d), ca: 0, depenses: 0 });
  }

  for (const t of transactions) {
    const key = monthKey(new Date(t.date));
    const bucket = months.find((m) => m.key === key);
    if (!bucket) continue;
    const amount = Number(t.amountTTC);
    if (t.type === "SALE" || t.type === "INCOME") {
      bucket.ca += amount;
    } else {
      bucket.depenses += amount;
    }
  }

  const evolution = months.map((m) => ({
    month: m.label,
    ca: Math.round(m.ca * 100) / 100,
    depenses: Math.round(m.depenses * 100) / 100,
    net: Math.round((m.ca - m.depenses) * 100) / 100,
  }));

  const last3 = evolution.slice(-3);
  const avgNet = last3.reduce((sum, m) => sum + m.net, 0) / (last3.length || 1);
  const avgCa = last3.reduce((sum, m) => sum + m.ca, 0) / (last3.length || 1);

  const forecast = [];
  const lastMonthDate = new Date(sixMonthsAgo);
  lastMonthDate.setMonth(lastMonthDate.getMonth() + 5);
  for (let i = 1; i <= 3; i++) {
    const d = new Date(lastMonthDate);
    d.setMonth(d.getMonth() + i);
    forecast.push({
      month: monthLabel(d),
      tresorerie: Math.round((avgNet * i) * 100) / 100,
    });
  }

  const currentMonthCa = evolution[evolution.length - 1]?.ca ?? 0;
  const currentMonthDepenses = evolution[evolution.length - 1]?.depenses ?? 0;
  const currentMonthNet = currentMonthCa - currentMonthDepenses;

  const previousMonthCa = evolution[evolution.length - 2]?.ca ?? 0;
  const caGrowth =
    previousMonthCa > 0 ? ((currentMonthCa - previousMonthCa) / previousMonthCa) * 100 : 0;

  const stockAlerts = products
    .filter((p) => p.stockQuantity <= p.stockThreshold)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stockQuantity: p.stockQuantity,
      stockThreshold: p.stockThreshold,
    }));

  const categoryTotals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "SALE" && t.type !== "INCOME") continue;
    const cat = t.category || "Non categorise";
    categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + Number(t.amountTTC));
  }
  const topCategories = Array.from(categoryTotals.entries())
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    currentMonthCa,
    currentMonthDepenses,
    currentMonthNet,
    caGrowth,
    avgCa,
    evolution,
    forecast,
    stockAlerts,
    topCategories,
    currency: user.organization.currency,
  };
}
