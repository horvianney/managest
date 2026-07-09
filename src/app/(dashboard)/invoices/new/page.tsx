import { getCustomers } from "@/lib/actions/customers";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function NewInvoicePage() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Nouvelle facture / devis</h1>
        <p className="text-sm text-muted-foreground">
          Renseignez les informations et les lignes de facturation
        </p>
      </div>
      <InvoiceForm customers={customers} />
    </div>
  );
}
