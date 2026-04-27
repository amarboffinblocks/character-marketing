import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Globe,
  Link2,
  Shield,
  Store,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminUserRecord } from "@/features/admin/admin-users-data"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
import { getMarketplaceCreatorProfileById } from "@/features/site/marketplace/data/marketplace-server-data"
import { cn } from "@/lib/utils"

const roleBadge: Record<
  NonNullable<ReturnType<typeof getAdminUserRecord>>["role"],
  "default" | "secondary" | "outline"
> = {
  buyer: "secondary",
  creator: "default",
  admin: "outline",
}

type AdminUserProfileViewProps = {
  userId: string
}

export async function AdminUserProfileView({ userId }: AdminUserProfileViewProps) {
  const user = getAdminUserRecord(userId)
  if (!user) {
    notFound()
  }

  const creatorProfile = user.linkedCreatorId
    ? await getMarketplaceCreatorProfileById(user.linkedCreatorId)
    : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 w-fit gap-1.5 text-muted-foreground"
            render={<Link href="/dashboard/admin/users" />}
          >
            <ArrowLeft className="size-4" />
            Users directory
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {user.displayName}
            </h1>
            <Badge variant={roleBadge[user.role]} className="capitalize">
              {user.role}
            </Badge>
            <Badge variant={user.status === "active" ? "default" : "destructive"}>
              {user.status}
            </Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9" type="button">
            Impersonate (demo)
          </Button>
          <Button variant="outline" size="sm" className="h-9" type="button">
            Suspend
          </Button>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Platform account</CardTitle>
            </div>
            <CardDescription>Identity and activity (demo).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <ProfileField label="Email" value={user.email} mono />
            <ProfileField label="Country" value={user.country} />
            <ProfileField label="Timezone" value={user.timezone} />
            <ProfileField label="Joined" value={user.joinedAt} />
            <ProfileField label="Last active" value={user.lastActiveAt} />
            <ProfileField
              label="2FA"
              value={user.twoFactorEnabled ? "Enabled" : "Off"}
            />
            <ProfileField
              label="Lifetime orders"
              value={String(user.ordersCount)}
              tabular
            />
            <ProfileField
              label="Lifetime spend (buyer)"
              value={user.lifetimeSpendUsd > 0 ? formatUsd(user.lifetimeSpendUsd) : "—"}
              tabular
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Trust & notes</CardTitle>
            </div>
            <CardDescription>Flags and internal comments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Flags</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.flags.length === 0 ? (
                  <span className="text-sm text-muted-foreground">None</span>
                ) : (
                  user.flags.map((f) => (
                    <Badge key={f} variant="secondary">
                      {f}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Internal notes</p>
              <p className="mt-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-sm text-foreground">
                {user.notes || "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {user.role === "creator" && creatorProfile ? (
        <Card className="border-primary/20 bg-linear-to-br from-primary/8 via-background to-background">
          <CardHeader className="border-b border-primary/15 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Store className="size-4 text-primary" />
                <CardTitle className="text-base">Marketplace creator profile</CardTitle>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Link2 className="size-3" />
                Linked
              </Badge>
            </div>
            <CardDescription>
              Same person as the platform user — storefront data from the public catalog.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-44 sm:w-56">
                <Image
                  src={creatorProfile.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 224px"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="relative size-14 overflow-hidden rounded-full ring-2 ring-background">
                    <Image
                      src={creatorProfile.avatar}
                      alt=""
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{creatorProfile.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      @{creatorProfile.handle} · {creatorProfile.id}
                    </p>
                  </div>
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Rating</dt>
                    <dd className="font-medium tabular-nums">
                      {creatorProfile.rating.toFixed(1)} ({creatorProfile.reviewCount} reviews)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">From</dt>
                    <dd className="font-medium tabular-nums">
                      {formatUsd(creatorProfile.startingPrice)}+
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Response</dt>
                    <dd>{creatorProfile.responseTime}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Completed</dt>
                    <dd className="tabular-nums">{creatorProfile.completedOrders}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" render={<Link href={`/dashboard/admin/creators/${creatorProfile.id}`} />}>
                    Open admin creator
                    <ArrowUpRight className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/creators/${creatorProfile.id}`} />}
                  >
                    <Globe className="size-3.5" />
                    Public storefront
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {user.role === "creator" && !creatorProfile ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No linked marketplace creator ID for this profile (demo gap).
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function ProfileField({
  label,
  value,
  mono,
  tabular,
}: {
  label: string
  value: string
  mono?: boolean
  tabular?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm text-foreground",
          mono && "font-mono text-xs",
          tabular && "tabular-nums"
        )}
      >
        {value}
      </p>
    </div>
  )
}
