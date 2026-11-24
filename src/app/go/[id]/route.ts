import { after, NextResponse, type NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { links, pages } from "@/lib/db/schema"
import { buildDestination } from "@/lib/destination"
import { COUNTED_PARAM, ESCAPE_FROM_PARAM, ESCAPE_METHOD_PARAM, ESCAPE_PARAM } from "@/lib/escape"
import { resolveEscape } from "@/lib/escape-server"
import { appFromSlug } from "@/lib/in-app"
import { isLinkLive, isPagePublic } from "@/lib/pages"
import { recordEvent } from "@/lib/record"
import { clientInfo, resolveSource } from "@/lib/tracking"

export const dynamic = "force-dynamic"

function redirect(to: string | URL) {
  const res = NextResponse.redirect(to, 302)
  res.headers.set("cache-control", "no-store, max-age=0")
  res.headers.set("x-robots-tag", "noindex")
  return res
}

export async function GET(req: NextRequest, ctx: RouteContext<"/go/[id]">) {
  const { id } = await ctx.params
  const [row] = await db
    .select({ link: links, page: pages })
    .from(links)
    .innerJoin(pages, eq(pages.id, links.pageId))
    .where(eq(links.id, id))
  if (!row || !isPagePublic(row.page)) return redirect(new URL("/", req.url))

  const { link, page } = row
  if (!link.url || !isLinkLive(link)) return redirect(new URL(`/${page.handle}`, req.url))

  const params = req.nextUrl.searchParams
  const selfHost = req.nextUrl.host
  const explicit = params.get("s") ?? params.get("src")
  const utm = { source: params.get("utm_source"), medium: params.get("utm_medium"), campaign: params.get("utm_campaign") }
  const info = clientInfo(req.headers)
  const source = resolveSource({ explicit, utmSource: utm.source, inApp: info.inApp, referrer: info.referrer, selfHost })
  const destination = buildDestination(link, page, source)

  if (params.get(ESCAPE_PARAM) === "1") {
    if (!info.inApp) {
      after(() =>
        recordEvent({
          page,
          linkId: link.id,
          type: "escape",
          headers: req.headers,
          explicitSource: explicit,
          utm,
          selfHost,
          overrideInApp: appFromSlug(params.get(ESCAPE_FROM_PARAM)) ?? "Unknown",
          escapeMethod: params.get(ESCAPE_METHOD_PARAM),
        })
      )
    }
    return redirect(destination)
  }

  if (params.get(COUNTED_PARAM) !== "1") {
    after(() => recordEvent({ page, linkId: link.id, type: "click", headers: req.headers, explicitSource: explicit, utm, selfHost }))
  }

  if (/^https?:/i.test(destination)) {
    const escape = resolveEscape({
      mode: link.escapeMode === "inherit" ? page.escapeMode : link.escapeMode,
      skipAds: page.escapeSkipAds,
      inApp: info.inApp,
      ua: info.ua,
      params,
      base: new URL(`/go/${link.id}`, req.url),
      source,
    })
    if (escape?.plan.auto?.kind === "redirect") return redirect(escape.plan.auto.href)
    if (escape) {
      const screen = new URL(`/o/${link.id}`, req.url)
      for (const [k, v] of params) screen.searchParams.set(k, v)
      return redirect(screen)
    }
  }
  return redirect(destination)
}
