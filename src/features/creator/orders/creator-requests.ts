import pg from "pg"

export type CreatorRequestType = "custom_package" | "preselect_package"
export type CreatorRequestStatus = "pending" | "processing" | "accepted" | "rejected" | "completed"

export type CreatorRequestRow = {
  id: string
  request_type: CreatorRequestType
  creator_id: string
  requester_id: string
  package_id: string
  package_title: string
  package_price: number
  tokens_label: string
  status: CreatorRequestStatus
  created_at: string
  request_payload: unknown
  requester_profile_data: unknown | null
}

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

export async function fetchCreatorRequests(creatorId: string): Promise<CreatorRequestRow[]> {
  const connectionString = getConnectionString()
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL")
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const result = await client.query(
      `select
        r.id,
        r.request_type,
        r.creator_id,
        r.requester_id,
        r.package_id,
        r.package_title,
        r.package_price,
        r.tokens_label,
        r.status,
        r.created_at,
        r.request_payload,
        p.profile_data as requester_profile_data
      from public.requests r
      left join public.profiles p on p.id = r.requester_id
      where r.creator_id = $1
      order by r.created_at desc`,
      [creatorId]
    )

    return (result.rows ?? []) as CreatorRequestRow[]
  } finally {
    await client.end().catch(() => {})
  }
}

export async function updateCreatorRequestStatus(input: {
  requestId: string
  creatorId: string
  status: "accepted" | "rejected"
}) {
  const connectionString = getConnectionString()
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL")
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const result = await client.query(
      `update public.requests
       set status = $1
       where id = $2 and creator_id = $3
       returning id, status`,
      [input.status, input.requestId, input.creatorId]
    )

    if (!result.rows[0]) {
      throw new Error("Request not found.")
    }

    return result.rows[0] as { id: string; status: "accepted" | "rejected" }
  } finally {
    await client.end().catch(() => {})
  }
}
