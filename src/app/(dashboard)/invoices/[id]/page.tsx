import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getInvoiceById } from "@/lib/actions/invoices";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";
import { Button } from "@/components/ui/button";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, user] = await Promise.all([getInvoiceById(id), getCurrentUser()]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            {invoice.type === "INVOICE" ? "Facture" : "Devis"} {invoice.invoiceNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            {invoice.customer ? invoice.customer.name : invoice.customerName}
          </p>
        </div>
      </div>
      <InvoiceDetail invoice={invoice} organizationName={user.organization.name} />
    </div>
  );
}
