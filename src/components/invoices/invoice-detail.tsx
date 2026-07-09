"use client";

import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  id: string;
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

export function InvoiceDetail({
  invoice,
  organizationName,
}: {
  invoice: Invoice;
  organizationName: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    await deleteInvoice(invoice.id);
    router.push("/invoices");
    router.refresh();
  }

  async function handleStatusChange(status: string) {
    await updateInvoiceStatus(invoice.id, status);
    router.refresh();
  }

  function handleDownload() {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={invoice.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-48">
              <SelectValue>
                <Badge variant={statusVariant[invoice.status]}>
                  {statusLabels[invoice.status]}
                </Badge>
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
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="size-4" />
            Telecharger PDF
          </Button>
          <Button variant="outline" className="text-destructive" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{invoice.type === "INVOICE" ? "Facture" : "Devis"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Client</p>
            <p className="font-medium">{invoice.customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date d&apos;emission</p>
            <p className="font-medium">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date d&apos;echeance</p>
            <p className="font-medium">
              {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lignes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium text-right">Qte</th>
                  <th className="px-4 py-3 font-medium text-right">Prix unit.</th>
                  <th className="px-4 py-3 font-medium text-right">TVA %</th>
                  <th className="px-4 py-3 font-medium text-right">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3">{line.description}</td>
                    <td className="px-4 py-3 text-right">{Number(line.quantity)}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(Number(line.unitPrice), invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">{Number(line.taxRate)}%</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(Number(line.lineTotalTTC), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-5 sm:ml-auto sm:w-80">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total HT</span>
            <span>{formatCurrency(Number(invoice.subtotalHT), invoice.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA</span>
            <span>{formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-primary">
            <span>Total TTC</span>
            <span>{formatCurrency(Number(invoice.totalTTC), invoice.currency)}</span>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{invoice.notes}</CardContent>
        </Card>
      )}
    </div>
  );
}
