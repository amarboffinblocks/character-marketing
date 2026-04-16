"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must contain only numbers"),
})

type OtpOutput = z.infer<typeof otpSchema>
type OtpInput = z.input<typeof otpSchema>

export default function OTPForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<OtpInput, unknown, OtpOutput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  })

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <div className="mx-auto max-w-[350px] rounded-2xl border border-border/80 bg-card shadow-sm md:max-w-[500px]">
      <div className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-foreground">
              6-digit verification code
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                className={cn("h-10 pl-10 tracking-[0.3em]", errors.code && "aria-invalid")}
                aria-invalid={errors.code ? "true" : "false"}
                {...register("code")}
              />
            </div>
            {errors.code ? <p className="mt-1.5 text-xs text-destructive">{errors.code.message}</p> : null}
          </div>

          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify code"}
          </Button>
        </form>

        {isSubmitSuccessful ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">Code accepted. Redirecting...</p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need a new code?{" "}
          <Link href="/verify-email" className="font-medium text-primary hover:underline">
            Resend verification email
          </Link>
        </p>
      </div>
    </div>
  )
}
