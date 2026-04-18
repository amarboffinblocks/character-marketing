"use client"

import { useMemo, useState } from "react"
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  creatorServices,
  formatCurrency,
  type ServicePackage,
  type ServiceStatus,
} from "@/features/creator/services/services-data"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | ServiceStatus

const statusLabel: Record<ServiceStatus, string> = {
  active: "Active",
  draft: "Draft",
  paused: "Paused",
}

const statusClass: Record<ServiceStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  draft: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  paused: "bg-muted text-muted-foreground",
}

export function CreatorServicesView() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return creatorServices.filter((service) => {
      const matchesStatus = statusFilter === "all" ? true : service.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter])

  const totalActive = creatorServices.filter((item) => item.status === "active").length
  const totalOrders = creatorServices.reduce((acc, item) => acc + item.totalOrders, 0)
  const averageConversion = creatorServices.length
    ? Math.round(
        creatorServices.reduce((acc, item) => acc + item.conversionRate, 0) / creatorServices.length
      )
    : 0

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <BadgeCheck className="size-5" />
            </span>
            <div className="space-y-1.5">
              <Badge variant="secondary" className="w-fit">Services catalog</Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Services
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Configure your package catalog, tiered pricing, delivery timelines, and add-ons.
              </p>
            </div>
          </div>
          <Button className="h-9">
            <Plus className="size-4" />
            New Service
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Active services</CardDescription>
            <CardTitle className="text-2xl">{totalActive}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Out of {creatorServices.length} total packages
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Lifetime orders</CardDescription>
            <CardTitle className="text-2xl">{totalOrders}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Across all service packages
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Avg conversion</CardDescription>
            <CardTitle className="text-2xl">{averageConversion}%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Visitors who purchase a package
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardDescription>Performance</CardDescription>
            <CardTitle className="text-2xl">Healthy</CardTitle>
          </CardHeader>
          <CardContent className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <BarChart3 className="size-3.5" />
            Stable volume this week
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services by name, category, or description"
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No services match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceCard({ service }: { service: ServicePackage }) {
  const startingPrice = Math.min(...service.tiers.map((tier) => tier.price))

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{service.category}</Badge>
              <Badge variant="secondary" className={cn("capitalize", statusClass[service.status])}>
                {statusLabel[service.status]}
              </Badge>
            </div>
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <CardDescription>{service.description}</CardDescription>
            <div className="pt-1">
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(startingPrice)}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Service actions"
                  className="shrink-0"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>
                <Pencil className="size-4" />
                Edit service
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="size-4" />
                Preview storefront
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 py-4 lg:grid-cols-3">
        {service.tiers.map((tier) => (
          <div
            key={tier.tier}
            className={cn(
              "rounded-xl border border-border/70 p-4 transition-colors hover:border-primary/40",
              tier.tier === "standard" && "border-primary/40 bg-primary/5"
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm font-semibold capitalize text-foreground">{tier.tier}</p>
              </div>
              {tier.tier === "standard" ? (
                <Badge variant="secondary" className="bg-primary/15 text-primary">
                  Popular
                </Badge>
              ) : null}
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {formatCurrency(tier.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {tier.deliveryDays} day delivery · {tier.revisions} revisions
            </p>
            <ul className="mt-3 space-y-1.5 text-xs">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>

      {service.addOns.length > 0 ? (
        <CardContent className="border-t pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Add-ons</p>
          <div className="flex flex-wrap gap-2">
            {service.addOns.map((addOn) => (
              <Badge key={addOn.id} variant="outline" className="h-6">
                {addOn.label} · {formatCurrency(addOn.price)}
              </Badge>
            ))}
          </div>
        </CardContent>
      ) : null}

      <CardContent className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Orders: <span className="font-medium text-foreground">{service.totalOrders}</span>
          </span>
          <span>
            Conversion:{" "}
            <span className="font-medium text-foreground">{service.conversionRate}%</span>
          </span>
          <span>Updated {service.updatedAt}</span>
        </div>
        {service.status === "draft" ? (
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
            <ShieldAlert className="size-3.5" />
            Publish to start receiving orders
          </span>
        ) : null}
        <a href="#" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7")}>
          Edit details
        </a>
      </CardContent>
    </Card>
  )
}
