import Link from "next/link";
import { Plus } from "lucide-react";
import { getInvoices } from "@/lib/actions/invoices";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { Button } from "@/components/ui/button";

export default async function InvoicesPage() {
  const [invoices, user] = await Promise.all([getInvoices(), getCurrentUser()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Factures & Devis</h1>
          <p className="text-sm text-muted-foreground">Gestion de la facturation</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="size-4" />
            Nouvelle facture / devis
          </Link>
        </Button>
      </div>
      <InvoicesTable invoices={invoices} organizationName={user.organization.name} />
    </div>
  );
}
