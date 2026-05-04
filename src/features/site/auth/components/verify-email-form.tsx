"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isNetworkError } from "@/lib/auth-error-messages"
import { isSignInAllowedRole } from "@/lib/auth-roles"
import { cn } from "@/lib/utils"

const verifyEmailSchema = z.object({
  email: z.email("Enter a valid email"),
})

type VerifyEmailOutput = z.infer<typeof verifyEmailSchema>
type VerifyEmailInput = z.input<typeof verifyEmailSchema>

const RESEND_COOLDOWN_SEC = 60

export default function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email")?.trim() ?? ""
  const roleParam = searchParams.get("role")
  const roleFromQuery = isSignInAllowedRole(roleParam) ? roleParam : undefined

  const [resendCooldown, setResendCooldown] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [sentHint, setSentHint] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailInput, unknown, VerifyEmailOutput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailFromQuery || "",
    },
  })

  const emailWatch = useWatch({ control, name: "email" })

  useEffect(() => {
    if (emailFromQuery) {
      reset({ email: emailFromQuery })
    }
  }, [emailFromQuery, reset])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [resendCooldown])

  const onSubmit = useCallback(
    async (values: VerifyEmailOutput) => {
      setFormError(null)
      setSentHint(false)

      try {
        const response = await fetch("/api/auth/resend-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email.trim().toLowerCase(),
            ...(roleFromQuery ? { role: roleFromQuery } : {}),
          }),
        })

        const result = (await response.json()) as { error?: string; message?: string }
        if (!response.ok) {
          const msg = result.error ?? "Could not resend the verification code."
          setFormError(msg)
          toast.error("Resend failed", { description: msg })
          return
        }

        setResendCooldown(RESEND_COOLDOWN_SEC)
        setSentHint(true)
        toast.success("Code sent", { description: result.message ?? "Check your inbox." })
      } catch (err) {
        const msg = isNetworkError(err)
          ? "Network error. Check your connection and try again."
          : "Something went wrong while resending the code."
        setFormError(msg)
        toast.error("Resend failed", { description: msg })
      }
    },
    [roleFromQuery],
  )

  return (
    <div className="mx-auto max-w-[350px] rounded-2xl border border-border/80 bg-card shadow-sm md:max-w-[500px]">
      <div className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email address
            </label>
            <div className="relative">
              <MailCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={cn("h-10 pl-10", errors.email && "aria-invalid")}
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
              />
            </div>
            {errors.email ? <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <Button type="submit" className="h-10 w-full" disabled={isSubmitting || resendCooldown > 0}>
            {resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : isSubmitting
                ? "Sending code..."
                : "Resend verification code"}
          </Button>
        </form>

        {formError ? (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        {sentHint && !formError ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            If an account exists for this email, we sent a new code. Check your inbox and spam folder.
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have a code?{" "}
          <Link
            href={(() => {
              const trimmed = (emailWatch ?? "").trim().toLowerCase()
              const q = new URLSearchParams()
              if (trimmed) q.set("email", trimmed)
              if (roleFromQuery) q.set("role", roleFromQuery)
              const qs = q.toString()
              return qs ? `/otp-verification?${qs}` : "/otp-verification"
            })()}
            className="font-medium text-primary hover:underline"
          >
            Enter verification code
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
