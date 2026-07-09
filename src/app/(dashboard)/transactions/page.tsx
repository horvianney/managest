import { getTransactions } from "@/lib/actions/transactions";
import { NewTransactionDialog } from "@/components/transactions/new-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Ventes, achats, depenses et revenus
          </p>
        </div>
        <NewTransactionDialog />
      </div>
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
