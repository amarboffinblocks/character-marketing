"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { PageLoader } from "@/components/ui/page-loader"
import { isNetworkError } from "@/lib/auth-error-messages"
import { isSignInAllowedRole, type AuthRole } from "@/lib/auth-roles"
import { emailSignupOtpCodeSchema } from "@/lib/auth-validators"
import { cn } from "@/lib/utils"

const otpSchema = z.object({
  code: emailSignupOtpCodeSchema,
})

type OtpOutput = z.infer<typeof otpSchema>
type OtpInput = z.input<typeof otpSchema>

const RESEND_COOLDOWN_SEC = 60

function redirectAfterAuth(role: AuthRole) {
  window.location.href =
    role === "admin" ? "/dashboard/admin" : role === "creator" ? "/dashboard/creator" : "/"
}

export default function OTPForm() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")?.trim().toLowerCase() ?? ""
  const roleParam = searchParams.get("role")
  const roleFromQuery = isSignInAllowedRole(roleParam) ? roleParam : undefined

  const [resendCooldown, setResendCooldown] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<OtpInput, unknown, OtpOutput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  })

  const codeValue = watch("code")
  const codeLengthOk = codeValue?.length === 6 || codeValue?.length === 8

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [resendCooldown])

  const onSubmit = async (values: OtpOutput) => {
    if (!emailParam) {
      setFormError("Missing email. Go back to sign up and try again, or open the link from your verification email.")
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/auth/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          token: values.code,
          ...(roleFromQuery ? { role: roleFromQuery } : {}),
        }),
      })

      const result = (await response.json()) as { error?: string; message?: string; role?: AuthRole }
      if (!response.ok) {
        const msg = result.error ?? "Verification failed."
        setFormError(msg)
        toast.error("Verification failed", { description: msg })
        return
      }

      setSuccessMessage(result.message ?? "You are signed in.")
      toast.success("Email verified", { description: result.message ?? "Welcome!" })

      await new Promise((r) => setTimeout(r, 850))
      if (result.role) {
        redirectAfterAuth(result.role)
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      const msg = isNetworkError(err)
        ? "Network error. Check your connection and try again."
        : "Something went wrong while verifying your code."
      setFormError(msg)
      toast.error("Verification failed", { description: msg })
    }
  }

  const onResend = useCallback(async () => {
    if (!emailParam || resendCooldown > 0 || isResending) return

    setFormError(null)
    setSuccessMessage(null)
    setIsResending(true)

    try {
      const response = await fetch("/api/auth/resend-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          ...(roleFromQuery ? { role: roleFromQuery } : {}),
        }),
      })

      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) {
        const msg = result.error ?? "Could not resend the code."
        setFormError(msg)
        toast.error("Resend failed", { description: msg })
        return
      }

      setResendCooldown(RESEND_COOLDOWN_SEC)
      setValue("code", "")
      toast.success("Code sent", { description: result.message ?? "Check your inbox." })
    } catch (err) {
      const msg = isNetworkError(err)
        ? "Network error. Check your connection and try again."
        : "Something went wrong while resending the code."
      setFormError(msg)
      toast.error("Resend failed", { description: msg })
    } finally {
      setIsResending(false)
    }
  }, [emailParam, resendCooldown, roleFromQuery, setValue, isResending])

  const formLocked = isSubmitting || Boolean(successMessage) || !emailParam

  return (
    <>
      <PageLoader open={isSubmitting} label="Verifying your code..." />
      <div className="mx-auto max-w-[350px] rounded-2xl border border-border/80 bg-card shadow-sm md:max-w-[500px]">
        <div className="p-6 sm:p-8">
          {!emailParam ? (
            <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
              We need your email to verify this account.{" "}
              <Link href="/sign-up" className="font-medium text-primary underline">
                Return to sign up
              </Link>{" "}
              or use the link from your verification email.
            </p>
          ) : (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Code sent to <span className="font-medium text-foreground">{emailParam}</span>
            </p>
          )}

          {!successMessage ? (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label className="mb-4 block text-center text-sm font-medium text-foreground">
                  Verification code 
                </label>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={8}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLocked}
                        containerClassName={cn(errors.code && "has-aria-invalid ")}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                          <InputOTPSlot index={6} />
                          <InputOTPSlot index={7} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  )}
                />
                {errors.code ? <p className="mt-2 text-center text-xs text-destructive">{errors.code.message}</p> : null}
              </div>

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isSubmitting || !emailParam || !codeLengthOk}
              >
                {isSubmitting ? "Verifying..." : "Verify code"}
              </Button>
            </form>
          ) : null}

          {formError ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {successMessage}
            </p>
          ) : null}

          <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
            <p>
              <button
                type="button"
                className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void onResend()}
                disabled={!emailParam || resendCooldown > 0 || isResending || Boolean(successMessage)}
              >
                {isResending
                  ? "Sending…"
                  : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"}
              </button>
            </p>
            <p>
              Wrong email?{" "}
              <Link href="/verify-email" className="font-medium text-primary hover:underline">
                Resend from email page
              </Link>
            </p>
            <p>
              Already verified?{" "}
              <Link href="/sign-in" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
