import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceLine {
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxRate: number | string;
  lineTotalTTC: number | string;
}

interface InvoiceData {
  invoiceNumber: string;
  type: string;
  customerName: string;
  issueDate: Date | string;
  dueDate?: Date | string | null;
  subtotalHT: number | string;
  taxAmount: number | string;
  totalTTC: number | string;
  currency: string;
  notes?: string | null;
  lines: InvoiceLine[];
  organizationName: string;
}

export function generateInvoicePdf(invoice: InvoiceData) {
  const doc = new jsPDF();
  const primary = "#1A237E";

  doc.setFontSize(20);
  doc.setTextColor(primary);
  doc.text(invoice.organizationName, 14, 20);

  doc.setFontSize(14);
  doc.setTextColor("#263238");
  doc.text(invoice.type === "INVOICE" ? "FACTURE" : "DEVIS", 14, 32);

  doc.setFontSize(10);
  doc.setTextColor("#607D8B");
  doc.text(`N°: ${invoice.invoiceNumber}`, 14, 40);
  doc.text(`Date: ${formatDate(invoice.issueDate)}`, 14, 46);
  if (invoice.dueDate) {
    doc.text(`Echeance: ${formatDate(invoice.dueDate)}`, 14, 52);
  }

  doc.setFontSize(11);
  doc.setTextColor("#263238");
  doc.text("Client:", 140, 40);
  doc.text(invoice.customerName, 140, 46);

  autoTable(doc, {
    startY: 62,
    head: [["Description", "Qte", "Prix unit.", "TVA %", "Total TTC"]],
    body: invoice.lines.map((l) => [
      l.description,
      String(l.quantity),
      formatCurrency(Number(l.unitPrice), invoice.currency),
      `${Number(l.taxRate)}%`,
      formatCurrency(Number(l.lineTotalTTC), invoice.currency),
    ]),
    headStyles: { fillColor: [26, 35, 126] },
    styles: { fontSize: 9 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.text(`Sous-total HT: ${formatCurrency(Number(invoice.subtotalHT), invoice.currency)}`, 140, finalY);
  doc.text(`TVA: ${formatCurrency(Number(invoice.taxAmount), invoice.currency)}`, 140, finalY + 6);
  doc.setFontSize(12);
  doc.setTextColor(primary);
  doc.text(`Total TTC: ${formatCurrency(Number(invoice.totalTTC), invoice.currency)}`, 140, finalY + 14);

  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setTextColor("#607D8B");
    doc.text("Notes:", 14, finalY + 25);
    doc.text(invoice.notes, 14, finalY + 31, { maxWidth: 180 });
  }

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
