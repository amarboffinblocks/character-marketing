import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type AssetDistributionSlice = {
  label: string
  value: number
  href: string
  colorClass: string
}

type AssetDistributionDonutProps = {
  slices: AssetDistributionSlice[]
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  }
}

export function AssetDistributionDonut({ slices }: AssetDistributionDonutProps) {
  const total = slices.reduce((acc, slice) => acc + slice.value, 0)
  const size = 220
  const center = size / 2
  const radius = 88
  const strokeWidth = 22

  const arcs = slices.reduce<
    Array<
      AssetDistributionSlice & {
        start: number
        end: number
        percentage: number
      }
    >
  >((acc, slice) => {
    const previousEnd = acc.length === 0 ? 0 : acc[acc.length - 1].end
    const portion = total === 0 ? 0 : slice.value / total
    const angleSpan = portion * 360
    const start = previousEnd
    const end = Math.min(previousEnd + angleSpan, 359.99)
    acc.push({
      ...slice,
      start,
      end,
      percentage: Math.round(portion * 100),
    })
    return acc
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Distribution</CardTitle>
        <CardDescription>
          Category balance across your workspace library.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label="Asset distribution chart"
            >
              <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted" />
              {total > 0
                ? arcs.map((arc) => (
                    <path
                      key={arc.label}
                      d={describeArc(center, center, radius, arc.start, arc.end)}
                      fill="none"
                      strokeWidth={strokeWidth}
                      strokeLinecap="butt"
                      className={cn("stroke-current", arc.colorClass)}
                    />
                  ))
                : null}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold tracking-tight text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground">Total assets</span>
            </div>
          </div>
        </div>

        <ul className="space-y-2">
          {arcs.map((arc) => (
            <li key={arc.label}>
              <Link
                href={arc.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:bg-accent/30"
              >
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block size-2.5 rounded-full", arc.colorClass.replace("text-", "bg-"))} />
                  <span className="font-medium text-foreground">{arc.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{arc.value}</span>
                  <span>{arc.percentage}%</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
