import { OTPForm } from "@/features/site/auth"

export default function OTPVerificationPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Security Check</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Enter verification code</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the one-time code sent to your email to continue securely.
        </p>
      </div>
      <OTPForm />
    </>
  )
}
