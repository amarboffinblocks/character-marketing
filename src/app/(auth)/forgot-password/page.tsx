import { ForgotPasswordForm } from "@/features/site/auth"

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Password Recovery</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Forgot your password?</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your account email and we will send a secure reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  )
}
