import { Suspense } from "react"

import { OTPForm } from "@/features/site/auth"

function OtpFormFallback() {
  return (
    <div
      className="mx-auto h-[360px] max-w-[350px] animate-pulse rounded-2xl border border-border/60 bg-muted/30 md:max-w-[500px]"
      aria-hidden
    />
  )
}

export default function OTPVerificationPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Security Check</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Enter verification code</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the full verification code from your email (6 or 8 digits).
        </p>
      </div>
      <Suspense fallback={<OtpFormFallback />}>
        <OTPForm />
      </Suspense>
    </>
  )
}
