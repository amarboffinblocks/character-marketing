"use client"

import { useEffect, useState } from "react"
import {
  KeyRound,
  Loader2,
  LogOut,
  Settings as SettingsIcon,
  Trash2,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"


type AdminSettingsTab = "account"

const settingsTabs: SectionTabItem<AdminSettingsTab>[] = [
  { value: "account", label: "Account", icon: UserRound },
]



export function AdminSettingsView() {
  const router = useRouter()
  const [tab, setTab] = useState<AdminSettingsTab>("account")
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <SettingsIcon className="size-5" />
            </span>
            <div className="space-y-1.5">
              <Badge variant="secondary" className="w-fit">
                Platform controls
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Settings
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Operations, alerting, integrations, and audit trails — same structure as creator
                settings, scoped to the admin console (demo only).
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionTabs value={tab} onChange={setTab} items={settingsTabs} />


      {tab === "account" ? (
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
      ) : null}
    </div>
  )
}

