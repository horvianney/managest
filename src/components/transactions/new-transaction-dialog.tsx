"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionSchema } from "@/lib/validations/transaction";
import { createTransaction } from "@/lib/actions/transactions";

const typeLabels: Record<string, string> = {
  SALE: "Vente",
  PURCHASE: "Achat",
  EXPENSE: "Depense",
  INCOME: "Revenu",
};

export function NewTransactionDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "SALE",
    description: "",
    amountHT: "",
    taxRate: "20",
    currency: "EUR",
    category: "",
    date: new Date().toISOString().slice(0, 10),
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = transactionSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await createTransaction(parsed.data);
      setOpen(false);
      setForm({
        type: "SALE",
        description: "",
        amountHT: "",
        taxRate: "20",
        currency: "EUR",
        category: "",
        date: new Date().toISOString().slice(0, 10),
      });
      router.refresh();
    } catch {
      setError("Erreur lors de la creation de la transaction.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nouvelle transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Type</Label>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Vente en ligne, achat fournisseur..."
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amountHT">Montant HT</Label>
              <Input
                id="amountHT"
                type="number"
                step="0.01"
                value={form.amountHT}
                onChange={(e) => update("amountHT", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="taxRate">TVA (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={form.taxRate}
                onChange={(e) => update("taxRate", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency">Devise</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="XOF">CFA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categorie</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Marketing, logistique..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creation..." : "Creer la transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
