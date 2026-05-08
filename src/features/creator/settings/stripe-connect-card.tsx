"use client"

import { useCallback, useEffect, useState } from "react"
import {
  AlertCircle,
  BadgeCheck,
  CircleDashed,
  ExternalLink,
  Loader2,
  Plug,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ConnectStatus = {
  connected: boolean
  stripeAccountId: string | null
  payoutsEnabled: boolean
  chargesEnabled: boolean
  onboardingCompleted: boolean
  requirementsCurrentlyDue?: string[]
  requirementsPastDue?: string[]
}

export function StripeConnectCard() {
  const [status, setStatus] = useState<ConnectStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isLinking, setIsLinking] = useState(false)

  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const res = await fetch("/api/creator/connect/status")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      // silently fail — status stays null
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Handle stripe=success / stripe=refresh return from Stripe onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeParam = params.get("stripe")
    if (stripeParam === "success") {
      toast.success("Stripe onboarding complete! Refreshing your account status…")
      fetchStatus()
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete("stripe")
      window.history.replaceState({}, "", url.toString())
    } else if (stripeParam === "refresh") {
      toast.info("Stripe onboarding session expired. Please start again.")
      const url = new URL(window.location.href)
      url.searchParams.delete("stripe")
      window.history.replaceState({}, "", url.toString())
    }
  }, [fetchStatus])

  async function handleCreateAccount() {
    setIsCreating(true)
    try {
      const res = await fetch("/api/creator/connect/create-account", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.alreadyExists) {
        toast.info("Stripe account already connected.")
      } else {
        toast.success("Stripe account created! Redirecting to onboarding…")
      }
      await fetchStatus()
      // Now generate and redirect to onboarding link
      await handleOpenOnboarding()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create Stripe account.")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleOpenOnboarding() {
    setIsLinking(true)
    try {
      const res = await fetch("/api/creator/connect/onboarding-link", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate onboarding link.")
      setIsLinking(false)
    }
  }

  if (isLoadingStatus) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center gap-3 py-6">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading payout account status…</span>
        </CardContent>
      </Card>
    )
  }

  const isFullyActive = status?.payoutsEnabled && status?.chargesEnabled && status?.onboardingCompleted
  const hasPendingRequirements =
    (status?.requirementsCurrentlyDue?.length ?? 0) > 0 ||
    (status?.requirementsPastDue?.length ?? 0) > 0

  return (
    <Card
      className={cn(
        "border-border/80 transition-colors",
        isFullyActive && "border-emerald-500/30 bg-emerald-500/5",
        !status?.connected && "border-primary/20",
        hasPendingRequirements && "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl",
                isFullyActive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : hasPendingRequirements
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-primary/15 text-primary"
              )}
            >
              {isFullyActive ? (
                <ShieldCheck className="size-5" />
              ) : hasPendingRequirements ? (
                <AlertCircle className="size-5" />
              ) : (
                <Plug className="size-5" />
              )}
            </span>
            <div>
              <CardTitle className="text-base">Stripe Payout Account</CardTitle>
              <CardDescription>
                Connect your bank account to receive creator payouts.
              </CardDescription>
            </div>
          </div>

          {isFullyActive && (
            <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <BadgeCheck className="mr-1 size-3" />
              Active
            </Badge>
          )}
          {hasPendingRequirements && (
            <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <AlertCircle className="mr-1 size-3" />
              Action needed
            </Badge>
          )}
          {status?.connected && !isFullyActive && !hasPendingRequirements && (
            <Badge variant="secondary">
              <CircleDashed className="mr-1 size-3" />
              Pending
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-4">
        {!status?.connected ? (
          // No Stripe account yet
          <div className="flex flex-col gap-4">
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <Feature icon={<Zap className="size-4 text-primary" />} text="Instant setup with Stripe Express" />
              <Feature icon={<ShieldCheck className="size-4 text-primary" />} text="Bank-level KYC verification" />
              <Feature icon={<BadgeCheck className="size-4 text-primary" />} text="Receive payouts in 2–5 days" />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreateAccount}
                disabled={isCreating || isLinking}
                className="gap-2"
              >
                {isCreating || isLinking ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plug className="size-4" />
                )}
                Connect Stripe Account
              </Button>
            </div>
          </div>
        ) : (
          // Account exists
          <div className="flex flex-col gap-3">
            {/* Status grid */}
            <div className="grid gap-2 rounded-lg border border-border/60 bg-background/60 p-3 sm:grid-cols-3">
              <StatusRow
                label="Payouts enabled"
                value={status.payoutsEnabled}
              />
              <StatusRow
                label="Charges enabled"
                value={status.chargesEnabled}
              />
              <StatusRow
                label="Onboarding complete"
                value={status.onboardingCompleted}
              />
            </div>

            {/* Account ID */}
            {status.stripeAccountId && (
              <p className="text-xs text-muted-foreground">
                Account ID:{" "}
                <span className="font-mono">{status.stripeAccountId}</span>
              </p>
            )}

            {/* Pending requirements */}
            {hasPendingRequirements && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  Action required to activate payouts
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Stripe needs additional information. Complete onboarding to unlock payouts.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStatus}
                disabled={isLoadingStatus}
              >
                {isLoadingStatus ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Refresh status
              </Button>
              <Button
                size="sm"
                onClick={handleOpenOnboarding}
                disabled={isLinking}
                variant={isFullyActive ? "outline" : "default"}
                className="gap-2"
              >
                {isLinking ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="size-3.5" />
                )}
                {isFullyActive ? "Manage in Stripe" : "Complete onboarding"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs">{text}</span>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          value ? "bg-emerald-500" : "bg-muted-foreground/40"
        )}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "ml-auto text-xs font-medium",
          value ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        )}
      >
        {value ? "Yes" : "No"}
      </span>
    </div>
  )
}
