"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteInvoice, updateInvoiceStatus } from "@/lib/actions/invoices";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";

type InvoiceLine = {
  description: string;
  quantity: unknown;
  unitPrice: unknown;
  taxRate: unknown;
  lineTotalTTC: unknown;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  customerName: string;
  issueDate: Date;
  dueDate: Date | null;
  subtotalHT: unknown;
  taxAmount: unknown;
  totalTTC: unknown;
  currency: string;
  notes: string | null;
  lines: InvoiceLine[];
};

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyee",
  PAID: "Payee",
  PARTIALLY_PAID: "Partiellement payee",
  OVERDUE: "En retard",
  CANCELLED: "Annulee",
};

const statusVariant: Record<string, "default" | "success" | "destructive" | "secondary"> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "success",
  PARTIALLY_PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "destructive",
};

export function InvoicesTable({
  invoices,
  organizationName,
}: {
  invoices: Invoice[];
  organizationName: string;
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteInvoice(id);
    router.refresh();
  }

  async function handleStatusChange(id: string, status: string) {
    await updateInvoiceStatus(id, status);
    router.refresh();
  }

  function handleDownload(invoice: Invoice) {
    generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      customerName: invoice.customerName,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotalHT: Number(invoice.subtotalHT),
      taxAmount: Number(invoice.taxAmount),
      totalTTC: Number(invoice.totalTTC),
      currency: invoice.currency,
      notes: invoice.notes,
      lines: invoice.lines.map((l) => ({
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        taxRate: Number(l.taxRate),
        lineTotalTTC: Number(l.lineTotalTTC),
      })),
      organizationName,
    });
  }

  if (invoices.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aucune facture ou devis pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Numero</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium text-right">Total TTC</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-secondary/50">
              <td className="px-4 py-3 font-medium">
                <Link href={`/invoices/${inv.id}`} className="hover:underline">
                  {inv.invoiceNumber}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">{inv.type === "INVOICE" ? "Facture" : "Devis"}</Badge>
              </td>
              <td className="px-4 py-3">{inv.customerName}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.issueDate)}</td>
              <td className="px-4 py-3 text-right font-medium">
                {formatCurrency(Number(inv.totalTTC), inv.currency)}
              </td>
              <td className="px-4 py-3">
                <Select value={inv.status} onValueChange={(v) => handleStatusChange(inv.id, v)}>
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue>
                      <Badge variant={statusVariant[inv.status]}>{statusLabels[inv.status]}</Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(inv)} aria-label="Telecharger PDF">
                    <Download className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)} aria-label="Supprimer">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
