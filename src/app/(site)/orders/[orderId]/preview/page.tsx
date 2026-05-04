import { redirect } from "next/navigation"

import { OrderDeliveryPreviewView } from "@/features/site/orders/components/order-delivery-preview-view"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type OrderPreviewPageProps = {
  params: Promise<{ orderId: string }>
}

export default async function OrderPreviewPage({ params }: OrderPreviewPageProps) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const { orderId } = await params
  return <OrderDeliveryPreviewView orderId={orderId} />
}
