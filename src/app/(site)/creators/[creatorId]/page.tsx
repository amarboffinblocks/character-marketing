import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CreatorProfileView, getCreatorProfileById } from "@/features/site/creator-profile"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type CreatorProfilePageProps = {
  params: Promise<{ creatorId: string }>
}

export async function generateMetadata({ params }: CreatorProfilePageProps): Promise<Metadata> {
  const { creatorId } = await params
  const profile = await getCreatorProfileById(creatorId)
  if (!profile) {
    return { title: "Creator not found" }
  }
  return {
    title: `${profile.name} (@${profile.handle})`,
    description: `View ${profile.name}'s creator profile, specialties, and pricing on Character Market.`,
  }
}

export default async function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { creatorId } = await params
  const profile = await getCreatorProfileById(creatorId)
  if (!profile) {
    notFound()
  }

  let isAuthenticated = false
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isAuthenticated = Boolean(user)
  } catch {
    isAuthenticated = false
  }

  return <CreatorProfileView profile={profile} isAuthenticated={isAuthenticated} />
}
