"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { SeriesPoint } from "@/lib/analytics"

const config = {
  views: { label: "Views", color: "var(--chart-1)" },
  clicks: { label: "Clicks", color: "var(--chart-2)" },
  escapes: { label: "Escaped to browser", color: "var(--chart-3)" },
} satisfies ChartConfig

function label(key: string, long = false) {
  if (key.length === 7) {
    return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en", { month: long ? "long" : "short", year: long ? "numeric" : undefined, timeZone: "UTC" })
  }
  if (key.includes("T")) {
    return new Date(`${key}:00Z`).toLocaleTimeString("en", { hour: "numeric", timeZone: "UTC" })
  }
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en", { month: "short", day: "numeric", weekday: long ? "short" : undefined, timeZone: "UTC" })
}

export function TrafficChart({
  data,
  title = "Traffic",
  description,
  action,
  showEscapes = false,
}: {
  data: SeriesPoint[]
  title?: string
  description?: string
  action?: React.ReactNode
  showEscapes?: boolean
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6">
        <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              {(["views", "clicks", "escapes"] as const).map((k) => (
                <linearGradient key={k} id={`fill-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${k})`} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={`var(--color-${k})`} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={(v) => label(v)} />
            <YAxis tickLine={false} axisLine={false} width={40} tickMargin={4} allowDecimals={false} />
            <ChartTooltip cursor={{ strokeDasharray: "4 4" }} content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => label(String(v), true)} />} />
            <Area dataKey="views" type="monotone" fill="url(#fill-views)" stroke="var(--color-views)" strokeWidth={2} />
            <Area dataKey="clicks" type="monotone" fill="url(#fill-clicks)" stroke="var(--color-clicks)" strokeWidth={2} />
            {showEscapes && <Area dataKey="escapes" type="monotone" fill="url(#fill-escapes)" stroke="var(--color-escapes)" strokeWidth={2} />}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
