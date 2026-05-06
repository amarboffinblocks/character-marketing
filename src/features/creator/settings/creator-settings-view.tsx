"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  KeyRound,
  Loader2,
  LogOut,
  Settings as SettingsIcon,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClientSupabaseClient } from "@/lib/supabase/client"

// type SettingsTab = "account" | "notifications" | "safety" | "appearance" | "security"

// const settingsTabs: SectionTabItem<SettingsTab>[] = [
//   { value: "account", label: "Account", icon: UserRound },
//   { value: "notifications", label: "Notifications", icon: Bell },
//   { value: "safety", label: "Safety", icon: ShieldCheck },
//   { value: "appearance", label: "Appearance", icon: Palette },
//   { value: "security", label: "Security", icon: ShieldAlert },
// ]

// function ToggleRow({
//   label,
//   description,
//   value,
//   onChange,
// }: {
//   label: string
//   description: string
//   value: boolean
//   onChange: (value: boolean) => void
// }) {
//   return (
//     <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 p-3">
//       <div>
//         <p className="text-sm font-medium text-foreground">{label}</p>
//         <p className="text-xs text-muted-foreground">{description}</p>
//       </div>
//       <button
//         type="button"
//         role="switch"
//         aria-checked={value}
//         onClick={() => onChange(!value)}
//         className={cn(
//           "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border transition-colors",
//           value ? "bg-primary" : "bg-muted"
//         )}
//       >
//         <span
//           className={cn(
//             "inline-block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform",
//             value && "translate-x-4"
//           )}
//         />
//       </button>
//     </div>
//   )
// }

export function CreatorSettingsView() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  })
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleUpdateSecurity() {
    if (!passwordForm.password) {
      toast.error("Please enter a new password")
      return
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        body: JSON.stringify(passwordForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      toast.success("Security settings updated successfully")
      setPasswordForm({ password: "", confirmPassword: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignOutGlobal() {
    setIsSigningOut(true)
    try {
      const response = await fetch("/api/auth/sign-out?global=true", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to sign out from all devices")
      }

      toast.success("Signed out from all devices")
      router.push("/sign-in")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign out")
    } finally {
      setIsSigningOut(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "delete my account") {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account")
      }

      toast.success("Account deleted permanently")
      router.push("/sign-up")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

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

      {/* <SectionTabs value={tab} onChange={setTab} items={settingsTabs} />

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
                    setAccountForm((current) => ({
                      ...current,
                      language: value ?? "",
                    }))
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

      {tab === "security" ? ( */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle>Security</CardTitle>
              <CardDescription>Keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">New password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Confirm password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                />
              </div>
            </CardContent>
            <CardContent className="flex items-center justify-end border-t py-3">
              <Button variant="outline" onClick={handleUpdateSecurity} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
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
                <Button
                  variant="outline"
                  onClick={handleSignOutGlobal}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  Sign out everywhere
                </Button>
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
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmation !== "delete my account" || isDeleting}
                    onClick={handleDeleteAccount}
                  >
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Delete permanently
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      {/* ) : null} */}
        </div>
  )
}
