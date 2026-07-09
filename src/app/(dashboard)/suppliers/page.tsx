import { getSuppliers, createSupplier, deleteSupplier } from "@/lib/actions/suppliers";
import { NewPartyDialog } from "@/components/parties/new-party-dialog";
import { PartiesTable } from "@/components/parties/parties-table";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Fournisseurs</h1>
          <p className="text-sm text-muted-foreground">Vos fiches fournisseurs</p>
        </div>
        <NewPartyDialog
          triggerLabel="Nouveau fournisseur"
          dialogTitle="Nouveau fournisseur"
          onCreate={createSupplier}
        />
      </div>
      <PartiesTable
        parties={suppliers}
        emptyLabel="Aucun fournisseur pour le moment."
        onDelete={deleteSupplier}
      />
    </div>
  );
}
