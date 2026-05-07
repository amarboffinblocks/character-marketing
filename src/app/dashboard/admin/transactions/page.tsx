import { TransactionsView } from "@/features/transactions/components/transactions-view"
import { fetchAdminTransactions } from "@/features/transactions/transactions-data"

export default async function AdminTransactionsPage() {
  const transactions = await fetchAdminTransactions()
  return <TransactionsView role="admin" initialTransactions={transactions} />
}
