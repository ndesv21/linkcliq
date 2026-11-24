import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { EscapeScreen } from "@/components/escape/escape-screen"
import { getPublicOrigin } from "@/lib/dashboard"
import { db } from "@/lib/db"
import { links, pages } from "@/lib/db/schema"
import { resolveEscape, searchParamsOf } from "@/lib/escape-server"
import { isPagePublic } from "@/lib/pages"
import { backgroundCss } from "@/lib/themes"
import { clientInfo, resolveSource } from "@/lib/tracking"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Open in your browser", robots: { index: false } }

export default async function EscapeLinkPage({ params, searchParams }: PageProps<"/o/[id]">) {
  const { id } = await params
  const [row] = await db.select({ link: links, page: pages }).from(links).innerJoin(pages, eq(pages.id, links.pageId)).where(eq(links.id, id))
  if (!row || !isPagePublic(row.page)) notFound()
  const { link, page } = row

  const [h, sp, origin] = await Promise.all([headers(), searchParams, getPublicOrigin()])
  const query = searchParamsOf(sp)
  const info = clientInfo(h)
  const explicit = query.get("s") ?? query.get("src")
  const source = resolveSource({ explicit, inApp: info.inApp, referrer: info.referrer, selfHost: new URL(origin).host })
  const escape = resolveEscape({
    mode: link.escapeMode === "inherit" ? page.escapeMode : link.escapeMode,
    skipAds: page.escapeSkipAds,
    inApp: info.inApp,
    ua: info.ua,
    params: query,
    base: new URL(`/go/${link.id}`, origin),
    source,
  })
  if (!escape) redirect(`/go/${link.id}?lc_stay=1&lc_c=1${explicit ? `&s=${encodeURIComponent(explicit)}` : ""}`)

  let host: string | undefined
  try {
    host = new URL(link.url).hostname.replace(/^www\./, "")
  } catch {}

  return (
    <>
      {escape.mode === "auto" && escape.plan.auto?.kind === "meta-refresh" && <meta httpEquiv="refresh" content={`0;url=${escape.plan.auto.href}`} />}
      <EscapeScreen
        mode={escape.mode === "guide" ? "guide" : "auto"}
        plan={escape.plan}
        copyUrl={escape.copyUrl}
        stayHref={`${escape.stayHref}&lc_c=1`}
        destinationHost={host}
        brand={{ displayName: page.displayName, avatar: page.avatar, background: backgroundCss(page.theme), text: page.theme.text }}
      />
    </>
  )
}
