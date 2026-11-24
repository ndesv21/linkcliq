import { DownloadIcon } from "lucide-react"
import { BreakdownTabs } from "@/components/analytics/breakdown-tabs"
import { KpiCards } from "@/components/analytics/kpi-cards"
import { LinkFilter } from "@/components/analytics/link-filter"
import { RangeSelect } from "@/components/analytics/range-select"
import { TrafficChart } from "@/components/analytics/traffic-chart"
import { SiteHeader } from "@/components/dashboard/site-header"
import { PlatformIcon } from "@/components/platform-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBreakdown, getLinkStats, getSummary, getTimeseries, parseRange } from "@/lib/analytics"
import { getPublicOrigin } from "@/lib/dashboard"
import { fmtNumber, fmtPercent } from "@/lib/format"
import { hostOf } from "@/lib/link-utils"
import { getPlatform, platformFromUrl } from "@/lib/platforms"
import { getPageLinks, requirePage } from "@/lib/pages"

export const metadata = { title: "Analytics" }

export default async function AnalyticsPage({ searchParams }: PageProps<"/dashboard/analytics">) {
  const { page } = await requirePage()
  const sp = await searchParams
  const range = parseRange(sp.range)
  const allLinks = await getPageLinks(page.id)
  const linkId = typeof sp.link === "string" && allLinks.some((l) => l.id === sp.link) ? sp.link : null
  const metric = linkId ? "clicks" : "views"

  const [summary, series, stats, sources, referrers, inApp, countries, devices, browsers, os, origin] = await Promise.all([
    getSummary(page.id, range),
    getTimeseries(page.id, range, linkId),
    getLinkStats(page.id, range),
    getBreakdown(page.id, range, "source", { linkId, limit: 10 }),
    getBreakdown(page.id, range, "referrer", { linkId, limit: 10 }),
    getBreakdown(page.id, range, "inApp", { linkId, limit: 10 }),
    getBreakdown(page.id, range, "country", { linkId, limit: 10 }),
    getBreakdown(page.id, range, "device", { linkId, limit: 10 }),
    getBreakdown(page.id, range, "browser", { linkId, limit: 10 }),
    getBreakdown(page.id, range, "os", { linkId, limit: 10 }),
    getPublicOrigin(),
  ])
  const linkTitle = (l: { title: string; url: string; kind: string; platform: string | null }) =>
    l.kind === "social" ? getPlatform(l.platform ?? platformFromUrl(l.url))?.name ?? "Social icon" : l.title || hostOf(l.url)
  const selected = allLinks.find((l) => l.id === linkId)
  const showEscapes = stats.some((s) => s.escapes > 0)

  return (
    <>
      <SiteHeader
        title="Analytics"
        pageUrl={`${origin}/${page.handle}`}
        actions={
          <Button size="sm" variant="outline" asChild>
            <a href={`/api/export?range=${range}`} download>
              <DownloadIcon /> <span className="hidden sm:inline">Export CSV</span>
            </a>
          </Button>
        }
      />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Cookie-free analytics. Visitors are counted with a daily rotating hash, so no consent banner is needed.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <LinkFilter
              value={linkId ?? "all"}
              links={allLinks.filter((l) => l.kind !== "header").map((l) => ({ id: l.id, title: linkTitle(l) }))}
            />
            <RangeSelect value={range} />
          </div>
        </div>

        <KpiCards current={summary.current} previous={summary.previous} />

        <TrafficChart
          data={series}
          title={selected ? `Clicks on “${linkTitle(selected)}”` : "Views, clicks and escapes"}
          description={selected ? hostOf(selected.url) : "Escapes are in-app visitors who landed in a real browser"}
          showEscapes={page.escapeMode !== "off" || summary.current.escapes > 0}
        />

        <div className="grid gap-4 lg:gap-6 @4xl/main:grid-cols-2">
          <BreakdownTabs
            title="Acquisition"
            description="Which platforms and sites send visitors"
            metric={metric}
            tabs={[
              { key: "source", label: "Sources", rows: sources, kind: "source" },
              { key: "referrer", label: "Referrers", rows: referrers },
              { key: "inapp", label: "In-app", rows: inApp, kind: "source" },
            ]}
          />
          <BreakdownTabs
            title="Audience"
            description="Where visitors are and what they use"
            metric={metric}
            tabs={[
              { key: "country", label: "Countries", rows: countries, kind: "country" },
              { key: "device", label: "Devices", rows: devices },
              { key: "browser", label: "Browsers", rows: browsers },
              { key: "os", label: "OS", rows: os },
            ]}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All links</CardTitle>
            <CardDescription>Performance of every link and social icon in this period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Unique</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="hidden text-right md:table-cell">In-app clicks</TableHead>
                  {showEscapes && <TableHead className="hidden text-right md:table-cell">Escaped</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No clicks in this period.
                    </TableCell>
                  </TableRow>
                )}
                {stats.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="max-w-0 w-full">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={s.platform ?? platformFromUrl(s.url)} className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{linkTitle(s)}</span>
                        {s.kind === "social" && <Badge variant="outline">Icon</Badge>}
                        <span className="hidden truncate text-xs text-muted-foreground lg:inline">{hostOf(s.url)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(s.clicks)}</TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">{fmtNumber(s.clickers)}</TableCell>
                    <TableCell className="text-right tabular-nums">{summary.current.views ? fmtPercent(s.clicks / summary.current.views) : "0%"}</TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">{fmtNumber(s.inAppClicks)}</TableCell>
                    {showEscapes && <TableCell className="hidden text-right tabular-nums md:table-cell">{fmtNumber(s.escapes)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
