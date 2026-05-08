"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, LoaderCircle, AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ConnectStatus = {
  connected: boolean
  accountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  error?: string
}

export default function StripeConnectReturnPage() {
  const router = useRouter()
  const [status, setStatus] = useState<ConnectStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkStatus() {
      try {
        const response = await fetch("/api/payments/stripe/connect")
        const data = (await response.json()) as ConnectStatus
        if (!mounted) return
        setStatus(data)
      } catch {
        if (!mounted) return
        setStatus({
          connected: false,
          accountId: null,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          error: "Unable to verify account status.",
        })
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void checkStatus()
    return () => {
      mounted = false
    }
  }, [])

  const isFullyOnboarded = status?.chargesEnabled && status?.payoutsEnabled

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {isLoading ? (
            <>
              <LoaderCircle className="size-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Verifying your Stripe account...
              </p>
            </>
          ) : isFullyOnboarded ? (
            <>
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="size-7 text-emerald-600" />
              </span>
              <h1 className="text-xl font-semibold text-foreground">
                Stripe Connected!
              </h1>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your Stripe account is fully set up. You can now receive payouts
                when buyers approve your deliveries.
              </p>
              <Button onClick={() => router.push("/dashboard/creator/profile")} className="mt-2">
                Back to profile
              </Button>
            </>
          ) : status?.detailsSubmitted ? (
            <>
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-amber-500/15">
                <AlertTriangle className="size-7 text-amber-600" />
              </span>
              <h1 className="text-xl font-semibold text-foreground">
                Almost there
              </h1>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your details have been submitted but Stripe is still verifying
                your account. This usually takes a few minutes. You&apos;ll be able
                to receive payouts once verification is complete.
              </p>
              <Button onClick={() => router.push("/dashboard/creator/profile")} className="mt-2">
                Back to profile
              </Button>
            </>
          ) : (
            <>
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-amber-500/15">
                <AlertTriangle className="size-7 text-amber-600" />
              </span>
              <h1 className="text-xl font-semibold text-foreground">
                Onboarding incomplete
              </h1>
              <p className="max-w-sm text-sm text-muted-foreground">
                It looks like you didn&apos;t finish setting up your Stripe account.
                You can try again from your profile page.
              </p>
              <Button onClick={() => router.push("/dashboard/creator/profile")} className="mt-2">
                Back to profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
