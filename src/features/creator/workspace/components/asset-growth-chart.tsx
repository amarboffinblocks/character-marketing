import { TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type AssetGrowthChartProps = {
  series: number[]
  totalAdded: number
  period: string
}

export function AssetGrowthChart({ series, totalAdded, period }: AssetGrowthChartProps) {
  const width = 520
  const height = 160
  const paddingX = 16
  const paddingY = 20

  const max = Math.max(...series, 1)
  const min = Math.min(...series, 0)
  const range = max - min || 1

  const points = series.map((value, index) => {
    const x =
      paddingX + (index * (width - paddingX * 2)) / Math.max(series.length - 1, 1)
    const y = height - paddingY - ((value - min) / range) * (height - paddingY * 2)
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
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Asset Growth</CardTitle>
          <CardDescription>Newly added assets across your workspace.</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight text-foreground">+{totalAdded}</p>
          <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <TrendingUp className="size-3.5" />
            {period}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-40 w-full"
          role="img"
          aria-label="Asset growth chart"
        >
          <defs>
            <linearGradient id="workspaceGrowthGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="text-primary">
            <path d={areaPath} fill="url(#workspaceGrowthGradient)" />
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
