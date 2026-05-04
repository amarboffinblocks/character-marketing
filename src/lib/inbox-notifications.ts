import type pg from "pg"

type InboxNotificationInput = {
  userId: string
  category: "request" | "order" | "message" | "bid" | "payment" | "review"
  title: string
  body: string
  actionUrl: string
  type?: "system" | "chat"
}

export async function insertInboxNotification(
  client: pg.Client,
  input: InboxNotificationInput
) {
  await client.query(
    `insert into public.inbox_notifications (user_id, type, category, title, body, action_url)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      input.userId,
      input.type ?? "system",
      input.category,
      input.title,
      input.body,
      input.actionUrl,
    ]
  )
}
