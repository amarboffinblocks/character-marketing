import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      sm: "max-w-screen-sm px-4 sm:px-6",
      md: "max-w-3xl px-4 sm:px-6",
      lg: "max-w-5xl px-4 sm:px-6 lg:px-8",
      xl: "max-w-7xl px-4 sm:px-6 lg:px-8",
      full: "max-w-none px-4 sm:px-6 lg:px-8",
    },
    paddingY: {
      none: "",
      sm: "py-12 sm:py-16",
      md: "py-16 sm:py-24",
      lg: "py-20 sm:py-28 lg:py-36",
    },
  },
  defaultVariants: {
    size: "xl",
    paddingY: "none",
  },
})

type ContainerProps = ComponentProps<"div"> &
  VariantProps<typeof containerVariants>

function Container({ className, size, paddingY, ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ size, paddingY, className }))}
      {...props}
    />
  )
}

export { Container, containerVariants }
