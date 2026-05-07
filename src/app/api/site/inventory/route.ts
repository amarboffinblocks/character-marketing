import { NextResponse } from "next/server"
import pg from "pg"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function getConnectionString() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL
}

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get("id")
  const categoryType = searchParams.get("category")

  const connectionString = getConnectionString()
  if (!connectionString) {
    return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()

    if (categoryId && categoryType) {
      const detailQuery = `
        select 
          d.asset_type as category,
          d.asset_id as original_id,
          coalesce(d.cloned_asset_id, d.asset_id) as actual_id,
          d.created_at,
          d.order_id,
          d.creator_id,
          p.profile_data
        from public.order_deliverables d
        join public.profiles p on p.id = d.creator_id
        where d.buyer_id = $1 and (d.asset_id = $2 or d.cloned_asset_id = $2) and d.asset_type = $3
        limit 1
      `
      const detailResult = await client.query(detailQuery, [user.id, categoryId, categoryType])
      if (detailResult.rows.length === 0) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }
      
      const row = detailResult.rows[0]
      const actualId = row.actual_id
      const assetTable = categoryType === 'character' ? 'inventory_characters' : 
                         categoryType === 'persona' ? 'inventory_personas' : 
                         categoryType === 'lorebook' ? 'inventory_lorebooks' : 
                         categoryType === 'avatar' ? 'inventory_avatars' : 
                         'inventory_backgrounds'
      
      const assetResult = await client.query(`select * from public.${assetTable} where id = $1`, [actualId])

      if (assetResult.rows.length === 0) {
        return NextResponse.json({ error: "Asset data not found" }, { status: 404 })
      }

      const asset = assetResult.rows[0]
      const profileData = row.profile_data || {}
      const creator = profileData.creator || {}

      const mappedData: any = { id: asset.id }
      if (categoryType === 'character') {
        mappedData.characterName = asset.character_name
        mappedData.avatarUrl = asset.avatar_url
        mappedData.backgroundUrl = asset.background_url
        mappedData.visibility = asset.visibility
        mappedData.safety = asset.safety
        mappedData.tags = asset.tags
        mappedData.description = asset.description
        mappedData.scenario = asset.scenario
        mappedData.personalitySummary = asset.personality_summary
        mappedData.firstMessage = asset.first_message
        mappedData.alternativeMessages = asset.alternative_messages
        mappedData.exampleDialogue = asset.example_dialogue
        mappedData.authorNotes = asset.author_notes
        mappedData.characterNotes = asset.character_notes
        mappedData.status = asset.status
        mappedData.updatedAt = new Date(asset.updated_at).toLocaleDateString()
        mappedData.usageCount = asset.usage_count || 0
      } else if (categoryType === 'persona') {
        mappedData.personaName = asset.persona_name
        mappedData.personaDetails = asset.persona_details
        mappedData.avatarUrl = asset.avatar_url
        mappedData.tags = asset.tags
        mappedData.safety = asset.safety
        mappedData.visibility = asset.visibility
        mappedData.updatedAt = new Date(asset.updated_at).toLocaleDateString()
        mappedData.usageCount = asset.usage_count || 0
      } else if (categoryType === 'lorebook') {
        mappedData.lorebookName = asset.lorebook_name
        mappedData.description = asset.description
        mappedData.avatarUrl = asset.avatar_url
        mappedData.tags = asset.tags
        mappedData.safety = asset.safety
        mappedData.visibility = asset.visibility
        mappedData.entries = asset.entries || []
        mappedData.updatedAt = new Date(asset.updated_at).toLocaleDateString()
      } else if (categoryType === 'avatar') {
        mappedData.avatarName = asset.avatar_name
        mappedData.imageUrl = asset.image_url
        mappedData.tags = asset.tags
        mappedData.safety = asset.safety
        mappedData.visibility = asset.visibility
        mappedData.style = asset.style
        mappedData.notes = asset.notes
        mappedData.updatedAt = new Date(asset.updated_at).toLocaleDateString()
      } else if (categoryType === 'background') {
        mappedData.backgroundName = asset.background_name
        mappedData.imageUrl = asset.image_url
        mappedData.tags = asset.tags
        mappedData.safety = asset.safety
        mappedData.visibility = asset.visibility
        mappedData.type = asset.type
        mappedData.notes = asset.notes
        mappedData.updatedAt = new Date(asset.updated_at).toLocaleDateString()
      }

      return NextResponse.json({
        detail: {
          category: categoryType,
          meta: {
            purchasedAt: new Date(row.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit"
            }),
            orderId: String(row.order_id).slice(0, 8),
            sellerDisplayName: creator.displayName || profileData.displayName || "Creator",
            sellerHandle: creator.handle || profileData.handle || "@creator"
          },
          data: mappedData
        }
      })
    }

    const query = `
      select 
        d.asset_type,
        d.asset_id,
        d.cloned_asset_id,
        d.order_id,
        d.created_at,
        d.creator_id,
        p.profile_data
      from public.order_deliverables d
      join public.profiles p on p.id = d.creator_id
      where d.buyer_id = $1
      order by d.created_at desc
    `

    const result = await client.query(query, [user.id])
    
    // Process items one by one to fetch details from specific tables
    const inventory = []
    for (const row of result.rows) {
      const actualId = row.cloned_asset_id || row.asset_id
      const assetTable = row.asset_type === 'character' ? 'inventory_characters' : 
                         row.asset_type === 'persona' ? 'inventory_personas' : 
                         row.asset_type === 'lorebook' ? 'inventory_lorebooks' : 
                         row.asset_type === 'avatar' ? 'inventory_avatars' : 
                         'inventory_backgrounds'

      const assetData = await client.query(`select * from public.${assetTable} where id = $1`, [actualId])
      
      if (assetData.rows.length > 0) {
        const asset = assetData.rows[0]
        const profileData = row.profile_data || {}
        const creator = profileData.creator || {}

        inventory.push({
          category: row.asset_type,
          id: asset.id,
          title: asset.character_name || asset.persona_name || asset.lorebook_name || asset.avatar_name || asset.background_name || "Untitled Asset",
          description: asset.description || asset.persona_details || asset.notes || "",
          thumbUrl: asset.avatar_url || asset.image_url || null,
          safety: asset.safety || "SFW",
          tags: Array.isArray(asset.tags) ? asset.tags : [],
          purchasedAt: new Date(row.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit"
          }),
          orderId: String(row.order_id).slice(0, 8),
          sellerDisplayName: creator.displayName || profileData.displayName || "Creator",
          sellerHandle: creator.handle || profileData.handle || "@creator"
        })
      }
    }

    return NextResponse.json({ inventory })

  } catch (error) {
    console.error("Inventory API Error:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  } finally {
    await client.end().catch(() => {})
  }
}
