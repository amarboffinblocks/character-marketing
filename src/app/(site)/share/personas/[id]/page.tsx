import { Container } from "@/components/shared"
import { PersonaReadView } from "@/features/creator/workspace/personas/persona-read-view"

export default async function PublicPersonaSharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Container size="xl" className="mt-14 px-2 py-6 sm:px-4 lg:px-6">
      <PersonaReadView
        entityId={id}
        apiPathPrefix="/api/public/personas"
        backHref="/"
        backLabel="Back to Home"
      />
    </Container>
  )
}
