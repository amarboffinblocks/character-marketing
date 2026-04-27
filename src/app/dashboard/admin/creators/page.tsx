import { AdminCreatorsView } from "@/features/admin"
import { getMarketplaceCreators } from "@/features/site/marketplace/data/marketplace-server-data"

export default async function AdminCreatorsPage() {
  const creators = await getMarketplaceCreators()
  return <AdminCreatorsView creators={creators} />
}
