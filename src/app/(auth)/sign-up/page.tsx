import  SignUpForm  from "@/components/forms/sign-up-form"

export default function SignUpPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Join Character Market</h1>
        <p className="mt-2 text-muted-foreground">
          Start collaborating with professional creators and manage your projects in one place.
        </p>
      </div>
      <SignUpForm />
    </>
  )
}
