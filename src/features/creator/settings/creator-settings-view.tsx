"use client"

import { useState } from "react"
import {
  Bell,
  KeyRound,
  LogOut,
  Palette,
  Save,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import { cn } from "@/lib/utils"

type SettingsTab = "account" | "notifications" | "safety" | "appearance" | "security"

const settingsTabs: SectionTabItem<SettingsTab>[] = [
  { value: "account", label: "Account", icon: UserRound },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "safety", label: "Safety", icon: ShieldCheck },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "security", label: "Security", icon: ShieldAlert },
]

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border transition-colors",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform",
            value && "translate-x-4"
          )}
        />
      </button>
    </div>
  )
}

export function CreatorSettingsView() {
  const [tab, setTab] = useState<SettingsTab>("account")

  const [accountForm, setAccountForm] = useState({
    fullName: "Flowing Bloom",
    email: "creator@example.com",
    timezone: "Asia/Kolkata (GMT+5:30)",
    language: "English",
  })

  const [notifications, setNotifications] = useState({
    newOrders: true,
    buyerMessages: true,
    reviewUpdates: true,
    payoutAlerts: true,
    marketing: false,
    weeklyDigest: true,
  })

  const [safety, setSafety] = useState({
    defaultSafety: "SFW" as "SFW" | "NSFW",
    defaultVisibility: "public" as "public" | "private" | "unlisted",
    allowNsfwOrders: false,
    requireApprovalBeforePublish: true,
  })

  const [appearance, setAppearance] = useState({
    theme: "system" as "light" | "dark" | "system",
    density: "comfortable" as "comfortable" | "compact",
    reduceMotion: false,
  })

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <SettingsIcon className="size-5" />
          </span>
          <div className="space-y-1.5">
            <Badge variant="secondary" className="w-fit">Account preferences</Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Settings
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Manage account info, notifications, safety defaults, appearance, and security.
            </p>
          </div>
        </div>
      </section>

      <SectionTabs value={tab} onChange={setTab} items={settingsTabs} />

      {tab === "account" ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Account information</CardTitle>
              <CardDescription>Keep your creator profile identity up-to-date.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Full name</label>
                <Input
                  value={accountForm.fullName}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={accountForm.email}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                <Input
                  value={accountForm.timezone}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, timezone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Language</label>
                <Select
                  value={accountForm.language}
                  onValueChange={(value) =>
                    setAccountForm((current) => ({ ...current, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardContent className="flex items-center justify-end border-t py-3">
              <Button>
                <Save className="size-4" />
                Save account info
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Connected payout</CardTitle>
              <CardDescription>Account used for releasing earnings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Stripe Connect · ****4821</p>
                <p className="text-xs text-muted-foreground">Verified on Mar 12, 2026</p>
              </div>
              <Button variant="outline">Manage payout</Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "notifications" ? (
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what you want to be notified about.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 py-4">
            <ToggleRow
              label="New orders"
              description="Email + in-app alert when a buyer places a new order."
              value={notifications.newOrders}
              onChange={(value) => setNotifications((current) => ({ ...current, newOrders: value }))}
            />
            <ToggleRow
              label="Buyer messages"
              description="Get notified when a buyer replies in an order thread."
              value={notifications.buyerMessages}
              onChange={(value) =>
                setNotifications((current) => ({ ...current, buyerMessages: value }))
              }
            />
            <ToggleRow
              label="Review activity"
              description="Notify when a buyer leaves or edits a review."
              value={notifications.reviewUpdates}
              onChange={(value) =>
                setNotifications((current) => ({ ...current, reviewUpdates: value }))
              }
            />
            <ToggleRow
              label="Payout alerts"
              description="Updates on pending, released and failed payouts."
              value={notifications.payoutAlerts}
              onChange={(value) =>
                setNotifications((current) => ({ ...current, payoutAlerts: value }))
              }
            />
            <ToggleRow
              label="Marketing updates"
              description="Product news, creator tips, and featured opportunities."
              value={notifications.marketing}
              onChange={(value) => setNotifications((current) => ({ ...current, marketing: value }))}
            />
            <ToggleRow
              label="Weekly digest"
              description="Summary of orders, messages, and earnings every Monday."
              value={notifications.weeklyDigest}
              onChange={(value) =>
                setNotifications((current) => ({ ...current, weeklyDigest: value }))
              }
            />
          </CardContent>
        </Card>
      ) : null}

      {tab === "safety" ? (
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Safety & visibility defaults</CardTitle>
            <CardDescription>Applied to all newly created assets.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 py-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Default safety</label>
              <Select
                value={safety.defaultSafety}
                onValueChange={(value) =>
                  setSafety((current) => ({
                    ...current,
                    defaultSafety: value as typeof current.defaultSafety,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SFW">SFW</SelectItem>
                  <SelectItem value="NSFW">NSFW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Default visibility</label>
              <Select
                value={safety.defaultVisibility}
                onValueChange={(value) =>
                  setSafety((current) => ({
                    ...current,
                    defaultVisibility: value as typeof current.defaultVisibility,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <ToggleRow
                label="Accept NSFW orders"
                description="Allow buyers to submit NSFW order briefs."
                value={safety.allowNsfwOrders}
                onChange={(value) =>
                  setSafety((current) => ({ ...current, allowNsfwOrders: value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <ToggleRow
                label="Require approval before publishing"
                description="Assets need explicit publish action before going public."
                value={safety.requireApprovalBeforePublish}
                onChange={(value) =>
                  setSafety((current) => ({ ...current, requireApprovalBeforePublish: value }))
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "appearance" ? (
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Personalize how your dashboard looks and feels.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 py-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Theme</label>
              <Select
                value={appearance.theme}
                onValueChange={(value) =>
                  setAppearance((current) => ({ ...current, theme: value as typeof current.theme }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Layout density</label>
              <Select
                value={appearance.density}
                onValueChange={(value) =>
                  setAppearance((current) => ({
                    ...current,
                    density: value as typeof current.density,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <ToggleRow
                label="Reduce motion"
                description="Disable non-essential animations."
                value={appearance.reduceMotion}
                onChange={(value) =>
                  setAppearance((current) => ({ ...current, reduceMotion: value }))
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "security" ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Security</CardTitle>
              <CardDescription>Keep your creator account secure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Current password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">New password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Recovery email</label>
                <Input type="email" placeholder="recovery@example.com" />
              </div>
            </CardContent>
            <CardContent className="flex items-center justify-end border-t py-3">
              <Button variant="outline">
                <KeyRound className="size-4" />
                Update security
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader className="border-b border-destructive/30 pb-4">
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>These actions are permanent.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 py-4">
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Sign out from all devices</p>
                  <p className="text-xs text-muted-foreground">Ends all active sessions immediately.</p>
                </div>
                <Button variant="outline">
                  <LogOut className="size-4" />
                  Sign out everywhere
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Deactivate creator account</p>
                  <p className="text-xs text-muted-foreground">
                    Temporarily hide your storefront while retaining data.
                  </p>
                </div>
                <Button variant="destructive">Deactivate</Button>
              </div>
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">Delete account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently remove all assets, orders, and profile data. This action cannot be
                  undone.
                </p>
                <Textarea
                  placeholder="Type 'delete my account' to confirm"
                  className="mt-2 min-h-16"
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="destructive" disabled>
                    Delete permanently
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
