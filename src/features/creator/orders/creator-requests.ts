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
  order_id: string | null
}

function isMissingOrdersTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  )
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
    try {
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
          p.profile_data as requester_profile_data,
          o.id as order_id
        from public.requests r
        left join public.profiles p on p.id = r.requester_id
        left join public.orders o on o.request_id = r.id
        where r.creator_id = $1
        order by r.created_at desc`,
        [creatorId]
      )

      return (result.rows ?? []) as CreatorRequestRow[]
    } catch (error) {
      if (isMissingOrdersTableError(error)) {
        const fallbackResult = await client.query(
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
            p.profile_data as requester_profile_data,
            null::uuid as order_id
          from public.requests r
          left join public.profiles p on p.id = r.requester_id
          where r.creator_id = $1
          order by r.created_at desc`,
          [creatorId]
        )
        return (fallbackResult.rows ?? []) as CreatorRequestRow[]
      }
      throw error
    }
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
    await client.query("begin")

    const requestResult = await client.query(
      `select
        id,
        creator_id,
        requester_id,
        package_id,
        package_title,
        package_price,
        tokens_label,
        request_type,
        request_payload,
        status
       from public.requests
       where id = $1 and creator_id = $2
       for update`,
      [input.requestId, input.creatorId]
    )

    const requestRow = requestResult.rows[0] as
      | {
          id: string
          creator_id: string
          requester_id: string
          package_id: string
          package_title: string
          package_price: number
          tokens_label: string
          request_type: CreatorRequestType
          request_payload: unknown
          status: CreatorRequestStatus
        }
      | undefined

    if (!requestRow) {
      await client.query("rollback")
      throw new Error("Request not found.")
    }

    if (requestRow.status === "completed") {
      await client.query("rollback")
      throw new Error("Completed requests cannot be updated.")
    }

    if (input.status === "rejected") {
      if (requestRow.status === "rejected") {
        await client.query("commit")
        return {
          id: requestRow.id,
          status: "rejected",
        }
      }
      const result = await client.query(
        `update public.requests
         set status = 'rejected'
         where id = $1 and creator_id = $2
         returning id, status`,
        [input.requestId, input.creatorId]
      )
      await client.query("commit")
      return result.rows[0] as {
        id: string
        status: "accepted" | "rejected"
        orderId?: string
      }
    }

    if (requestRow.status === "accepted" || requestRow.status === "processing") {
      const existingOrderResult = await client.query(`select id from public.orders where request_id = $1`, [
        requestRow.id,
      ])
      await client.query("commit")
      return {
        id: requestRow.id,
        status: "accepted",
        orderId: existingOrderResult.rows[0]?.id as string | undefined,
      }
    }

    const acceptedRequestResult = await client.query(
      `update public.requests
       set status = 'accepted'
       where id = $1 and creator_id = $2
       returning id, status`,
      [input.requestId, input.creatorId]
    )

    const snapshot = {
      acceptedAt: new Date().toISOString(),
      requestType: requestRow.request_type,
      packageId: requestRow.package_id,
      packageTitle: requestRow.package_title,
      packagePrice: requestRow.package_price,
      tokensLabel: requestRow.tokens_label,
      requestPayload: requestRow.request_payload,
    }

    let insertOrderResult: pg.QueryResult
    try {
      insertOrderResult = await client.query(
        `insert into public.orders
          (request_id, buyer_id, creator_id, package_id, package_title, package_price, tokens_label, request_snapshot, status, payment_status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (request_id) do nothing
         returning id`,
        [
          requestRow.id,
          requestRow.requester_id,
          requestRow.creator_id,
          requestRow.package_id,
          requestRow.package_title,
          requestRow.package_price,
          requestRow.tokens_label,
          snapshot,
          "pending_payment",
          "unpaid",
        ]
      )
    } catch (error) {
      if (isMissingOrdersTableError(error)) {
        await client.query("rollback")
        throw new Error("Orders table is missing. Run database migrations before accepting requests.")
      }
      throw error
    }

    let orderId = insertOrderResult.rows[0]?.id as string | undefined
    if (!orderId) {
      const existingOrderResult = await client.query(`select id from public.orders where request_id = $1`, [
        requestRow.id,
      ])
      orderId = existingOrderResult.rows[0]?.id as string | undefined
    }

    await client.query("commit")
    return {
      ...(acceptedRequestResult.rows[0] as { id: string; status: "accepted" | "rejected" }),
      orderId,
    }
  } catch (error) {
    await client.query("rollback").catch(() => {})
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}
