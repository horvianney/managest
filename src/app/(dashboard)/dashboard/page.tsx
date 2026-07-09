import { Wallet, TrendingDown, PiggyBank, Package } from "lucide-react";
import { getDashboardData } from "@/lib/actions/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ForecastChart } from "@/components/dashboard/forecast-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble de votre activite commerciale
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Chiffre d'affaires (mois)"
          value={formatCurrency(data.currentMonthCa, data.currency)}
          icon={Wallet}
          trend={data.caGrowth}
          accent="success"
        />
        <KpiCard
          title="Depenses (mois)"
          value={formatCurrency(data.currentMonthDepenses, data.currency)}
          icon={TrendingDown}
          accent="destructive"
        />
        <KpiCard
          title="Resultat net (mois)"
          value={formatCurrency(data.currentMonthNet, data.currency)}
          icon={PiggyBank}
          accent="primary"
        />
        <KpiCard
          title="Alertes de stock"
          value={String(data.stockAlerts.length)}
          icon={Package}
          accent="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={data.evolution} />
        </div>
        <StockAlerts alerts={data.stockAlerts} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ForecastChart data={data.forecast} />
        <CategoryChart data={data.topCategories} />
      </div>
    </div>
  );
}
