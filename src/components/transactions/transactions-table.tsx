"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteTransaction } from "@/lib/actions/transactions";

type Transaction = {
  id: string;
  type: string;
  description: string;
  amountHT: unknown;
  amountTTC: unknown;
  currency: string;
  category: string | null;
  date: Date;
};

const typeVariant: Record<string, "success" | "destructive" | "default"> = {
  SALE: "success",
  INCOME: "success",
  PURCHASE: "destructive",
  EXPENSE: "destructive",
};

const typeLabels: Record<string, string> = {
  SALE: "Vente",
  PURCHASE: "Achat",
  EXPENSE: "Depense",
  INCOME: "Revenu",
};

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    router.refresh();
  }

  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aucune transaction pour le moment. Creez-en une pour commencer.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Categorie</th>
            <th className="px-4 py-3 font-medium text-right">Montant HT</th>
            <th className="px-4 py-3 font-medium text-right">Montant TTC</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-secondary/50">
              <td className="px-4 py-3">{formatDate(t.date)}</td>
              <td className="px-4 py-3">
                <Badge variant={typeVariant[t.type] ?? "default"}>
                  {typeLabels[t.type] ?? t.type}
                </Badge>
              </td>
              <td className="px-4 py-3">{t.description}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.category ?? "-"}</td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(Number(t.amountHT), t.currency)}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatCurrency(Number(t.amountTTC), t.currency)}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(t.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
