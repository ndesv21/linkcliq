import { type NextRequest } from "next/server"
import { exportEvents, parseRange } from "@/lib/analytics"
import { requirePage } from "@/lib/pages"

export const dynamic = "force-dynamic"

function cell(v: unknown) {
  if (v === null || v === undefined) return ""
  const s = v instanceof Date ? v.toISOString() : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: NextRequest) {
  const { page } = await requirePage()
  const range = parseRange(req.nextUrl.searchParams.get("range") ?? undefined)
  const rows = await exportEvents(page.id, range)
  const header = ["time", "type", "link", "url", "source", "referrer", "in_app", "country", "device", "browser", "os", "utm_source", "utm_medium", "utm_campaign", "visitor"]
  const body = [header.join(","), ...rows.map((r) => [r.time, r.type, r.link, r.url, r.source, r.referrer, r.inApp, r.country, r.device, r.browser, r.os, r.utmSource, r.utmMedium, r.utmCampaign, r.visitor].map(cell).join(","))].join("\n")
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${page.handle}-${range}-events.csv"`,
      "cache-control": "no-store",
    },
  })
}
