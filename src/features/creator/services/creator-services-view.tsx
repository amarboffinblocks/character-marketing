"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Pencil, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, type CreatorServicePackage } from "@/features/creator/services/services-data"

export function CreatorServicesView() {
  const [services, setServices] = useState<CreatorServicePackage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [recommendedFilter, setRecommendedFilter] = useState<"all" | "recommended" | "not_recommended">("all")
  const [createdAfterFilter, setCreatedAfterFilter] = useState("")
  const [updatedAfterFilter, setUpdatedAfterFilter] = useState("")

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

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const nameMatches = service.serviceName.toLowerCase().includes(nameFilter.trim().toLowerCase())
      const recommendationMatches =
        recommendedFilter === "all"
          ? true
          : recommendedFilter === "recommended"
            ? service.isRecommended
            : !service.isRecommended

      const createdMatches = createdAfterFilter
        ? new Date(service.createdAt).getTime() >= new Date(createdAfterFilter).getTime()
        : true
      const updatedMatches = updatedAfterFilter
        ? new Date(service.updatedAt).getTime() >= new Date(updatedAfterFilter).getTime()
        : true

      return nameMatches && recommendationMatches && createdMatches && updatedMatches
    })
  }, [createdAfterFilter, nameFilter, recommendedFilter, services, updatedAfterFilter])

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Services</h1>
          <p className="text-sm text-muted-foreground">Manage your services with important details only.</p>
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
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Input
                placeholder="Filter by name..."
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
              />
              <select
                aria-label="Filter by recommended status"
                value={recommendedFilter}
                onChange={(event) =>
                  setRecommendedFilter(event.target.value as "all" | "recommended" | "not_recommended")
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="all">All services</option>
                <option value="recommended">Recommended only</option>
                <option value="not_recommended">Not recommended only</option>
              </select>
              <Input
                type="datetime-local"
                value={createdAfterFilter}
                onChange={(event) => setCreatedAfterFilter(event.target.value)}
                aria-label="Created after"
              />
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Recommended</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Updated at</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Discounted price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        No services match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <span className="inline-flex items-center gap-2">
                            <BriefcaseBusiness className="size-4 text-muted-foreground" />
                            <span>{service.serviceName}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          {service.isRecommended ? (
                            <Badge className="rounded-full bg-amber-500 text-white hover:bg-amber-500/90">
                              Recommended
                            </Badge>
                          ) : (
                            <span aria-hidden>&nbsp;</span>
                          )}
                        </TableCell>
                        <TableCell>{formatServiceDateTime(service.createdAt)}</TableCell>
                        <TableCell>{formatServiceDateTime(service.updatedAt)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(service.price)}</TableCell>
                        <TableCell className="text-right">
                          {service.discountedPrice ? formatCurrency(service.discountedPrice) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                        
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              render={<Link href={`/dashboard/creator/services/edit?id=${service.id}`} />}
                              aria-label={`Edit ${service.serviceName}`}
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteService(service.id)}
                              aria-label={`Delete ${service.serviceName}`}
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatServiceDateTime(value: string) {
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
