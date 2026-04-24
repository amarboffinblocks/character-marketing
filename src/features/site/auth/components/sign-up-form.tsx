"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/page-loader"
import { SIGN_IN_ALLOWED_ROLES, type SignInAllowedRole } from "@/lib/auth-roles"
import { cn } from "@/lib/utils"

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email"),
    role: z.enum(SIGN_IN_ALLOWED_ROLES),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

type SignUpOutput = z.infer<typeof signUpSchema>
type SignUpInput = z.input<typeof signUpSchema>

type SignUpFormProps = {
  role: SignInAllowedRole
}

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

export default function SignUpForm({ role }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState(false)
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput, unknown, SignUpOutput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role,
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: SignUpOutput) => {
    setIsSubmitting(true)
    setFormError(null)
    setFormMessage(null)

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          role,
        }),
      })

      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) {
        setFormError(result.error ?? "Failed to create account.")
        toast.error("Sign up failed", { description: result.error ?? "Please try again." })
        return
      }

      setFormMessage(result.message ?? "Account created successfully.")
      toast.success("Account created", {
        description: result.message ?? "Check your inbox to verify your email.",
      })
    } catch {
      setFormError("Something went wrong while creating your account.")
      toast.error("Sign up failed", { description: "Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSocialSignUp = async (provider: "google" | "x") => {
    setIsSocialLoading(true)
    setFormError(null)

    try {
      const response = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          role,
        }),
      })

      const result = (await response.json()) as { error?: string; url?: string }
      if (!response.ok || !result.url) {
        setFormError(result.error ?? "Unable to start social sign up.")
        toast.error("Social sign up failed", { description: result.error ?? "Please try again." })
        return
      }

      window.location.href = result.url
    } catch {
      setFormError("Something went wrong while starting social sign up.")
      toast.error("Social sign up failed", { description: "Please try again." })
    } finally {
      setIsSocialLoading(false)
    }
  }

  return (
    <>
      <PageLoader open={isSubmitting || isSocialLoading} label={isSocialLoading ? "Connecting account..." : "Creating your account..."} />
      <div className="mx-auto max-w-[350px] rounded-2xl border border-border/80 bg-card shadow-sm md:max-w-[500px]">
        <div className="p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2 font-medium" onClick={() => onSocialSignUp("google")} disabled={isSubmitting || isSocialLoading}>
            <GoogleIcon />
            Google
          </Button>
          <Button variant="outline" className="gap-2 font-medium" onClick={() => onSocialSignUp("x")} disabled={isSubmitting || isSocialLoading}>
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
          <input type="hidden" value={role} {...register("role")} />

          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-foreground">
              Full name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Jane Creator"
                className={cn("h-10 pl-10", errors.fullName && "aria-invalid")}
                aria-invalid={errors.fullName ? "true" : "false"}
                {...register("fullName")}
              />
            </div>
            {errors.fullName ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.fullName.message}</p>
            ) : null}
          </div>

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
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                className={cn("h-10 pl-10 pr-11", errors.password && "aria-invalid")}
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password ? <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
              Confirm password
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
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="h-10 w-full gap-2" disabled={isSubmitting || isSocialLoading}>
            {isSubmitting ? "Creating account..." : "Create account"}
            {!isSubmitting ? <ArrowRight className="size-4" /> : null}
          </Button>
        </form>

        {formError ? (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}
        {formMessage ? (
          <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {formMessage}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </>
  )
}
