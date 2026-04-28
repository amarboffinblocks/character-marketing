import type {
  MessageItem,
  MessageListResponse,
  MessageThread,
  MessageThreadResponse,
} from "@/features/messaging/types"

async function asJson<T>(response: Response): Promise<T> {
  const json = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    const message = typeof json.error === "string" ? json.error : "Request failed."
    throw new Error(message)
  }
  return json
}

export async function fetchMessageThreads(params?: { orderId?: string }): Promise<MessageThread[]> {
  const search = new URLSearchParams()
  if (params?.orderId) search.set("orderId", params.orderId)
  const query = search.toString()
  const response = await fetch(`/api/messages/threads${query ? `?${query}` : ""}`, { cache: "no-store" })
  const data = await asJson<MessageThreadResponse>(response)
  return data.threads
}

export async function openOrCreateThread(payload: {
  orderId: string
  otherUserId: string
  otherUserName?: string
}): Promise<MessageThread> {
  const response = await fetch("/api/messages/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await asJson<{ thread: MessageThread }>(response)
  return data.thread
}

export async function fetchThreadMessages(threadId: string): Promise<MessageItem[]> {
  const response = await fetch(`/api/messages/threads/${encodeURIComponent(threadId)}/messages`, {
    cache: "no-store",
  })
  const data = await asJson<MessageListResponse>(response)
  return data.messages
}

export async function sendThreadMessage(threadId: string, text: string): Promise<MessageItem> {
  const response = await fetch(`/api/messages/threads/${encodeURIComponent(threadId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  const data = await asJson<{ message: MessageItem }>(response)
  return data.message
}

export async function markThreadRead(threadId: string): Promise<void> {
  const response = await fetch(`/api/messages/threads/${encodeURIComponent(threadId)}/read`, {
    method: "POST",
  })
  await asJson<{ success: true }>(response)
}

export async function clearThreadMessages(threadId: string): Promise<void> {
  const response = await fetch(`/api/messages/threads/${encodeURIComponent(threadId)}?mode=clear`, {
    method: "DELETE",
  })
  await asJson<{ success: true }>(response)
}

export async function deleteThread(threadId: string): Promise<void> {
  const response = await fetch(`/api/messages/threads/${encodeURIComponent(threadId)}?mode=delete`, {
    method: "DELETE",
  })
  await asJson<{ success: true }>(response)
}
