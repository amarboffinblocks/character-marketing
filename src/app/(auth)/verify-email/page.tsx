import { Suspense } from "react"

import { VerifyEmailForm } from "@/features/site/auth"

function VerifyEmailFormFallback() {
  return (
    <div
      className="mx-auto h-[280px] max-w-[350px] animate-pulse rounded-2xl border border-border/60 bg-muted/30 md:max-w-[500px]"
      aria-hidden
    />
  )
}

export default function VerifyEmailPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Email Verification</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Verify your email</h1>
        <p className="mt-2 text-muted-foreground">
          Request a new verification code if you did not receive one or it expired.
        </p>
      </div>
      <Suspense fallback={<VerifyEmailFormFallback />}>
        <VerifyEmailForm />
      </Suspense>
    </>
  )
}
