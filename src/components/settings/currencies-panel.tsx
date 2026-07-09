"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencySchema } from "@/lib/validations/settings";
import { createCurrency, deleteCurrency } from "@/lib/actions/settings";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: unknown;
  isDefault: boolean;
}

export function CurrenciesPanel({ currencies }: { currencies: Currency[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ code: "", name: "", symbol: "", exchangeRate: "1" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = currencySchema.safeParse({ ...form, isDefault: false });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await createCurrency(parsed.data);
      setForm({ code: "", name: "", symbol: "", exchangeRate: "1" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteCurrency(id);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devises</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {currencies.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{c.code} - {c.name} ({c.symbol})</span>
                {c.isDefault && <Badge>Defaut</Badge>}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Taux: {Number(c.exchangeRate)}</Badge>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAdd} className="flex items-end gap-2 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <Label>Code</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="GBP"
              maxLength={3}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Nom</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Livre sterling"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Symbole</Label>
            <Input
              value={form.symbol}
              onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value }))}
              placeholder="£"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Taux de change</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.exchangeRate}
              onChange={(e) => setForm((p) => ({ ...p, exchangeRate: e.target.value }))}
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
