import Link from "next/link"
import { notFound } from "next/navigation"
import { MoveLeft } from "lucide-react"

import { Container } from "@/components/shared"
import { buttonVariants } from "@/components/ui/button"
import {
  CustomPackageRequestForm,
  getCustomPackages,
  getPackageAssetLimits,
} from "@/features/site/packages"
import { getCreatorProfileById } from "@/features/site/creator-profile"
import { cn } from "@/lib/utils"

type CustomPackageRequestPageProps = {
  params: Promise<{ creatorId: string }>
  searchParams: Promise<{ packageId?: string }>
}

export default async function CustomPackageRequestPage({
  params,
  searchParams,
}: CustomPackageRequestPageProps) {
  const { creatorId } = await params
  const { packageId } = await searchParams
  const profile = getCreatorProfileById(creatorId)

  if (!profile) {
    notFound()
  }

  const customPackages = getCustomPackages(profile.packages)
  const selectedPackage = customPackages.find((pkg) => pkg.id === packageId) ?? customPackages[0]

  if (!selectedPackage) {
    notFound()
  }

  const limits = getPackageAssetLimits(selectedPackage)

  return (
    <main className="py-8">
      <Container size="lg" className="space-y-6">
        <div className="space-y-3">
          <Link href={`/creators/${profile.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "")}>
            <MoveLeft /> Back to Profile
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Custom Package Request</h1>
            <p className="text-sm text-muted-foreground">
              Configure your request with package limits for character assets, personas, lorebook, avatars, and
              backgrounds.
            </p>
          </div>
        </div>

        <CustomPackageRequestForm
          creatorName={profile.name}
          packageTitle={selectedPackage.title}
          packagePrice={selectedPackage.price}
          tokensLabel={selectedPackage.tokensLabel}
          packageDescription={selectedPackage.description}
          limits={limits}
        />
      </Container>
    </main>
  )
}
