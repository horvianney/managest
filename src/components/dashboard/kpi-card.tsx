import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  accent?: "primary" | "success" | "destructive" | "accent";
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  accent: "bg-accent/10 text-accent",
};

export function KpiCard({ title, value, icon: Icon, trend, accent = "primary" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", accentMap[accent])}>
          <Icon className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
