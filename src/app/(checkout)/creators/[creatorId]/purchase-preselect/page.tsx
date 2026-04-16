import Link from "next/link"
import { notFound } from "next/navigation"
import { MoveLeft } from "lucide-react"

import { Container } from "@/components/shared"
import { buttonVariants } from "@/components/ui/button"
import { PurchasePreselectForm } from "@/features/site/packages"
import { getCreatorProfileById } from "@/features/site/creator-profile"
import { cn } from "@/lib/utils"

type PurchasePreselectPageProps = {
  params: Promise<{ creatorId: string }>
  searchParams: Promise<{ packageId?: string }>
}

export default async function PurchasePreselectPage({
  params,
  searchParams,
}: PurchasePreselectPageProps) {
  const { creatorId } = await params
  const { packageId } = await searchParams
  const profile = getCreatorProfileById(creatorId)

  if (!profile) {
    notFound()
  }

  const selectedPackage = profile.packages.find((pkg) => pkg.id === packageId) ?? profile.packages[0]

  if (!selectedPackage) {
    notFound()
  }

  return (
    <main className="py-8">
      <Container size="lg" className="space-y-6">
        <div className="space-y-3">
          <Link href={`/creators/${profile.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "")}>
            <MoveLeft /> Back to Profile
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Purchase Pre-Select Package</h1>
            <p className="text-sm text-muted-foreground">
              Configure your package details before checkout and send the request to the creator.
            </p>
          </div>
        </div>

        <PurchasePreselectForm
          creatorName={profile.name}
          packageTitle={selectedPackage.title}
          packagePrice={selectedPackage.price}
          tokensLabel={selectedPackage.tokensLabel}
        />
      </Container>
    </main>
  )
}
