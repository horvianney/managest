import { getCustomers, createCustomer, deleteCustomer } from "@/lib/actions/customers";
import { NewPartyDialog } from "@/components/parties/new-party-dialog";
import { PartiesTable } from "@/components/parties/parties-table";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Clients</h1>
          <p className="text-sm text-muted-foreground">Vos fiches clients</p>
        </div>
        <NewPartyDialog
          triggerLabel="Nouveau client"
          dialogTitle="Nouveau client"
          onCreate={createCustomer}
        />
      </div>
      <PartiesTable
        parties={customers}
        emptyLabel="Aucun client pour le moment."
        onDelete={deleteCustomer}
      />
    </div>
  );
}
