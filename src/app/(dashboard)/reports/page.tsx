import { ReportsPanel } from "@/components/reports/reports-panel";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Rapports</h1>
        <p className="text-sm text-muted-foreground">
          Exports PDF pour votre comptabilite
        </p>
      </div>
      <ReportsPanel />
    </div>
  );
}
