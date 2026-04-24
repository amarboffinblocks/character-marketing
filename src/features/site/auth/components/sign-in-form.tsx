"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/page-loader"
import { type AuthRole } from "@/lib/auth-roles"
import { cn } from "@/lib/utils"

const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().default(false),
})

type SignInSchema = z.infer<typeof signInSchema>
type SignInFormInput = z.input<typeof signInSchema>

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3l3 2.3c1.8-1.6 2.8-4.1 2.8-7 0-.7-.1-1.4-.2-2.1H12z"
      />
      <path
        fill="#34A853"
        d="M12 21c2.5 0 4.6-.8 6.2-2.2l-3-2.3c-.8.6-1.9 1-3.2 1-2.4 0-4.4-1.6-5.1-3.8l-3.1 2.4C5.5 19 8.5 21 12 21z"
      />
      <path
        fill="#4A90E2"
        d="M6.9 13.7c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9L3.8 7.5C3.3 8.8 3 10.3 3 11.8c0 1.5.3 3 1 4.3l2.9-2.4z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.1c1.3 0 2.4.4 3.3 1.3l2.5-2.5C16.5 3.6 14.4 2.8 12 2.8c-3.5 0-6.5 2-8 4.9l3.1 2.4c.7-2.2 2.7-4 4.9-4z"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M18.9 2h3.1l-6.8 7.8L23 22h-6.2l-4.9-6.8L5.9 22H2.8l7.3-8.3L1 2h6.4l4.4 6.2L18.9 2zm-1.1 18h1.7L6.5 3.9H4.7L17.8 20z" />
    </svg>
  )
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInput, unknown, SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const authErrorFromQuery = searchParams.get("error")
  const authErrorDescription = searchParams.get("error_description")
  const queryErrorMessage =
    authErrorFromQuery === "oauth_code_missing"
      ? "OAuth code is missing. Please try again."
      : authErrorFromQuery === "oauth_exchange_failed"
        ? "OAuth verification failed. Please try again."
        : authErrorFromQuery === "user_not_found"
          ? "No account was found after OAuth sign in."
          : authErrorFromQuery === "user_not_registered_oauth"
            ? "This social account is not registered. Please sign up first."
          : authErrorFromQuery === "role_assignment_failed"
            ? "We could not set your account role. Please try again."
            : authErrorFromQuery === "unauthorized_role"
              ? "This account role is not allowed in this sign-in flow."
              : authErrorDescription
                ? decodeURIComponent(authErrorDescription)
              : null

  const onSubmit = async (values: SignInSchema) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const result = (await response.json()) as { error?: string; role?: AuthRole }
      if (!response.ok) {
        setFormError(result.error ?? "Sign in failed.")
        toast.error("Sign in failed", { description: result.error ?? "Please try again." })
        return
      }

      toast.success("Signed in successfully")
      window.location.href =
        result.role === "admin" ? "/dashboard/admin" : result.role === "creator" ? "/dashboard/creator" : "/"
    } catch {
      setFormError("Something went wrong while signing in. Please try again.")
      toast.error("Unable to sign in", { description: "Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSocialSignIn = async (provider: "google" | "x") => {
    setIsSocialLoading(true)
    setFormError(null)

    try {
      const response = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
        }),
      })

      const result = (await response.json()) as { error?: string; url?: string }
      if (!response.ok || !result.url) {
        setFormError(result.error ?? "Unable to start social sign in.")
        toast.error("Social sign in failed", { description: result.error ?? "Please try again." })
        return
      }

      window.location.href = result.url
    } catch {
      setFormError("Something went wrong while starting social sign in.")
      toast.error("Social sign in failed", { description: "Please try again." })
    } finally {
      setIsSocialLoading(false)
    }
  }

  return (
    <>
      <PageLoader open={isSubmitting || isSocialLoading} label={isSocialLoading ? "Connecting account..." : "Signing you in..."} />
      <div className="mx-auto max-w-[350px] rounded-2xl border border-border/80 bg-card shadow-sm md:max-w-[500px]">
        <div className="p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2 font-medium" onClick={() => onSocialSignIn("google")} disabled={isSubmitting || isSocialLoading}>
            <GoogleIcon />
            Google
          </Button>
          <Button variant="outline" className="gap-2 font-medium" onClick={() => onSocialSignIn("x")} disabled={isSubmitting || isSocialLoading}>
            <XIcon />
            Twitter 
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">or continue with email</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email address
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

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn("h-10 pl-10 pr-11", errors.password && "aria-invalid")}
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-input accent-primary"
              {...register("remember")}
            />
            Remember me for 30 days
          </label>

          <Button type="submit" className="h-10 w-full gap-2" disabled={isSubmitting || isSocialLoading}>
            {isSubmitting ? (
              <>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        {formError || queryErrorMessage ? (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError ?? queryErrorMessage}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Join free
          </Link>
        </p>
        </div>
      </div>
    </>
  )
}
