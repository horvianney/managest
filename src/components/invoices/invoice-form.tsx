"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoiceSchema, type InvoiceLineInput } from "@/lib/validations/invoice";
import { createInvoice } from "@/lib/actions/invoices";
import { formatCurrency } from "@/lib/utils";

interface InvoiceFormProps {
  customers: { id: string; name: string }[];
}

const emptyLine: InvoiceLineInput = { description: "", quantity: 1, unitPrice: 0, taxRate: 20 };

export function InvoiceForm({ customers }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "INVOICE",
    customerName: "",
    customerId: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    currency: "EUR",
    notes: "",
  });
  const [lines, setLines] = useState<InvoiceLineInput[]>([{ ...emptyLine }]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateLine(index: number, field: keyof InvoiceLineInput, value: string) {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              [field]: field === "description" ? value : Number(value),
            }
          : line
      )
    );
  }

  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotalHT = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const taxAmount = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice * (l.taxRate / 100), 0);
  const totalTTC = subtotalHT + taxAmount;

  function handleCustomerSelect(customerId: string) {
    if (customerId === "none") {
      update("customerId", "");
      return;
    }
    const customer = customers.find((c) => c.id === customerId);
    setForm((prev) => ({
      ...prev,
      customerId,
      customerName: customer?.name ?? prev.customerName,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      ...form,
      customerId: form.customerId || null,
      dueDate: form.dueDate || undefined,
      lines,
    };

    const parsed = invoiceSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await createInvoice(parsed.data);
      router.push("/invoices");
      router.refresh();
    } catch {
      setError("Erreur lors de la creation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations generales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INVOICE">Facture</SelectItem>
                <SelectItem value="QUOTE">Devis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Devise</Label>
            <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="XOF">CFA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Client existant</Label>
            <Select value={form.customerId || "none"} onValueChange={handleCustomerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun (saisie libre)</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Nom du client</Label>
            <Input
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Date d&apos;emission</Label>
            <Input
              type="date"
              value={form.issueDate}
              onChange={(e) => update("issueDate", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Date d&apos;echeance</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Lignes</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="size-4" />
            Ajouter une ligne
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {lines.map((line, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5 flex flex-col gap-1.5">
                {index === 0 && <Label>Description</Label>}
                <Input
                  value={line.description}
                  onChange={(e) => updateLine(index, "description", e.target.value)}
                  placeholder="Produit ou service"
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                {index === 0 && <Label>Qte</Label>}
                <Input
                  type="number"
                  step="0.01"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, "quantity", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                {index === 0 && <Label>Prix unit.</Label>}
                <Input
                  type="number"
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(index, "unitPrice", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                {index === 0 && <Label>TVA %</Label>}
                <Input
                  type="number"
                  step="0.1"
                  value={line.taxRate}
                  onChange={(e) => updateLine(index, "taxRate", e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLine(index)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total HT</span>
            <span>{formatCurrency(subtotalHT, form.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA</span>
            <span>{formatCurrency(taxAmount, form.currency)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-primary">
            <span>Total TTC</span>
            <span>{formatCurrency(totalTTC, form.currency)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-1.5">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/invoices")}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creation..." : "Creer"}
        </Button>
      </div>
    </form>
  );
}
