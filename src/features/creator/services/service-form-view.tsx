"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { type CreatorServicePackage } from "@/features/creator/services/services-data"

type ServiceFormState = {
  serviceName: string
  description: string
  price: string
  discountedPrice: string
  tokensLabel: string
  personaCount: string
  lorebookCount: string
  backgroundCount: string
  avatarCount: string
  characterCount: string
  isRecommended: boolean
}

const defaultForm: ServiceFormState = {
  serviceName: "",
  description: "",
  price: "",
  discountedPrice: "",
  tokensLabel: "",
  personaCount: "1",
  lorebookCount: "1",
  backgroundCount: "1",
  avatarCount: "1",
  characterCount: "1",
  isRecommended: false,
}

type ServiceFormViewProps = {
  mode: "create" | "edit"
}

export function ServiceFormView({ mode }: ServiceFormViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = mode === "edit" ? searchParams.get("id") ?? "" : ""

  const [form, setForm] = useState<ServiceFormState>(defaultForm)
  const [highlights, setHighlights] = useState<string[]>([])
  const [highlightInput, setHighlightInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isLoadingEdit, setIsLoadingEdit] = useState(mode === "edit")

  const title = mode === "edit" ? "Edit service" : "Create new service"
  const cta = mode === "edit" ? "Save changes" : "Create service"

  useEffect(() => {
    if (mode !== "edit" || !editId) return
    let mounted = true

    async function loadService() {
      setIsLoadingEdit(true)
      const response = await fetch("/api/creator/services", { cache: "no-store" })
      const result = (await response.json()) as { items?: CreatorServicePackage[]; error?: string }
      if (!mounted) return

      const item = result.items?.find((service) => service.id === editId)
      if (!item) {
        setError("Service not found.")
        setIsLoadingEdit(false)
        return
      }

      setForm({
        serviceName: item.serviceName,
        description: item.description,
        price: String(item.price),
        discountedPrice: item.discountedPrice ? String(item.discountedPrice) : "",
        tokensLabel: item.tokensLabel,
        personaCount: String(item.personaCount),
        lorebookCount: String(item.lorebookCount),
        backgroundCount: String(item.backgroundCount),
        avatarCount: String(item.avatarCount),
        characterCount: String(item.characterCount),
        isRecommended: item.isRecommended,
      })
      setHighlights(item.highlights)
      setIsLoadingEdit(false)
    }

    void loadService()
    return () => {
      mounted = false
    }
  }, [editId, mode])

  const normalizedPayload = useMemo(
    () => ({
      serviceName: form.serviceName.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      discountedPrice: form.discountedPrice.trim() ? Number(form.discountedPrice) : null,
      tokensLabel: form.tokensLabel.trim(),
      personaCount: Number(form.personaCount || 0),
      lorebookCount: Number(form.lorebookCount || 0),
      backgroundCount: Number(form.backgroundCount || 0),
      avatarCount: Number(form.avatarCount || 0),
      characterCount: Number(form.characterCount || 0),
      isRecommended: form.isRecommended,
      highlights,
    }),
    [form, highlights]
  )

  function update<Key extends keyof ServiceFormState>(key: Key, value: ServiceFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function addHighlightsFromInput() {
    const next = highlightInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => !highlights.includes(item))
    if (next.length === 0) return
    setHighlights((current) => [...current, ...next])
    setHighlightInput("")
  }

  function onHighlightKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addHighlightsFromInput()
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!normalizedPayload.serviceName) return setError("Service name is required.")
    if (!normalizedPayload.description) return setError("Description is required.")
    if (normalizedPayload.price <= 0) return setError("Price must be greater than 0.")
    if (
      normalizedPayload.discountedPrice !== null &&
      (normalizedPayload.discountedPrice <= 0 || normalizedPayload.discountedPrice >= normalizedPayload.price)
    ) {
      return setError("Discounted price must be lower than price.")
    }
    if (!normalizedPayload.tokensLabel) return setError("Tokens label is required.")

    setIsSubmitting(true)
    const url = "/api/creator/services"
    const method = mode === "edit" ? "PATCH" : "POST"
    const body =
      mode === "edit" ? JSON.stringify({ id: editId, ...normalizedPayload }) : JSON.stringify(normalizedPayload)

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    })

    if (!response.ok) {
      const result = (await response.json()) as { error?: string }
      setError(result.error ?? "Unable to save service.")
      setIsSubmitting(false)
      return
    }

    router.push("/dashboard/creator/services")
    router.refresh()
  }

  if (mode === "edit" && isLoadingEdit) {
    return <div className="py-8 text-sm text-muted-foreground">Loading service...</div>
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Add the package details shown to buyers on your service cards.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
            <CardDescription>Service summary and pricing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="serviceName" className="text-sm font-medium text-foreground">
                Service name
              </label>
              <Input
                id="serviceName"
                value={form.serviceName}
                onChange={(event) => update("serviceName", event.target.value)}
                placeholder="Custom Story Starter"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Great for quick character deployment..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-foreground">
                Price (USD)
              </label>
              <Input
                id="price"
                type="number"
                min={1}
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="discountedPrice" className="text-sm font-medium text-foreground">
                Discounted price (optional)
              </label>
              <Input
                id="discountedPrice"
                type="number"
                min={0}
                value={form.discountedPrice}
                onChange={(event) => update("discountedPrice", event.target.value)}
                placeholder="Leave empty for no discount"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tokensLabel" className="text-sm font-medium text-foreground">
                Tokens label
              </label>
              <Input
                id="tokensLabel"
                value={form.tokensLabel}
                onChange={(event) => update("tokensLabel", event.target.value)}
                placeholder="Up to 4K context tokens"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset counts</CardTitle>
            <CardDescription>What this package includes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { key: "personaCount", label: "Persona" },
              { key: "lorebookCount", label: "Lorebook" },
              { key: "backgroundCount", label: "Background" },
              { key: "avatarCount", label: "Avatar" },
              { key: "characterCount", label: "Character" },
            ].map((item) => (
              <div className="space-y-2" key={item.key}>
                <label htmlFor={item.key} className="text-sm font-medium text-foreground">
                  {item.label}
                </label>
                <Input
                  id={item.key}
                  type="number"
                  min={0}
                  value={form[item.key as keyof ServiceFormState] as string}
                  onChange={(event) =>
                    update(item.key as keyof ServiceFormState, event.target.value as ServiceFormState[keyof ServiceFormState])
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package highlights</CardTitle>
            <CardDescription>Use Enter/comma/add to register highlights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={highlightInput}
                onChange={(event) => setHighlightInput(event.target.value)}
                onKeyDown={onHighlightKeyDown}
                placeholder="Add highlight"
              />
              <Button type="button" variant="outline" className="min-w-20 h-10 gap-1.5" onClick={addHighlightsFromInput}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((highlight) => (
                <button
                  key={highlight}
                  type="button"
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                  onClick={() => setHighlights((current) => current.filter((item) => item !== highlight))}
                >
                  {highlight} x
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <input
                id="isRecommended"
                type="checkbox"
                checked={form.isRecommended}
                onChange={(event) => update("isRecommended", event.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              <div>
                <label htmlFor="isRecommended" className="text-sm font-medium">
                  Mark as recommended
                </label>
                <p className="text-xs text-muted-foreground">Shows the recommended badge on this service card.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {cta}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/creator/services")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
