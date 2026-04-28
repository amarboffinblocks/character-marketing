"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatCurrency,
  type CreatorServicePackage,
} from "@/features/creator/services/services-data"
import { cn } from "@/lib/utils"

export function CreatorServicesView() {
  const [services, setServices] = useState<CreatorServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadServices() {
      setIsLoading(true)
      const response = await fetch("/api/creator/services", { cache: "no-store" })
      const result = (await response.json()) as { items?: CreatorServicePackage[]; error?: string }
      if (!mounted) return

      if (!response.ok) {
        setError(result.error ?? "Unable to load services.")
        setIsLoading(false)
        return
      }

      setServices(result.items ?? [])
      setIsLoading(false)
    }

    void loadServices()
    return () => {
      mounted = false
    }
  }, [])

  async function deleteService(id: string) {
    const confirmed = window.confirm("Delete this service?")
    if (!confirmed) return

    const response = await fetch(`/api/creator/services?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    if (!response.ok) {
      setError("Unable to delete service.")
      return
    }

    setServices((current) => current.filter((item) => item.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Services</h1>
          <p className="text-sm text-muted-foreground">Manage your marketplace service cards.</p>
        </div>
        <Button className="h-9" render={<Link href="/dashboard/creator/services/new" />}>
          <Plus className="size-4" />
          New service
        </Button>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">Loading services...</CardContent>
        </Card>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Plus className="size-4" />
            <p className="text-sm text-muted-foreground">No services yet. Create your first service package.</p>
            <Button size="sm" render={<Link href="/dashboard/creator/services/new" />}>
              Create service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onDelete={deleteService} />
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceCard({
  service,
  onDelete,
}: {
  service: CreatorServicePackage
  onDelete: (id: string) => void
}) {
  const counts = [
    { label: "Persona", value: service.personaCount },
    { label: "Lorebook", value: service.lorebookCount },
    { label: "Background", value: service.backgroundCount },
    { label: "Avatar", value: service.avatarCount },
    { label: "Character", value: service.characterCount },
  ]
  const formattedUpdatedAt = formatServiceUpdatedAt(service.updatedAt)

  return (
    <Card
      className={cn(
        "h-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm",
        service.isRecommended && "border-amber-400/70"
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full bg-amber-500 text-white hover:bg-amber-500/90">Custom Package</Badge>
          <p className="text-sm text-muted-foreground">Flexible and tailored package options</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{service.serviceName}</CardTitle>
              {service.isRecommended ? (
                <Badge className="rounded-full bg-amber-500 text-white hover:bg-amber-500/90">Recommended</Badge>
              ) : null}
            </div>
            <CardDescription>{service.description}</CardDescription>
          </div>
          <div className="text-right">
            {service.discountedPrice ? (
              <>
                <p className="text-sm text-muted-foreground line-through">{formatCurrency(service.price)}</p>
                <p className="text-2xl font-semibold tracking-tight text-amber-600">
                  {formatCurrency(service.discountedPrice)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-semibold tracking-tight text-amber-600">{formatCurrency(service.price)}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/70 bg-background/40">
          <div className="grid grid-cols-[1fr_auto] items-center border-b px-4 py-2.5">
            <p className="font-medium text-foreground">Tokens</p>
            <p className="text-sm text-muted-foreground">{service.tokensLabel}</p>
          </div>
          {counts.map((item) => (
            <div key={item.label} className="grid grid-cols-[1fr_auto] items-center border-b px-4 py-2.5 last:border-b-0">
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                {item.value > 0 ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <XCircle className="size-4 text-rose-500" />
                )}
                {item.value} item{item.value === 1 ? "" : "s"} included
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Package highlights</p>
          {service.highlights.length > 0 ? (
            <ul className="space-y-1.5">
              {service.highlights.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-sm text-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No highlights added.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
          <p className="text-xs text-muted-foreground">Updated {formattedUpdatedAt}</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              render={<Link href={`/dashboard/creator/services/edit?id=${service.id}`} />}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onDelete(service.id)}>
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatServiceUpdatedAt(value: string) {
  if (!value) return "recently"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
