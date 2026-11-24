import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Summary } from "@/lib/analytics"
import { delta, fmtNumber, fmtPercent } from "@/lib/format"

function Trend({ value, invert = false }: { value: number; invert?: boolean }) {
  const up = value >= 0
  const good = invert ? !up : up
  return (
    <Badge variant="outline" className={good ? "text-chart-3" : "text-destructive"}>
      {up ? <TrendingUpIcon /> : <TrendingDownIcon />}
      {up ? "+" : ""}
      {fmtPercent(value)}
    </Badge>
  )
}

export function KpiCards({ current, previous }: { current: Summary; previous: Summary }) {
  const escapeRate = current.inAppViews ? Math.min(1, current.escapes / current.inAppViews) : 0
  const items = [
    {
      label: "Page views",
      value: fmtNumber(current.views),
      trend: delta(current.views, previous.views),
      foot: `${fmtNumber(current.visitors)} unique visitors`,
    },
    {
      label: "Link clicks",
      value: fmtNumber(current.clicks),
      trend: delta(current.clicks, previous.clicks),
      foot: `${fmtNumber(current.clickers)} people clicked`,
    },
    {
      label: "Click-through rate",
      value: fmtPercent(current.ctr),
      trend: delta(current.ctr, previous.ctr),
      foot: "Clicks per page view",
    },
    {
      label: "Escaped to browser",
      value: fmtNumber(current.escapes),
      trend: delta(current.escapes, previous.escapes),
      foot: `${fmtPercent(current.inAppShare, 0)} of views were in-app · ${fmtPercent(escapeRate, 0)} escaped`,
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {items.map((i) => (
        <Card key={i.label} className="@container/card">
          <CardHeader>
            <CardDescription>{i.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{i.value}</CardTitle>
            <CardAction>
              <Trend value={i.trend} />
            </CardAction>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{i.foot}</CardFooter>
        </Card>
      ))}
    </div>
  )
}
