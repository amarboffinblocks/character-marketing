"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/page-loader"
import { isNetworkError } from "@/lib/auth-error-messages"
import { cn } from "@/lib/utils"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").regex(/^\S+$/, "Password cannot contain spaces"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

type ResetPasswordOutput = z.infer<typeof resetPasswordSchema>
type ResetPasswordInput = z.input<typeof resetPasswordSchema>

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput, unknown, ResetPasswordOutput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: ResetPasswordOutput) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) {
        const msg = result.error ?? "Unable to update your password."
        setFormError(msg)
        toast.error("Update failed", { description: msg })
        return
      }

      toast.success("Password updated", { description: result.message ?? "You can continue with your new password." })
      window.location.href = "/sign-in"
    } catch (err) {
      const msg = isNetworkError(err)
        ? "Network error. Check your connection and try again."
        : "Something went wrong while updating your password."
      setFormError(msg)
      toast.error("Update failed", { description: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageLoader open={isSubmitting} label="Updating your password..." />
      <div className="mx-auto max-w-[350px] rounded-2xl border border-border/80 bg-card shadow-sm md:max-w-[500px]">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                New password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a new password"
                  className={cn("h-10 pl-10 pr-11", errors.password && "aria-invalid")}
                  aria-invalid={errors.password ? "true" : "false"}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((c) => !c)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p> : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={cn("h-10 pl-10 pr-11", errors.confirmPassword && "aria-invalid")}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((c) => !c)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="h-10 w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save new password"}
              {!isSubmitting ? <ArrowRight className="size-4" /> : null}
            </Button>
          </form>

          {formError ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Request a new reset link
            </Link>
            {" · "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
