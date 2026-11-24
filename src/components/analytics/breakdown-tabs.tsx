import { PlatformIcon } from "@/components/platform-icon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BreakdownRow } from "@/lib/analytics"
import { countryFlag, countryName } from "@/lib/format"
import { PLATFORMS } from "@/lib/platforms"
import { BarList } from "./bar-list"

const SOURCE_PLATFORM = new Map(PLATFORMS.map((p) => [p.name, p.id]))

export type BreakdownTab = { key: string; label: string; rows: BreakdownRow[]; kind?: "country" | "source" | "plain" }

function rowLabel(kind: BreakdownTab["kind"], label: string) {
  if (kind === "country") {
    return (
      <>
        <span aria-hidden>{countryFlag(label)}</span>
        <span className="truncate">{label === "Unknown" ? "Unknown" : countryName(label)}</span>
      </>
    )
  }
  if (kind === "source") {
    return (
      <>
        <PlatformIcon platform={SOURCE_PLATFORM.get(label)} className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </>
    )
  }
  return <span className="truncate">{label}</span>
}

export function BreakdownTabs({ title, description, tabs, metric = "views" }: { title: string; description: string; tabs: BreakdownTab[]; metric?: "views" | "clicks" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={tabs[0]?.key}>
          <TabsList className="mb-3">
            {tabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.key} value={t.key}>
              <BarList
                valueLabel={metric === "views" ? "Views" : "Clicks"}
                secondaryLabel={metric === "views" ? "Clicks" : undefined}
                rows={t.rows.map((r) => ({
                  key: r.label,
                  label: rowLabel(t.kind, r.label),
                  value: metric === "views" ? r.views : r.clicks,
                  secondary: metric === "views" ? r.clicks : undefined,
                }))}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
