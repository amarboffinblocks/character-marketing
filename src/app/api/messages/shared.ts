import type { SupabaseClient, User } from "@supabase/supabase-js"

import { resolvePersistedRole } from "@/lib/profile-role"
import type { MessageItem, MessageSenderRole, MessageThread } from "@/features/messaging/types"

type ThreadRow = {
  id: string
  order_id: string
  creator_id: string
  buyer_id: string
  creator_name: string
  buyer_name: string
  creator_avatar_url: string
  buyer_avatar_url: string
  last_message_at: string
}

type MessageRow = {
  id: string
  thread_id: string
  sender_id: string
  sender_role: MessageSenderRole
  body: string
  created_at: string
}

type ReadRow = {
  thread_id: string
  last_read_at: string
}

type ProfileRow = {
  profile_data: Record<string, unknown> | null
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function extractAvatarFromProfileData(profileData: Record<string, unknown> | null) {
  const root = asObject(profileData)
  const creator = asObject(root.creator)
  const user = asObject(root.user)
  const admin = asObject(root.admin)

  return (
    asString(creator.avatarUrl) ||
    asString(user.avatarUrl) ||
    asString(admin.avatarUrl) ||
    asString(root.avatarUrl)
  )
}

export async function requireAuthUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export function mapMessageRow(row: MessageRow): MessageItem {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    text: row.body,
    createdAt: row.created_at,
  }
}

export function mapThreadRow(
  row: ThreadRow,
  currentUserId: string,
  unreadCount: number,
  lastMessageText: string
): MessageThread {
  const isCreator = row.creator_id === currentUserId
  const counterpartName = isCreator ? row.buyer_name || "Buyer" : row.creator_name || "Creator"
  const counterpartAvatarUrl = isCreator ? row.buyer_avatar_url || "" : row.creator_avatar_url || ""
  return {
    id: row.id,
    orderId: row.order_id,
    buyerName: row.buyer_name || "Buyer",
    creatorName: row.creator_name || "Creator",
    counterpartName,
    counterpartAvatarUrl,
    status: unreadCount > 0 ? "needs_response" : "active",
    unreadCount,
    lastMessageAt: row.last_message_at,
    lastMessageText,
  }
}

export async function getMySenderRole(supabase: SupabaseClient, user: User): Promise<MessageSenderRole> {
  const role = await resolvePersistedRole(supabase, user)
  if (role === "creator") return "creator"
  return "buyer"
}

export async function resolveAvatarUrlForUser(supabase: SupabaseClient, user: User) {
  const fromMetadata =
    asString(user.user_metadata?.avatar_url) ||
    asString(user.user_metadata?.picture)

  const { data } = await supabase
    .from("profiles")
    .select("profile_data")
    .eq("id", user.id)
    .maybeSingle()

  const profileAvatar = extractAvatarFromProfileData((data as ProfileRow | null)?.profile_data ?? null)
  return profileAvatar || fromMetadata
}

export async function resolveAvatarUrlByUserId(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("profile_data")
    .eq("id", userId)
    .maybeSingle()

  return extractAvatarFromProfileData((data as ProfileRow | null)?.profile_data ?? null)
}

export async function assertThreadParticipant(
  supabase: SupabaseClient,
  threadId: string,
  userId: string
): Promise<ThreadRow> {
  const { data, error } = await supabase
    .from("conversation_threads")
    .select("id, order_id, creator_id, buyer_id, creator_name, buyer_name, creator_avatar_url, buyer_avatar_url, last_message_at")
    .eq("id", threadId)
    .single()

  if (error || !data) {
    throw new Error("Thread not found.")
  }

  const row = data as ThreadRow
  if (row.creator_id !== userId && row.buyer_id !== userId) {
    throw new Error("Unauthorized")
  }
  return row
}

export async function markRead(supabase: SupabaseClient, threadId: string, userId: string, lastMessageId?: string) {
  const { error } = await supabase.from("conversation_reads").upsert(
    {
      thread_id: threadId,
      user_id: userId,
      last_read_message_id: lastMessageId ?? null,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "thread_id,user_id" }
  )
  if (error) throw new Error("Unable to mark thread as read.")
}

export async function buildThreadsForUser(supabase: SupabaseClient, userId: string, orderId?: string) {
  let threadsQuery = supabase
    .from("conversation_threads")
    .select("id, order_id, creator_id, buyer_id, creator_name, buyer_name, creator_avatar_url, buyer_avatar_url, last_message_at")
    .or(`creator_id.eq.${userId},buyer_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })

  if (orderId) {
    threadsQuery = threadsQuery.eq("order_id", orderId)
  }

  const { data: threadsData, error: threadsError } = await threadsQuery
  if (threadsError) throw new Error("Unable to load message threads.")

  const threads = (threadsData ?? []) as ThreadRow[]
  if (threads.length === 0) return []

  const threadIds = threads.map((thread) => thread.id)
  const [{ data: messageRows, error: messageError }, { data: readRows, error: readError }] = await Promise.all([
    supabase
      .from("conversation_messages")
      .select("id, thread_id, sender_id, sender_role, body, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false }),
    supabase.from("conversation_reads").select("thread_id, last_read_at").eq("user_id", userId).in("thread_id", threadIds),
  ])

  if (messageError) throw new Error("Unable to load latest messages.")
  if (readError) throw new Error("Unable to load read state.")

  const messages = (messageRows ?? []) as MessageRow[]
  const reads = (readRows ?? []) as ReadRow[]
  const readsByThread = new Map(reads.map((row) => [row.thread_id, row.last_read_at]))

  const firstMessageByThread = new Map<string, MessageRow>()
  const unreadByThread = new Map<string, number>()

  for (const message of messages) {
    if (!firstMessageByThread.has(message.thread_id)) {
      firstMessageByThread.set(message.thread_id, message)
    }
    if (message.sender_id === userId) continue
    const lastReadAt = readsByThread.get(message.thread_id)
    if (!lastReadAt || new Date(message.created_at).getTime() > new Date(lastReadAt).getTime()) {
      unreadByThread.set(message.thread_id, (unreadByThread.get(message.thread_id) ?? 0) + 1)
    }
  }

  return threads.map((thread) =>
    mapThreadRow(
      thread,
      userId,
      unreadByThread.get(thread.id) ?? 0,
      firstMessageByThread.get(thread.id)?.body ?? "No messages yet."
    )
  )
}
