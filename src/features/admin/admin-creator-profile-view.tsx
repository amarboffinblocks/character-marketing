import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Globe,
  Link2,
  Shield,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminCreatorExtra } from "@/features/admin/admin-creator-extras"
import { getAdminUserRecord } from "@/features/admin/admin-users-data"
import { formatUsd } from "@/features/creator/earnings/earnings-data"
import { getMarketplaceCreatorProfileById } from "@/features/site/marketplace/data/marketplace-server-data"
import { cn } from "@/lib/utils"

type AdminCreatorProfileViewProps = {
  creatorId: string
}

export async function AdminCreatorProfileView({ creatorId }: AdminCreatorProfileViewProps) {
  const creator = await getMarketplaceCreatorProfileById(creatorId)
  if (!creator) {
    notFound()
  }

  const extra = getAdminCreatorExtra(creatorId)
  const linkedUser = extra.linkedUserId ? getAdminUserRecord(extra.linkedUserId) : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 w-fit gap-1.5 text-muted-foreground"
            render={<Link href="/dashboard/admin/creators" />}
          >
            <ArrowLeft className="size-4" />
            Creators directory
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {creator.name}
            </h1>
            {creator.isVerified ? (
              <Badge variant="secondary">Verified</Badge>
            ) : (
              <Badge variant="outline">Unverified</Badge>
            )}
            {creator.isAvailable ? (
              <Badge>Accepting orders</Badge>
            ) : (
              <Badge variant="outline">Unavailable</Badge>
            )}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            @{creator.handle} · {creator.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            render={<Link href={`/creators/${creator.id}`} />}
          >
            <Globe className="size-3.5" />
            Public storefront
          </Button>
          {linkedUser ? (
            <Button size="sm" className="h-9" render={<Link href={`/dashboard/admin/users/${linkedUser.id}`} />}>
              Linked user account
              <ArrowUpRight className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="overflow-hidden border-primary/20 p-0">
        <div className="relative h-40 w-full sm:h-48">
          <Image
            src={creator.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
        </div>
        <CardContent className="relative -mt-14 flex flex-col gap-6 pb-6 sm:-mt-16 sm:flex-row sm:items-end sm:gap-8">
          <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-lg ring-1 ring-border">
            <Image
              src={creator.avatar}
              alt=""
              width={96}
              height={96}
              className="size-full object-cover"
            />
          </span>
          <div className="min-w-0 flex-1 space-y-3 pb-1">
            <div className="flex flex-wrap gap-2">
              {creator.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="font-normal">
                  {s}
                </Badge>
              ))}
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Rating</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {creator.rating.toFixed(1)} <span className="font-normal text-muted-foreground">({creator.reviewCount} reviews)</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Starting at</dt>
                <dd className="font-semibold tabular-nums">{formatUsd(creator.startingPrice)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Response</dt>
                <dd>{creator.responseTime}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Completed orders</dt>
                <dd className="font-semibold tabular-nums">{creator.completedOrders}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Admin & payouts</CardTitle>
            </div>
            <CardDescription>Operational metadata (demo).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Payout tier</p>
              <p className="font-medium capitalize text-foreground">{extra.payoutTier}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">YTD GMV (admin)</p>
              <p className="font-medium tabular-nums text-foreground">{formatUsd(extra.ytdGmvUsd)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Open disputes</p>
              <p className={cn("font-medium tabular-nums", extra.openDisputes > 0 && "text-amber-700 dark:text-amber-300")}>
                {extra.openDisputes}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last payout</p>
              <p className="font-medium text-foreground">{extra.lastPayoutAt}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Internal notes</p>
              <p className="mt-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-sm text-foreground">
                {extra.internalNotes}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-linear-to-br from-primary/6 to-card">
          <CardHeader className="border-b border-primary/10 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="text-base">Linked platform user</CardTitle>
              </div>
              {linkedUser ? (
                <Badge variant="secondary" className="gap-1">
                  <Link2 className="size-3" />
                  Linked
                </Badge>
              ) : (
                <Badge variant="outline">Not linked</Badge>
              )}
            </div>
            <CardDescription>
              Same person’s login account — password, 2FA, and suspension state live here.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {linkedUser ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{linkedUser.displayName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{linkedUser.id}</p>
                    <p className="text-sm text-muted-foreground">{linkedUser.email}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="capitalize">
                      {linkedUser.role}
                    </Badge>
                    <Badge variant={linkedUser.status === "active" ? "default" : "destructive"}>
                      {linkedUser.status}
                    </Badge>
                  </div>
                </div>
                <dl className="grid gap-2 border-t border-border/60 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Last active</dt>
                    <dd>{linkedUser.lastActiveAt}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">2FA</dt>
                    <dd>{linkedUser.twoFactorEnabled ? "On" : "Off"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Country</dt>
                    <dd>{linkedUser.country}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Joined</dt>
                    <dd>{linkedUser.joinedAt}</dd>
                  </div>
                </dl>
                <Button render={<Link href={`/dashboard/admin/users/${linkedUser.id}`} />}>
                  Open full user profile
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No `linkedUserId` in admin extras for this creator — connect accounts in your directory
                sync (demo).
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
