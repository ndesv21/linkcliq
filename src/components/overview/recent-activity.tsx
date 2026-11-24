import { formatDistanceToNowStrict } from "date-fns"
import { EyeIcon, MousePointerClickIcon, ShieldCheckIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { countryFlag } from "@/lib/format"

type Row = {
  id: number
  type: string
  createdAt: Date
  source: string
  country: string | null
  device: string | null
  inApp: string | null
  linkTitle: string | null
}

const ICON = { view: EyeIcon, click: MousePointerClickIcon, escape: ShieldCheckIcon } as const

function describe(r: Row) {
  if (r.type === "escape") return `Escaped ${r.inApp ?? "an in-app browser"}${r.linkTitle ? ` to reach “${r.linkTitle}”` : ""}`
  if (r.type === "click") return `Clicked “${r.linkTitle || "a social icon"}”`
  return "Viewed your page"
}

export function RecentActivity({ rows }: { rows: Row[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live activity</CardTitle>
        <CardDescription>The latest visits and clicks</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Share your page to see visits here.</p>
        ) : (
          <ItemGroup className="gap-0">
            {rows.map((r) => {
              const Icon = ICON[r.type as keyof typeof ICON] ?? EyeIcon
              return (
                <Item key={r.id} size="xs" className="px-0">
                  <ItemMedia variant="icon" className={r.type === "escape" ? "text-chart-3" : r.type === "click" ? "text-chart-2" : "text-chart-1"}>
                    <Icon />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="line-clamp-1 font-normal">{describe(r)}</ItemTitle>
                    <ItemDescription className="text-xs">
                      {r.country ? `${countryFlag(r.country)} ` : ""}
                      {r.inApp && r.type !== "escape" ? `${r.inApp} in-app` : r.source} · {r.device ?? "Unknown"} ·{" "}
                      {formatDistanceToNowStrict(r.createdAt, { addSuffix: true })}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
