import { cookies } from "next/headers"

export type AccountRole = "creator" | "buyer"

export const ACCOUNT_ROLE_COOKIE = "cm_account_role"

export function parseAccountRole(value: string | undefined): AccountRole {
  if (value === "creator") return "creator"
  return "buyer"
}

/** Role for account pages (/profile, /orders, …). Visits under /dashboard/creator set the cookie to creator via middleware. */
export async function getAccountRole(): Promise<AccountRole> {
  const store = await cookies()
  return parseAccountRole(store.get(ACCOUNT_ROLE_COOKIE)?.value)
}
