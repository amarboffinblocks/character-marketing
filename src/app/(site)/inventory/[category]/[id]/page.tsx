import { notFound } from "next/navigation"

import {
  getInventoryDetail,
  getInventoryStaticParams,
  InventoryDetailView,
  isInventoryCategory,
} from "@/features/site/inventory"

type PageProps = {
  params: Promise<{ category: string; id: string }>
}

export function generateStaticParams() {
  return getInventoryStaticParams()
}

export default async function InventoryDetailPage({ params }: PageProps) {
  const { category: categoryParam, id } = await params
  if (!isInventoryCategory(categoryParam)) {
    notFound()
  }

  const detail = getInventoryDetail(categoryParam, id)
  if (!detail) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <InventoryDetailView detail={detail} />
    </main>
  )
}
