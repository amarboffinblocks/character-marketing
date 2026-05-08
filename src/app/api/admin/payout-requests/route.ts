import { NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { resolvePersistedRole } from "@/lib/profile-role"
import { getStripeClient } from "@/lib/payments/stripe"
import {
  getPaymentsDbClient,
  readCreatorStripeAccountId,
  toStripeAmount,
  buildTransferGroup,
} from "@/lib/payments/escrow"
import { insertInboxNotification } from "@/lib/inbox-notifications"

export const runtime = "nodejs"

// GET /api/admin/payout-requests — list all pending payout requests
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await resolvePersistedRole(supabase, user) : null
  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from("payout_requests")
    .select("*, profiles!payout_requests_creator_id_fkey(id, profile_data)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ requests: data ?? [] })
}
