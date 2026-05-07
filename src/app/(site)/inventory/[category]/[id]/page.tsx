"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { LoaderCircle } from "lucide-react"

import {
  InventoryDetailView,
  isInventoryCategory,
  type InventoryDetail,
} from "@/features/site/inventory"

export default function InventoryDetailPage() {
  const params = useParams()
  const category = typeof params.category === "string" ? params.category : ""
  const id = typeof params.id === "string" ? params.id : ""

  const [detail, setDetail] = useState<InventoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isInventoryCategory(category) || !id) return

    async function fetchDetail() {
      try {
        const response = await fetch(`/api/site/inventory?category=${category}&id=${id}`)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const json = await response.json()
        if (json.detail) {
          setDetail(json.detail)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Failed to fetch inventory detail:", err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [category, id])

  if (!isInventoryCategory(category)) {
    notFound()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-24">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !detail) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <InventoryDetailView detail={detail} />
    </main>
  )
}
