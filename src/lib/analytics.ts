import "server-only"
import { and, desc, eq, gte, lt, sql, type SQL } from "drizzle-orm"
import { db } from "./db"
import { events, links } from "./db/schema"

export const RANGES = {
  "24h": { label: "Last 24 hours", days: 1 },
  "7d": { label: "Last 7 days", days: 7 },
  "30d": { label: "Last 30 days", days: 30 },
  "90d": { label: "Last 90 days", days: 90 },
  "12m": { label: "Last 12 months", days: 365 },
} as const

export type RangeKey = keyof typeof RANGES

export function parseRange(value: string | string[] | undefined, fallback: RangeKey = "30d"): RangeKey {
  return typeof value === "string" && value in RANGES ? (value as RangeKey) : fallback
}

export function rangeBounds(range: RangeKey, now = new Date()) {
  const days = RANGES[range].days
  const to = new Date(now)
  const from = new Date(now.getTime() - days * 86_400_000)
  const prevFrom = new Date(from.getTime() - days * 86_400_000)
  return { from, to, prevFrom, prevTo: from, bucket: days > 90 ? ("month" as const) : days <= 1 ? ("hour" as const) : ("day" as const) }
}

function scope(pageId: string, from: Date, to: Date, linkId?: string | null): SQL {
  const parts = [eq(events.pageId, pageId), gte(events.createdAt, from), lt(events.createdAt, to)]
  if (linkId) parts.push(eq(events.linkId, linkId))
  return and(...parts)!
}

const n = (v: unknown) => Number(v ?? 0)

export type Summary = {
  views: number
  visitors: number
  clicks: number
  clickers: number
  ctr: number
  inAppShare: number
  inAppViews: number
  inAppClicks: number
  escapes: number
}

async function summary(pageId: string, from: Date, to: Date, linkId?: string | null): Promise<Summary> {
  const [row] = await db
    .select({
      views: sql`sum(case when ${events.type} = 'view' then 1 else 0 end)`,
      visitors: sql`count(distinct case when ${events.type} = 'view' then ${events.visitorId} end)`,
      clicks: sql`sum(case when ${events.type} = 'click' then 1 else 0 end)`,
      clickers: sql`count(distinct case when ${events.type} = 'click' then ${events.visitorId} end)`,
      inAppViews: sql`sum(case when ${events.type} = 'view' and ${events.inApp} is not null then 1 else 0 end)`,
      inAppClicks: sql`sum(case when ${events.type} = 'click' and ${events.inApp} is not null then 1 else 0 end)`,
      escapes: sql`sum(case when ${events.type} = 'escape' then 1 else 0 end)`,
    })
    .from(events)
    .where(scope(pageId, from, to, linkId))
  const views = n(row?.views)
  const clicks = n(row?.clicks)
  return {
    views,
    visitors: n(row?.visitors),
    clicks,
    clickers: n(row?.clickers),
    ctr: views ? clicks / views : 0,
    inAppShare: views ? n(row?.inAppViews) / views : 0,
    inAppViews: n(row?.inAppViews),
    inAppClicks: n(row?.inAppClicks),
    escapes: n(row?.escapes),
  }
}

export async function getSummary(pageId: string, range: RangeKey, linkId?: string | null) {
  const b = rangeBounds(range)
  const [current, previous] = await Promise.all([
    summary(pageId, b.from, b.to, linkId),
    summary(pageId, b.prevFrom, b.prevTo, linkId),
  ])
  return { current, previous }
}

export type SeriesPoint = { date: string; views: number; clicks: number; escapes: number }

