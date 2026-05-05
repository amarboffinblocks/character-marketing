import pg from "pg"

export type DeliverableAssetType = "character" | "persona" | "lorebook" | "avatar" | "background"

export type OrderDeliverableAsset = {
  assetType: DeliverableAssetType
  assetId: string
}

export type CreatorDeliverableOption = {
  assetType: DeliverableAssetType
  assetId: string
  title: string
  subtitle: string
  thumbnailUrl: string | null
}

export type OrderDeliverableSummary = {
  assetType: DeliverableAssetType
  assetId: string
  title: string
}

const ASSET_LABELS: Record<DeliverableAssetType, string> = {
  character: "Character",
  persona: "Persona",
  lorebook: "Lorebook",
  avatar: "Avatar",
  background: "Background",
}

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

export function getOrdersDbClient() {
  const connectionString = getConnectionString()
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL.")
  }

  return new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function isAssetType(value: string): value is DeliverableAssetType {
  return value === "character" || value === "persona" || value === "lorebook" || value === "avatar" || value === "background"
}

function mapOptionRows(
  assetType: DeliverableAssetType,
  rows: Array<Record<string, unknown>>
): CreatorDeliverableOption[] {
  return rows.map((row) => ({
    assetType,
    assetId: normalizeText(row.id),
    title:
      normalizeText(row.character_name) ||
      normalizeText(row.persona_name) ||
      normalizeText(row.lorebook_name) ||
      normalizeText(row.avatar_name) ||
      normalizeText(row.background_name) ||
      `${ASSET_LABELS[assetType]} asset`,
    subtitle:
      normalizeText(row.status) ||
      normalizeText(row.visibility) ||
      normalizeText(row.safety) ||
      ASSET_LABELS[assetType],
    thumbnailUrl:
      normalizeText(row.avatar_url) ||
      normalizeText(row.background_url) ||
      normalizeText(row.image_url) ||
      null,
  }))
}

export async function listCreatorDeliverableOptions(creatorId: string) {
  const client = getOrdersDbClient()
  try {
    await client.connect()
    const [characters, personas, lorebooks, avatars, backgrounds] = await Promise.all([
      client.query(
        `select id, character_name, avatar_url, background_url, visibility, safety, status
         from public.characters
         where creator_id = $1
         order by updated_at desc`,
        [creatorId]
      ),
      client.query(
        `select id, persona_name, avatar_url, visibility, safety
         from public.personas
         where creator_id = $1
         order by updated_at desc`,
        [creatorId]
      ),
      client.query(
        `select id, lorebook_name, avatar_url, visibility, safety
         from public.lorebooks
         where creator_id = $1
         order by updated_at desc`,
        [creatorId]
      ),
      client.query(
        `select id, avatar_name, image_url, visibility, safety, style
         from public.avatars
         where creator_id = $1
         order by updated_at desc`,
        [creatorId]
      ),
      client.query(
        `select id, background_name, image_url, visibility, safety, type
         from public.backgrounds
         where creator_id = $1
         order by updated_at desc`,
        [creatorId]
      ),
    ])

    return {
      character: mapOptionRows("character", characters.rows as Array<Record<string, unknown>>),
      persona: mapOptionRows("persona", personas.rows as Array<Record<string, unknown>>),
      lorebook: mapOptionRows("lorebook", lorebooks.rows as Array<Record<string, unknown>>),
      avatar: mapOptionRows("avatar", avatars.rows as Array<Record<string, unknown>>),
      background: mapOptionRows("background", backgrounds.rows as Array<Record<string, unknown>>),
    }
  } finally {
    await client.end().catch(() => {})
  }
}

