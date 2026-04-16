import Link from "next/link"

import { Container } from "@/components/shared"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import GridBackground from "@/components/shared/grid-background"

type SubHeroBreadcrumb = {
  label: string
  href?: string
}

type SubHeroSectionProps = {
  eyebrow: string
  title: string
  description: string
  breadcrumbs?: SubHeroBreadcrumb[]
}

export function SubHeroSection({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: SubHeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-background">
      <GridBackground />

      <Container size="lg" paddingY="md" className="relative mt-20">


        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-center text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-pretty text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumb className="mt-6">
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <BreadcrumbItem key={`${item.label}-${index}`}>
                  {item.href ? (
                    <Link href={item.href} className="transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}

                  {index < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </Container>
    </section>
  )
}