export async function getTimeseries(pageId: string, range: RangeKey, linkId?: string | null): Promise<SeriesPoint[]> {
  const b = rangeBounds(range)
  const fmt = b.bucket === "month" ? "%Y-%m" : b.bucket === "hour" ? "%Y-%m-%dT%H:00" : "%Y-%m-%d"
  const bucket = sql<string>`strftime(${fmt}, ${events.createdAt} / 1000, 'unixepoch')`
  const rows = await db
    .select({
      bucket,
      views: sql`sum(case when ${events.type} = 'view' then 1 else 0 end)`,
      clicks: sql`sum(case when ${events.type} = 'click' then 1 else 0 end)`,
      escapes: sql`sum(case when ${events.type} = 'escape' then 1 else 0 end)`,
    })
    .from(events)
    .where(scope(pageId, b.from, b.to, linkId))
    .groupBy(bucket)
  const byKey = new Map(rows.map((r) => [r.bucket, r]))
  const out: SeriesPoint[] = []
  const cursor = new Date(b.from)
  if (b.bucket === "month") cursor.setUTCDate(1)
  if (b.bucket === "hour") cursor.setUTCMinutes(0, 0, 0)
  else cursor.setUTCHours(0, 0, 0, 0)
  while (cursor <= b.to) {
    const iso = cursor.toISOString()
    const key = b.bucket === "month" ? iso.slice(0, 7) : b.bucket === "hour" ? `${iso.slice(0, 13)}:00` : iso.slice(0, 10)
    const r = byKey.get(key)
    out.push({ date: key, views: n(r?.views), clicks: n(r?.clicks), escapes: n(r?.escapes) })
    if (b.bucket === "month") cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    else if (b.bucket === "hour") cursor.setUTCHours(cursor.getUTCHours() + 1)
    else cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}

export type Dimension = "source" | "country" | "device" | "browser" | "os" | "referrer" | "inApp"

const DIMENSION_COLUMN = {
  source: events.source,
  country: events.country,
  device: events.device,
  browser: events.browser,
  os: events.os,
  referrer: events.referrer,
  inApp: events.inApp,
} as const

export type BreakdownRow = { label: string; views: number; clicks: number; visitors: number; escapes: number }

export async function getBreakdown(
  pageId: string,
  range: RangeKey,
  dimension: Dimension,
  opts: { linkId?: string | null; limit?: number } = {}
): Promise<BreakdownRow[]> {
  const b = rangeBounds(range)
  const col = DIMENSION_COLUMN[dimension]
  const label = sql<string>`coalesce(${col}, 'Unknown')`
  const rows = await db
    .select({
      label,
      views: sql`sum(case when ${events.type} = 'view' then 1 else 0 end)`,
      clicks: sql`sum(case when ${events.type} = 'click' then 1 else 0 end)`,
      visitors: sql`count(distinct case when ${events.type} = 'view' then ${events.visitorId} end)`,
      escapes: sql`sum(case when ${events.type} = 'escape' then 1 else 0 end)`,
    })
    .from(events)
    .where(and(scope(pageId, b.from, b.to, opts.linkId), dimension === "inApp" ? sql`${events.inApp} is not null` : undefined))
    .groupBy(label)
    .orderBy(desc(sql`sum(case when ${events.type} != 'escape' then 1 else 0 end)`))
    .limit(opts.limit ?? 8)
  return rows.map((r) => ({ label: r.label, views: n(r.views), clicks: n(r.clicks), visitors: n(r.visitors), escapes: n(r.escapes) }))
}

export type LinkStat = {
  id: string
  title: string
  url: string
  kind: string
  platform: string | null
  clicks: number
  clickers: number
  inAppClicks: number
  escapes: number
}

export async function getLinkStats(pageId: string, range: RangeKey): Promise<LinkStat[]> {
  const b = rangeBounds(range)
  const rows = await db
    .select({
      id: links.id,
      title: links.title,
      url: links.url,
      kind: links.kind,
      platform: links.platform,
      clicks: sql`sum(case when ${events.type} = 'click' then 1 else 0 end)`,
      clickers: sql`count(distinct case when ${events.type} = 'click' then ${events.visitorId} end)`,
      inAppClicks: sql`sum(case when ${events.type} = 'click' and ${events.inApp} is not null then 1 else 0 end)`,
      escapes: sql`sum(case when ${events.type} = 'escape' then 1 else 0 end)`,
    })
    .from(events)
    .innerJoin(links, eq(links.id, events.linkId))
    .where(scope(pageId, b.from, b.to))
    .groupBy(links.id)
    .orderBy(desc(sql`sum(case when ${events.type} = 'click' then 1 else 0 end)`))
  return rows.map((r) => ({
    ...r,
    clicks: n(r.clicks),
    clickers: n(r.clickers),
    inAppClicks: n(r.inAppClicks),
    escapes: n(r.escapes),
  }))
}

export async function getLinkSparklines(pageId: string, days = 14) {
  const from = new Date(Date.now() - days * 86_400_000)
  from.setUTCHours(0, 0, 0, 0)
  const day = sql<string>`strftime('%Y-%m-%d', ${events.createdAt} / 1000, 'unixepoch')`
  const rows = await db
    .select({ linkId: events.linkId, day, clicks: sql`count(*)` })
    .from(events)
    .where(and(eq(events.pageId, pageId), eq(events.type, "click"), gte(events.createdAt, from)))
    .groupBy(events.linkId, day)
  const keys: string[] = []
  for (let i = 0; i <= days; i++) keys.push(new Date(from.getTime() + i * 86_400_000).toISOString().slice(0, 10))
  const map = new Map<string, number[]>()
  for (const r of rows) {
    if (!r.linkId) continue
    const series = map.get(r.linkId) ?? keys.map(() => 0)
    const idx = keys.indexOf(r.day)
    if (idx >= 0) series[idx] = n(r.clicks)
    map.set(r.linkId, series)
  }
  return Object.fromEntries(map) as Record<string, number[]>
}

export async function getRecentEvents(pageId: string, limit = 12) {
  return db
    .select({
      id: events.id,
      type: events.type,
      createdAt: events.createdAt,
      source: events.source,
      country: events.country,
      device: events.device,
      inApp: events.inApp,
      linkTitle: links.title,
      linkPlatform: links.platform,
    })
    .from(events)
    .leftJoin(links, eq(links.id, events.linkId))
    .where(eq(events.pageId, pageId))
    .orderBy(desc(events.createdAt))
    .limit(limit)
}

export async function exportEvents(pageId: string, range: RangeKey) {
  const b = rangeBounds(range)
  return db
    .select({
      time: events.createdAt,
      type: events.type,
      link: links.title,
      url: links.url,
      source: events.source,
      referrer: events.referrer,
      inApp: events.inApp,
      country: events.country,
      device: events.device,
      browser: events.browser,
      os: events.os,
      utmSource: events.utmSource,
      utmMedium: events.utmMedium,
      utmCampaign: events.utmCampaign,
      visitor: events.visitorId,
    })
    .from(events)
    .leftJoin(links, eq(links.id, events.linkId))
    .where(scope(pageId, b.from, b.to))
    .orderBy(desc(events.createdAt))
    .limit(100_000)
}

export async function getEscapeMethods(pageId: string, range: RangeKey) {
  const b = rangeBounds(range)
  const method = sql<string>`coalesce(${events.escapeMethod}, 'unknown')`
  const rows = await db
    .select({ method, count: sql`count(*)` })
    .from(events)
    .where(and(scope(pageId, b.from, b.to), eq(events.type, "escape")))
    .groupBy(method)
    .orderBy(desc(sql`count(*)`))
  return rows.map((r) => ({ method: r.method, count: n(r.count) }))
}
