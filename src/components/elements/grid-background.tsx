import React from 'react'

const GridBackground = () => {
    return (
        <div>
            <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_10%,transparent)_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_-5%,#000_55%,transparent_100%)]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute top-24 left-1/2 h-px w-[min(72vw,480px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/25 to-transparent"
                aria-hidden
            />
        </div>
    )
}

export default GridBackground