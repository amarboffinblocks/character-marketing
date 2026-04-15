import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

type ProfileAvatarProps = {
  src: string
  alt: string
  isVerified?: boolean
  size?: "md" | "lg"
  className?: string
}

const sizeClasses: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
  md: "size-20 sm:size-24",
  lg: "size-24 sm:size-28",
}

/**
 * Reusable profile avatar with optional verification badge.
 */
function ProfileAvatar({
  src,
  alt,
  isVerified = false,
  size = "lg",
  className,
}: ProfileAvatarProps) {
  return (
    <div className={cn("relative inline-flex w-fit shrink-0 self-start overflow-visible", className)}>
      <Image
        src={src}
        alt={alt}
        width={112}
        height={112}
        className={cn(
          "rounded-xl object-cover shadow-lg ring-4 ring-background",
          sizeClasses[size]
        )}
      />
      {isVerified ? (
        <span
          className="absolute -right-1.5 -bottom-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background"
          aria-label="Verified creator"
        >
          <CheckCircle2 className="size-4" aria-hidden />
        </span>
      ) : null}
    </div>
  )
}

export { ProfileAvatar }
