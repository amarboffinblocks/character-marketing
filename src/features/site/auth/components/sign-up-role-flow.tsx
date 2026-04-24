"use client"

import { useState } from "react"
import { ArrowRight, Sparkles, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type SignInAllowedRole } from "@/lib/auth-roles"

import SignUpForm from "./sign-up-form"

export default function SignUpRoleFlow() {
  const [selectedRole, setSelectedRole] = useState<SignInAllowedRole | null>(null)

  if (!selectedRole) {
    return (
      <div className="mx-auto py-8 w-full   sm:py-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Create Account</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">How do you want to join?</h1>
          <p className="mt-2 text-muted-foreground">
            Pick your path and we will prepare the right onboarding flow for you.
          </p>
        </div>

        <div className="mt-8 grid gap-12 w-full sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedRole("creator")}
            className="group rounded-xl border border-border bg-background p-5 text-left transition hover:border-primary/40 hover:bg-primary/5 "
          >
            <Sparkles className="size-5 text-primary" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">Become a Creator</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sell your creative services, manage orders, and grow your profile.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Continue as creator <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("user")}
            className="group rounded-xl border border-border bg-background p-5 text-left transition hover:border-primary/40 hover:bg-primary/5"
          >
            <Users className="size-5 text-primary" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">Hire a Creator</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse talent, place custom orders, and track your projects.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Continue as user <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {selectedRole === "creator" ? "Start as a Creator" : "Hire Top Creators"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {selectedRole === "creator"
            ? "Set up your creator account and start receiving client briefs."
            : "Create your account to discover and hire professional creators."}
        </p>
      </div>

      <SignUpForm role={selectedRole} />

      <div className="mt-4 text-center">
        <Button variant="ghost" onClick={() => setSelectedRole(null)}>
          Choose a different account type
        </Button>
      </div>
    </>
  )
}
