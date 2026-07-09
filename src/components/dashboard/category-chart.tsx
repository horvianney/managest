"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

const colors = ["#1A237E", "#3F51B5", "#00C853", "#607D8B", "#D32F2F"];

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top categories de ventes</CardTitle>
        <CardDescription>6 derniers mois</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Pas encore assez de donnees.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" stroke="#607D8B" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#607D8B" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E0E0E0",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