function mapDeliverableRecord(assetType: DeliverableAssetType, record: Record<string, unknown>) {
  if (assetType === "character") {
    return {
      id: normalizeText(record.id),
      characterName: normalizeText(record.character_name),
      handle: normalizeText(record.handle),
      avatarUrl: normalizeText(record.avatar_url),
      backgroundUrl: normalizeText(record.background_url),
      visibility: normalizeText(record.visibility) || "private",
      safety: normalizeText(record.safety) || "SFW",
      tags: Array.isArray(record.tags) ? record.tags.filter((value): value is string => typeof value === "string") : [],
      description: normalizeText(record.description),
      scenario: normalizeText(record.scenario),
      personalitySummary: normalizeText(record.personality_summary),
      firstMessage: normalizeText(record.first_message),
      alternativeMessages: normalizeText(record.alternative_messages),
      exampleDialogue: normalizeText(record.example_dialogue),
      authorNotes: normalizeText(record.author_notes),
      characterNotes: normalizeText(record.character_notes),
      status: normalizeText(record.status) || "draft",
      updatedAt: "now",
      usageCount: Number(record.usage_count ?? 0) || 0,
    }
  }

  if (assetType === "persona") {
    return {
      id: normalizeText(record.id),
      personaName: normalizeText(record.persona_name),
      personaDetails: normalizeText(record.persona_details),
      avatarUrl: normalizeText(record.avatar_url),
      tags: Array.isArray(record.tags) ? record.tags.filter((value): value is string => typeof value === "string") : [],
      safety: normalizeText(record.safety) || "SFW",
      visibility: normalizeText(record.visibility) || "private",
      usageCount: Number(record.usage_count ?? 0) || 0,
      updatedAt: "now",
    }
  }

  if (assetType === "lorebook") {
    return {
      id: normalizeText(record.id),
      lorebookName: normalizeText(record.lorebook_name),
      description: normalizeText(record.description),
      avatarUrl: normalizeText(record.avatar_url),
      tags: Array.isArray(record.tags) ? record.tags.filter((value): value is string => typeof value === "string") : [],
      safety: normalizeText(record.safety) || "SFW",
      visibility: normalizeText(record.visibility) || "private",
      entries: Array.isArray(record.entries) ? record.entries : [],
      updatedAt: "now",
    }
  }

  if (assetType === "avatar") {
    return {
      id: normalizeText(record.id),
      avatarName: normalizeText(record.avatar_name),
      imageUrl: normalizeText(record.image_url),
      tags: Array.isArray(record.tags) ? record.tags.filter((value): value is string => typeof value === "string") : [],
      safety: normalizeText(record.safety) || "SFW",
      visibility: normalizeText(record.visibility) || "private",
      style: normalizeText(record.style) || "semi-real",
      notes: normalizeText(record.notes),
      updatedAt: "now",
    }
  }

  return {
    id: normalizeText(record.id),
    backgroundName: normalizeText(record.background_name),
    imageUrl: normalizeText(record.image_url),
    tags: Array.isArray(record.tags) ? record.tags.filter((value): value is string => typeof value === "string") : [],
    safety: normalizeText(record.safety) || "SFW",
    visibility: normalizeText(record.visibility) || "private",
    type: normalizeText(record.type) || "indoor",
    notes: normalizeText(record.notes),
    updatedAt: "now",
  }
}

async function validateCreatorOwnsAsset(
  client: pg.Client,
  creatorId: string,
  asset: OrderDeliverableAsset
) {
  const queries: Record<DeliverableAssetType, { table: string; nameColumn: string }> = {
    character: { table: "characters", nameColumn: "character_name" },
    persona: { table: "personas", nameColumn: "persona_name" },
    lorebook: { table: "lorebooks", nameColumn: "lorebook_name" },
    avatar: { table: "avatars", nameColumn: "avatar_name" },
    background: { table: "backgrounds", nameColumn: "background_name" },
  }
  const query = queries[asset.assetType]
  const result = await client.query(
    `select id, ${query.nameColumn} as title
     from public.${query.table}
     where id = $1 and creator_id = $2
     limit 1`,
    [asset.assetId, creatorId]
  )

  const row = result.rows[0] as { id: string; title: string } | undefined
  if (!row) {
    throw new Error(`Invalid ${asset.assetType} selected for delivery.`)
  }

  return { assetType: asset.assetType, assetId: row.id, title: row.title }
}

