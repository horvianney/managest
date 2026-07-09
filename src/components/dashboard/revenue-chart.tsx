"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  data: { month: string; ca: number; depenses: number; net: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution du chiffre d&apos;affaires</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="ca"
              name="Chiffre d'affaires"
              stroke="#00C853"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="depenses"
              name="Depenses"
              stroke="#D32F2F"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="net"
              name="Net"
              stroke="#1A237E"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
