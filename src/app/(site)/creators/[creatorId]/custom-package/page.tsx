import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/elements"
import { buttonVariants } from "@/components/ui/button"
import { CustomPackageRequestForm } from "@/features/creator-profile/components/custom-package-request-form"
import { getCustomPackages, getPackageAssetLimits } from "@/features/creator-profile/lib/custom-package-utils"
import { getCreatorProfileById } from "@/features/creator-profile/lib/get-creator-profile"
import { cn } from "@/lib/utils"
import GridBackground from "@/components/elements/grid-background"
import { ArrowBigLeft, MoveLeft } from "lucide-react"

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
    <main className=" py-8">
      {/* <GridBackground/> */}
      <Container size="lg" className="space-y-6">
        <div className="space-y-3">
          <Link
            href={`/creators/${profile.id}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "")}
          >
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