export async function replaceOrderDeliverables(input: {
  orderId: string
  creatorId: string
  assets: OrderDeliverableAsset[]
  deliveryNote: string
  /** Default `delivered`. Use `approved` when sending work straight to buyer review (escrow still pending). */
  targetOrderStatus?: "delivered" | "approved"
}) {
  const client = getOrdersDbClient()

  try {
    await client.connect()
    await client.query("begin")

    const orderResult = await client.query(
      `select id, buyer_id, creator_id, payment_status, status
       from public.orders
       where id = $1 and creator_id = $2
       for update`,
      [input.orderId, input.creatorId]
    )
    const order = orderResult.rows[0] as
      | {
          id: string
          buyer_id: string
          creator_id: string
          payment_status: string
          status: string
        }
      | undefined

    if (!order) {
      throw new Error("Order not found.")
    }

    if (order.payment_status !== "pending" && order.payment_status !== "paid") {
      throw new Error("Order must be funded in escrow before delivery.")
    }

    const normalizedAssets = input.assets.filter(
      (asset, index, current) =>
        asset.assetId &&
        isAssetType(asset.assetType) &&
        current.findIndex((candidate) => candidate.assetId === asset.assetId && candidate.assetType === asset.assetType) === index
    )

    if (normalizedAssets.length === 0 && input.targetOrderStatus !== "approved") {
      throw new Error("Select at least one asset to deliver.")
    }

    const validatedAssets = []
    for (const asset of normalizedAssets) {
      validatedAssets.push(await validateCreatorOwnsAsset(client, input.creatorId, asset))
    }

    await client.query(`delete from public.order_deliverables where order_id = $1`, [order.id])

    for (const asset of validatedAssets) {
      await client.query(
        `insert into public.order_deliverables
           (order_id, buyer_id, creator_id, asset_type, asset_id, asset_title, delivery_note)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          order.buyer_id,
          input.creatorId,
          asset.assetType,
          asset.assetId,
          asset.title,
          input.deliveryNote,
        ]
      )
    }

    const nextStatus = input.targetOrderStatus === "approved" ? "approved" : "delivered"
    await client.query(
      `update public.orders
       set status = $2, updated_at = now()
       where id = $1`,
      [order.id, nextStatus]
    )

    await client.query("commit")

    return {
      orderId: order.id,
      buyerId: order.buyer_id,
      deliverables: validatedAssets,
      paymentStatus: normalizeText(order.payment_status) || "pending",
    }
  } catch (error) {
    await client.query("rollback").catch(() => {})
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}

export async function fetchOrderDeliverablesForViewer(input: {
  orderId: string
  viewerId: string
}) {
  const client = getOrdersDbClient()
  try {
    await client.connect()

    const orderResult = await client.query(
      `select id, buyer_id, creator_id, status, payment_status
       from public.orders
       where id = $1 and (buyer_id = $2 or creator_id = $2)
       limit 1`,
      [input.orderId, input.viewerId]
    )
    const order = orderResult.rows[0] as
      | { id: string; buyer_id: string; creator_id: string; status: string; payment_status: string }
      | undefined

    if (!order) {
      throw new Error("Order not found.")
    }

    const result = await client.query(
      `select asset_type, asset_id, asset_title, delivery_note, created_at
       from public.order_deliverables
       where order_id = $1
       order by created_at desc, asset_type asc`,
      [order.id]
    )

    const deliverables = (result.rows ?? []).flatMap((row) => {
      const assetType = normalizeText(row.asset_type)
      if (!isAssetType(assetType)) return []
      return [
        {
          assetType,
          assetId: normalizeText(row.asset_id),
          title: normalizeText(row.asset_title),
        } satisfies OrderDeliverableSummary,
      ]
    })

    const deliveryNote =
      normalizeText((result.rows[0] as Record<string, unknown> | undefined)?.delivery_note) || ""

    return {
      order,
      deliverables,
      deliveryNote,
    }
  } finally {
    await client.end().catch(() => {})
  }
}

export async function fetchOrderDeliverableItemForViewer(input: {
  orderId: string
  viewerId: string
  assetType: string
  assetId: string
}) {
  if (!isAssetType(input.assetType)) {
    throw new Error("Invalid asset type.")
  }

  const client = getOrdersDbClient()
  try {
    await client.connect()

    const accessResult = await client.query(
      `select 1
       from public.orders o
       join public.order_deliverables d on d.order_id = o.id
       where o.id = $1
         and (o.buyer_id = $2 or o.creator_id = $2)
         and d.asset_type = $3
         and d.asset_id = $4
       limit 1`,
      [input.orderId, input.viewerId, input.assetType, input.assetId]
    )

    if (!accessResult.rows[0]) {
      throw new Error("Delivered asset not found.")
    }

    const queries: Record<DeliverableAssetType, string> = {
      character: `select * from public.characters where id = $1 limit 1`,
      persona: `select * from public.personas where id = $1 limit 1`,
      lorebook: `select * from public.lorebooks where id = $1 limit 1`,
      avatar: `select * from public.avatars where id = $1 limit 1`,
      background: `select * from public.backgrounds where id = $1 limit 1`,
    }

    const result = await client.query(queries[input.assetType], [input.assetId])
    const row = result.rows[0] as Record<string, unknown> | undefined
    if (!row) {
      throw new Error("Delivered asset not found.")
    }

    return mapDeliverableRecord(input.assetType, row)
  } finally {
    await client.end().catch(() => {})
  }
}

export async function transferOrderAssetsToBuyer(input: {
  orderId: string
  buyerId: string
  creatorId: string
}) {
  const client = getOrdersDbClient()
  try {
    await client.connect()
    await client.query("begin")

    const deliverablesResult = await client.query(
      `select asset_type, asset_id from public.order_deliverables where order_id = $1`,
      [input.orderId]
    )

    const deliverables = deliverablesResult.rows as Array<{ asset_type: string; asset_id: string }>
    
    for (const item of deliverables) {
      const assetType = normalizeText(item.asset_type)
      const assetId = normalizeText(item.asset_id)
      
      if (!isAssetType(assetType) || !assetId) continue

      const tableMap: Record<DeliverableAssetType, string> = {
        character: "characters",
        persona: "personas",
        lorebook: "lorebooks",
        avatar: "avatars",
        background: "backgrounds",
      }

      const table = tableMap[assetType]
      
      // Update owner_id to buyer, and set visibility to private by default for the buyer
      // unless it was already public, but usually commissions are private.
      await client.query(
        `update public.${table}
         set owner_id = $2, updated_at = now()
         where id = $1`,
        [assetId, input.buyerId]
      )
    }

    await client.query("commit")
  } catch (error) {
    await client.query("rollback").catch(() => {})
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}

