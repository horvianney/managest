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
import { productSchema } from "@/lib/validations/product";
import { createProduct } from "@/lib/actions/products";

export function NewProductDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    purchasePrice: "0",
    salePrice: "0",
    stockQuantity: "0",
    stockThreshold: "10",
    category: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = productSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await createProduct(parsed.data);
      setOpen(false);
      setForm({
        sku: "",
        name: "",
        description: "",
        purchasePrice: "0",
        salePrice: "0",
        stockQuantity: "0",
        stockThreshold: "10",
        category: "",
      });
      router.refresh();
    } catch {
      setError("Erreur lors de la creation du produit (SKU peut-etre deja utilise).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nouveau produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau produit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={form.sku} onChange={(e) => update("sku", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Categorie</Label>
            <Input id="category" value={form.category} onChange={(e) => update("category", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="purchasePrice">Prix d&apos;achat</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => update("purchasePrice", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salePrice">Prix de vente</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => update("salePrice", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stockQuantity">Stock initial</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={form.stockQuantity}
                onChange={(e) => update("stockQuantity", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stockThreshold">Seuil d&apos;alerte</Label>
              <Input
                id="stockThreshold"
                type="number"
                value={form.stockThreshold}
                onChange={(e) => update("stockThreshold", e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creation..." : "Creer le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
