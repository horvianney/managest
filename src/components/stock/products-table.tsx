"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { deleteProduct } from "@/lib/actions/products";
import { StockMovementDialog } from "@/components/stock/stock-movement-dialog";

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  purchasePrice: unknown;
  salePrice: unknown;
  stockQuantity: number;
  stockThreshold: number;
};

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteProduct(id);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aucun produit pour le moment. Creez-en un pour commencer.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">Produit</th>
            <th className="px-4 py-3 font-medium">Categorie</th>
            <th className="px-4 py-3 font-medium text-right">Prix achat</th>
            <th className="px-4 py-3 font-medium text-right">Prix vente</th>
            <th className="px-4 py-3 font-medium text-right">Stock</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => {
            const low = p.stockQuantity <= p.stockThreshold;
            return (
              <tr key={p.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category ?? "-"}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(Number(p.purchasePrice))}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(Number(p.salePrice))}</td>
                <td className="px-4 py-3 text-right">
                  <Badge variant={low ? "destructive" : "success"}>
                    {p.stockQuantity} / {p.stockThreshold}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <StockMovementDialog productId={p.id} productName={p.name} />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} aria-label="Supprimer">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
