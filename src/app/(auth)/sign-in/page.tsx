import { SignInForm } from "@/features/site/auth"

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
      <SignInForm />
    </>
  )
}
