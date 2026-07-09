"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
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
import { stockMovementSchema } from "@/lib/validations/product";
import { createStockMovement } from "@/lib/actions/products";

interface StockMovementDialogProps {
  productId: string;
  productName: string;
}

const typeLabels: Record<string, string> = {
  IN: "Entree",
  OUT: "Sortie",
  ADJUSTMENT: "Ajustement",
};

export function StockMovementDialog({ productId, productName }: StockMovementDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "IN", quantity: "1", reason: "" });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = stockMovementSchema.safeParse({ ...form, productId });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await createStockMovement(parsed.data);
      setOpen(false);
      setForm({ type: "IN", quantity: "1", reason: "" });
      router.refresh();
    } catch {
      setError("Erreur lors de l'enregistrement du mouvement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mouvement de stock">
          <ArrowUpDown className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mouvement de stock - {productName}</DialogTitle>
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
            <Label htmlFor="quantity">Quantite</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Raison</Label>
            <Input
              id="reason"
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              placeholder="Reappro, inventaire, casse..."
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
