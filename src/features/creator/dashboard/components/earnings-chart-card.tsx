import { TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type EarningsChartCardProps = {
  earnings: number[]
  currentTotal: string
  deltaLabel: string
}

export function EarningsChartCard({
  earnings,
  currentTotal,
  deltaLabel,
}: EarningsChartCardProps) {
  const width = 600
  const height = 160
  const paddingX = 16
  const paddingY = 16

  const max = Math.max(...earnings, 1)
  const min = Math.min(...earnings, 0)
  const rangeY = max - min || 1

  const points = earnings.map((value, index) => {
    const x =
      paddingX + (index * (width - paddingX * 2)) / Math.max(earnings.length - 1, 1)
    const y =
      height - paddingY - ((value - min) / rangeY) * (height - paddingY * 2)
    return { x, y }
  })

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ")
  const areaPath =
    points.length > 0
      ? `M ${points[0].x},${height - paddingY} L ${polyPoints
          .split(" ")
          .map((p) => p.replace(",", " "))
          .join(" L ")} L ${points[points.length - 1].x},${height - paddingY} Z`
      : ""

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-start justify-between border-b pb-4">
        <div className="space-y-1">
          <CardTitle>Earnings · last 30 days</CardTitle>
          <CardDescription>Daily revenue trend from completed orders.</CardDescription>
        </div>
        <div className="text-left">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{currentTotal}</p>
          <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <TrendingUp className="size-3.5" />
            {deltaLabel}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-40 w-full"
          role="img"
          aria-label="Earnings trend chart"
        >
          <defs>
            <linearGradient id="earningsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g className="text-primary">
            <path d={areaPath} fill="url(#earningsGradient)" />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polyPoints}
            />
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={index === points.length - 1 ? 3.5 : 0}
                fill="currentColor"
              />
            ))}
          </g>
        </svg>
      </CardContent>
    </Card>
  )
}
