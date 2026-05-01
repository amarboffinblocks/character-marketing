import { redirect } from "next/navigation"

import { TransactionsView } from "@/features/transactions/components/transactions-view"
import { fetchBuyerTransactions } from "@/features/transactions/transactions-data"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function SiteTransactionsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const transactions = await fetchBuyerTransactions(user.id)
  return <TransactionsView role="buyer" initialTransactions={transactions} />
}
