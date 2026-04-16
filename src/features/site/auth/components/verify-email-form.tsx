"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const verifyEmailSchema = z.object({
  email: z.email("Enter a valid email"),
})

type VerifyEmailOutput = z.infer<typeof verifyEmailSchema>
type VerifyEmailInput = z.input<typeof verifyEmailSchema>

export default function VerifyEmailForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<VerifyEmailInput, unknown, VerifyEmailOutput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
  }

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

          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending verification email..." : "Resend verification email"}
          </Button>
        </form>

        {isSubmitSuccessful ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Verification email sent. Check your inbox and spam folder.
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
