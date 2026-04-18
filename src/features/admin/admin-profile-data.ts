export type AdminProfileForm = {
  displayName: string
  jobTitle: string
  email: string
  phone: string
  department: string
  employeeId: string
  timezone: string
  language: string
  bio: string
  slackHandle: string
  escalationRole: "none" | "l1" | "l2" | "oncall"
  bannerUrl: string
  avatarUrl: string
  notifyIncidents: boolean
  notifyDigest: boolean
  notifyProductUpdates: boolean
}

export const defaultAdminProfileForm: AdminProfileForm = {
  displayName: "Alex Rivera",
  jobTitle: "Platform Operations",
  email: "alex.rivera@character.market",
  phone: "+1 (415) 555-0142",
  department: "Trust & Safety",
  employeeId: "CM-ADM-2044",
  timezone: "America/Los_Angeles (GMT-7)",
  language: "English",
  bio: "On-call for escalations Mon–Wed. Prefer Slack #admin-ops for non-urgent threads.",
  slackHandle: "@alex.ops",
  escalationRole: "l2",
  bannerUrl: "",
  avatarUrl: "",
  notifyIncidents: true,
  notifyDigest: true,
  notifyProductUpdates: false,
}

export function computeAdminProfileCompletion(form: AdminProfileForm): { percent: number } {
  let score = 0
  const max = 10
  if (form.displayName.trim()) score++
  if (form.jobTitle.trim()) score++
  if (form.email.trim()) score++
  if (form.phone.trim()) score++
  if (form.department.trim()) score++
  if (form.employeeId.trim()) score++
  if (form.bio.trim().length > 20) score++
  if (form.slackHandle.trim()) score++
  if (form.bannerUrl.trim()) score++
  if (form.avatarUrl.trim()) score++
  return { percent: Math.round((score / max) * 100) }
}
