"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taxRateSchema } from "@/lib/validations/settings";
import { createTaxRate, deleteTaxRate } from "@/lib/actions/settings";

interface TaxRate {
  id: string;
  name: string;
  rate: unknown;
  isDefault: boolean;
}

export function TaxRatesPanel({ taxRates }: { taxRates: TaxRate[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", rate: "20" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = taxRateSchema.safeParse({ ...form, isDefault: false });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await createTaxRate(parsed.data);
      setForm({ name: "", rate: "20" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteTaxRate(id);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taux de TVA</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {taxRates.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.name}</span>
                {t.isDefault && <Badge>Defaut</Badge>}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{Number(t.rate)}%</Badge>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAdd} className="flex items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <Label>Nom</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Standard"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Taux (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.rate}
              onChange={(e) => setForm((p) => ({ ...p, rate: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            <Plus className="size-4" />
            Ajouter
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
