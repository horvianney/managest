import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";

function addHeader(doc: jsPDF, organizationName: string, title: string) {
  doc.setFontSize(18);
  doc.setTextColor("#1A237E");
  doc.text(organizationName, 14, 18);
  doc.setFontSize(13);
  doc.setTextColor("#263238");
  doc.text(title, 14, 28);
}

export function generateProfitAndLossPdf(data: {
  organizationName: string;
  currency: string;
  startDate: string;
  endDate: string;
  revenue: number;
  expenses: number;
  net: number;
  byCategory: { name: string; value: number }[];
}) {
  const doc = new jsPDF();
  addHeader(doc, data.organizationName, "Compte de resultat");

  doc.setFontSize(9);
  doc.setTextColor("#607D8B");
  doc.text(`Periode: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`, 14, 36);

  autoTable(doc, {
    startY: 44,
    head: [["Indicateur", "Montant"]],
    body: [
      ["Chiffre d'affaires", formatCurrency(data.revenue, data.currency)],
      ["Depenses", formatCurrency(data.expenses, data.currency)],
      ["Resultat net", formatCurrency(data.net, data.currency)],
    ],
    headStyles: { fillColor: [26, 35, 126] },
  });

  const y1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor("#1A237E");
  doc.text("Repartition par categorie", 14, y1);

  autoTable(doc, {
    startY: y1 + 6,
    head: [["Categorie", "Montant"]],
    body: data.byCategory.map((c) => [c.name, formatCurrency(c.value, data.currency)]),
    headStyles: { fillColor: [63, 81, 181] },
  });

  doc.save(`compte-de-resultat-${data.startDate}-${data.endDate}.pdf`);
}

export function generateVatReportPdf(data: {
  organizationName: string;
  currency: string;
  startDate: string;
  endDate: string;
  vatCollected: number;
  vatDeductible: number;
  vatDue: number;
  rows: { date: Date | string; description: string; type: string; amountHT: number; taxRate: number; vat: number }[];
}) {
  const doc = new jsPDF();
  addHeader(doc, data.organizationName, "Declaration de TVA");

  doc.setFontSize(9);
  doc.setTextColor("#607D8B");
  doc.text(`Periode: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`, 14, 36);

  autoTable(doc, {
    startY: 44,
    head: [["Indicateur", "Montant"]],
    body: [
      ["TVA collectee", formatCurrency(data.vatCollected, data.currency)],
      ["TVA deductible", formatCurrency(data.vatDeductible, data.currency)],
      ["TVA due", formatCurrency(data.vatDue, data.currency)],
    ],
    headStyles: { fillColor: [26, 35, 126] },
  });

  const y1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: y1,
    head: [["Date", "Description", "Type", "Montant HT", "Taux", "TVA"]],
    body: data.rows.map((r) => [
      formatDate(r.date),
      r.description,
      r.type,
      formatCurrency(r.amountHT, data.currency),
      `${r.taxRate}%`,
      formatCurrency(r.vat, data.currency),
    ]),
    headStyles: { fillColor: [63, 81, 181] },
    styles: { fontSize: 8 },
  });

  doc.save(`declaration-tva-${data.startDate}-${data.endDate}.pdf`);
}

export function generateStockReportPdf(data: {
  organizationName: string;
  currency: string;
  totalValue: number;
  products: {
    sku: string;
    name: string;
    stockQuantity: number;
    stockThreshold: number;
    purchasePrice: number;
    value: number;
    low: boolean;
  }[];
}) {
  const doc = new jsPDF();
  addHeader(doc, data.organizationName, "Rapport de stock");

  doc.setFontSize(9);
  doc.setTextColor("#607D8B");
  doc.text(`Valeur totale du stock: ${formatCurrency(data.totalValue, data.currency)}`, 14, 36);

  autoTable(doc, {
    startY: 44,
    head: [["SKU", "Produit", "Stock", "Seuil", "Prix achat", "Valeur"]],
    body: data.products.map((p) => [
      p.sku,
      p.name,
      p.low ? `${p.stockQuantity} (bas)` : String(p.stockQuantity),
      String(p.stockThreshold),
      formatCurrency(p.purchasePrice, data.currency),
      formatCurrency(p.value, data.currency),
    ]),
    headStyles: { fillColor: [26, 35, 126] },
    styles: { fontSize: 9 },
  });

  doc.save("rapport-de-stock.pdf");
}
