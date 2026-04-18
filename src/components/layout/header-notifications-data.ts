export type HeaderNotification = {
  id: string
  creatorId: string
  creatorName: string
  creatorAvatar: string
  message: string
  timeLabel: string
}

/** Demo inbox — wire to real notifications API later. */
export const headerNotifications: HeaderNotification[] = [
  {
    id: "n1",
    creatorId: "luna-pixel",
    creatorName: "Luna Pixel",
    creatorAvatar: "/avatars/luna-avatar.jpg",
    message: "Replied about your character card timeline — can start next week.",
    timeLabel: "2m ago",
  },
  {
    id: "n2",
    creatorId: "nova-scribe",
    creatorName: "Nova Scribe",
    creatorAvatar: "/avatars/marcus-avatar.jpg",
    message: "Sent a revised quote for the lorebook scope you asked about.",
    timeLabel: "1h ago",
  },
  {
    id: "n3",
    creatorId: "echo-art",
    creatorName: "Echo Art",
    creatorAvatar: "/avatars/aria-avatar.jpg",
    message: "Your VTuber pack is ready for review when you are.",
    timeLabel: "Yesterday",
  },
  {
    id: "n4",
    creatorId: "shadow-craft",
    creatorName: "Shadow Craft",
    creatorAvatar: "/avatars/shadow-craft-avatar.jpg",
    message: "New background concepts uploaded — take a look when you have a moment.",
    timeLabel: "Apr 16",
  },
]
