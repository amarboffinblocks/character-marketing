"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/page-loader"
import { isNetworkError } from "@/lib/auth-error-messages"
import { cn } from "@/lib/utils"

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
})

type ForgotPasswordOutput = z.infer<typeof forgotPasswordSchema>
type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [sentHint, setSentHint] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput, unknown, ForgotPasswordOutput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: ForgotPasswordOutput) => {
    setIsSubmitting(true)
    setFormError(null)
    setSentHint(false)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email.trim().toLowerCase() }),
      })

      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) {
        const msg = result.error ?? "Unable to send a reset link."
        setFormError(msg)
        toast.error("Request failed", { description: msg })
        return
      }

      setSentHint(true)
      toast.success("Check your email", { description: result.message ?? "If an account exists, we sent a reset link." })
    } catch (err) {
      const msg = isNetworkError(err)
        ? "Network error. Check your connection and try again."
        : "Something went wrong while sending the reset link."
      setFormError(msg)
      toast.error("Request failed", { description: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageLoader open={isSubmitting} label="Sending reset link..." />
      <div className="mx-auto max-w-[350px] rounded-2xl border border-border/80 bg-card shadow-sm md:max-w-[500px]">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Account email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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

            <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </Button>
          </form>

          {formError ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          {sentHint && !formError ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              If an account exists for this email, we sent a reset link. Open it on this device to choose a new password.
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
