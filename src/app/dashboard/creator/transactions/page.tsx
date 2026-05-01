import { redirect } from "next/navigation"

import { TransactionsView } from "@/features/transactions/components/transactions-view"
import { fetchCreatorTransactions } from "@/features/transactions/transactions-data"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function CreatorTransactionsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const transactions = await fetchCreatorTransactions(user.id)
  return <TransactionsView role="creator" initialTransactions={transactions} />
}
