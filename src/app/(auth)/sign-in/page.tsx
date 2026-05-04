import { Suspense } from "react"

import { SignInForm } from "@/features/site/auth"

function SignInFormFallback() {
  return (
    <div
      className="mx-auto h-[420px] max-w-[350px] animate-pulse rounded-2xl border border-border/60 bg-muted/30 md:max-w-[500px]"
      aria-hidden
    />
  )
}

export default function SignInPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Welcome Back</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Sign in to your account</h1>
        <p className="mt-2 text-muted-foreground">
          Continue managing briefs, creators, and deliveries in one place.
        </p>
      </div>
      <Suspense fallback={<SignInFormFallback />}>
        <SignInForm />
      </Suspense>
    </>
  )
}
