import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StockAlertsProps {
  alerts: { id: string; name: string; sku: string; stockQuantity: number; stockThreshold: number }[];
}

export function StockAlerts({ alerts }: StockAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          Alertes de stock
        </CardTitle>
        <CardDescription>Produits sous le seuil critique</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucune alerte, tous les stocks sont au bon niveau.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {a.sku}</p>
                </div>
                <Badge variant="destructive">
                  {a.stockQuantity} / {a.stockThreshold}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
