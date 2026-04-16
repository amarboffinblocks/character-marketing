import Image from "next/image"

import { Container, ProfileAvatar } from "@/components/shared"
import { Badge } from "@/components/ui/badge"

import { CreatorProfileToolbar } from "@/features/site/creator-profile/components/creator-profile-toolbar"
import type { CreatorProfile } from "@/features/site/creator-profile/types"

type CreatorProfileHeaderProps = {
  profile: CreatorProfile
  profilePath: string
  mailtoHref: string
}

/**
 * Cover image, overlapping square avatar, identity block, and primary actions.
 */
export function CreatorProfileHeader({ profile, profilePath, mailtoHref }: CreatorProfileHeaderProps) {
  const coverAlt = `Cover image for ${profile.name}`

  return (
    <>
      {/* Balanced hero banner height across breakpoints */}
      <div className="relative h-[min(360px,34vh)] min-h-[200px] w-full overflow-hidden bg-muted sm:min-h-[230px] sm:h-[min(400px,33vh)] lg:min-h-[260px] lg:h-[min(440px,36vh)]">
        <Image
          src={profile.coverImage}
          alt={coverAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/35 to-transparent"
          aria-hidden
        />
      </div>

      <Container size="xl" className="relative -mt-10 sm:-mt-12 lg:-mt-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            <ProfileAvatar
              src={profile.avatar}
              alt={`${profile.name} profile photo`}
              isVerified={profile.isVerified}
              size="lg"
            />

            <div className="min-w-0 pb-0.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {profile.name}
                </h1>
                {profile.isAvailable ? (
                  <Badge className="border-0 bg-emerald-600 font-medium text-white hover:bg-emerald-600/90">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary">Away</Badge>
                )}
              </div>
              <p className="mt-1 text-muted-foreground">@{profile.handle}</p>
            </div>
          </div>

          <CreatorProfileToolbar
            creatorName={profile.name}
            profilePath={profilePath}
            mailtoHref={mailtoHref}
            className="w-full sm:w-auto"
          />
        </div>
      </Container>
    </>
  )
}
