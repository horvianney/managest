"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ForecastChartProps {
  data: { month: string; tresorerie: number }[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prevision de tresorerie</CardTitle>
        <CardDescription>Projection sur les 3 prochains mois</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3F51B5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3F51B5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="month" stroke="#607D8B" fontSize={12} />
            <YAxis stroke="#607D8B" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E0E0E0",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="tresorerie"
              name="Tresorerie estimee"
              stroke="#3F51B5"
              strokeWidth={2.5}
              fill="url(#forecastGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
