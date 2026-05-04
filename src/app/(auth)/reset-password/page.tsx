import { ResetPasswordForm } from "@/features/site/auth"

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Password reset</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose a new password</h1>
        <p className="mt-2 text-muted-foreground">Use a strong password you have not used elsewhere.</p>
      </div>
      <ResetPasswordForm />
    </>
  )
}
