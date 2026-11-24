import { SendIcon } from "lucide-react"
import { BarList } from "@/components/analytics/bar-list"
import { KpiCards } from "@/components/analytics/kpi-cards"
import { RangeSelect } from "@/components/analytics/range-select"
import { TrafficChart } from "@/components/analytics/traffic-chart"
import { SiteHeader } from "@/components/dashboard/site-header"
import { InAppCard } from "@/components/overview/in-app-card"
import { RecentActivity } from "@/components/overview/recent-activity"
import { TopLinks } from "@/components/overview/top-links"
import { PlatformIcon } from "@/components/platform-icon"
import { ComposerDialog } from "@/components/socialclaw/composer-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getBreakdown, getLinkStats, getRecentEvents, getSummary, getTimeseries, parseRange, RANGES } from "@/lib/analytics"
import { getPublicOrigin } from "@/lib/dashboard"
import { fmtPercent } from "@/lib/format"
import { PLATFORMS } from "@/lib/platforms"
import { requirePage } from "@/lib/pages"

export const metadata = { title: "Overview" }

const SOURCE_PLATFORM = new Map(PLATFORMS.map((p) => [p.name, p.id]))

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
}

export default async function OverviewPage({ searchParams }: PageProps<"/dashboard">) {
  const { page, user } = await requirePage()
  const range = parseRange((await searchParams).range)
  const [summary, series, linkStats, sources, inApp, recent, origin] = await Promise.all([
    getSummary(page.id, range),
    getTimeseries(page.id, range),
    getLinkStats(page.id, range),
    getBreakdown(page.id, range, "source", { limit: 7 }),
    getBreakdown(page.id, range, "inApp", { limit: 6 }),
    getRecentEvents(page.id, 9),
    getPublicOrigin(),
  ])
  const pageUrl = `${origin}/${page.handle}`

  return (
    <>
      <SiteHeader
        title="Overview"
        pageUrl={pageUrl}
        actions={
          <ComposerDialog defaultText={`Everything I'm working on, in one place: ${pageUrl}`}>
            <Button size="sm" variant="outline">
              <SendIcon /> <span className="hidden sm:inline">Post to social</span>
            </Button>
          </ComposerDialog>
        }
      />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {greeting()}, {user.name.split(" ")[0]}
            </h2>
            <p className="text-sm text-muted-foreground">
              How /{page.handle} performed in the {RANGES[range].label.toLowerCase()}.
            </p>
          </div>
          <RangeSelect value={range} />
        </div>

        <KpiCards current={summary.current} previous={summary.previous} />

        <TrafficChart
          data={series}
          title="Views and clicks"
          description={`${fmtPercent(summary.current.ctr)} of views turned into a click`}
          showEscapes={page.escapeMode !== "off"}
        />

        <div className="grid gap-4 lg:gap-6 @4xl/main:grid-cols-2">
          <TopLinks stats={linkStats} views={summary.current.views} />
          <Card>
            <CardHeader>
              <CardTitle>Where visitors come from</CardTitle>
              <CardDescription>Detected from UTM tags, in-app browsers and referrers</CardDescription>
            </CardHeader>
            <CardContent>
              <BarList
                valueLabel="Views"
                secondaryLabel="Clicks"
                rows={sources.map((s) => ({
                  key: s.label,
                  label: (
                    <>
                      <PlatformIcon platform={SOURCE_PLATFORM.get(s.label)} className="size-3.5 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </>
                  ),
                  value: s.views,
                  secondary: s.clicks,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:gap-6 @5xl/main:grid-cols-5">
          <div className="@5xl/main:col-span-3">
            <InAppCard rows={inApp} escapeOn={page.escapeMode !== "off"} />
          </div>
          <div className="@5xl/main:col-span-2">
            <RecentActivity rows={recent} />
          </div>
        </div>
      </div>
    </>
  )
}
