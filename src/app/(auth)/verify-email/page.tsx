import VerifyEmailForm  from "@/components/forms/verify-email-form"

export default function VerifyEmailPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Email Verification</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Verify your email</h1>
        <p className="mt-2 text-muted-foreground">
          Use this page to resend your verification message and activate your account.
        </p>
      </div>
      <VerifyEmailForm />
    </>
  )
}
