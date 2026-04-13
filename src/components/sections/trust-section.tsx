import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, RefreshCw, Lock, UserCheck, ArrowRight } from "lucide-react"

const trustFeatures = [
  {
    icon: Shield,
    title: "Protected Payments",
    description: "Funds are held securely until you approve the final delivery.",
  },
  {
    icon: RefreshCw,
    title: "Revision Guarantee",
    description: "Every order includes revisions to ensure your complete satisfaction.",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description: "Your data and transactions are protected with enterprise-grade security.",
  },
  {
    icon: UserCheck,
    title: "Verified Creators",
    description: "All creators go through our verification process for quality assurance.",
  },
]

export function TrustSection() {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div>
            <span className="text-sm font-medium text-primary">Trust & Safety</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Your Orders Are Protected
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We have built Character Market with safety and trust at its core. Every transaction 
              is protected, and every creator is verified.
            </p>

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/trust-safety">
                  Learn About Our Policies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="rounded-xl bg-background p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
