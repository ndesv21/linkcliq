import "server-only"
import { db } from "./db"
import { events, type EventType, type Page } from "./db/schema"
import { clientInfo, referrerHost, resolveSource, visitorId } from "./tracking"

export async function recordEvent(opts: {
  page: Pick<Page, "id">
  type: EventType
  headers: Headers
  linkId?: string | null
  explicitSource?: string | null
  utm?: { source?: string | null; medium?: string | null; campaign?: string | null }
  selfHost?: string | null
  overrideInApp?: string | null
  escapeMethod?: string | null
}) {
  const info = clientInfo(opts.headers)
  if (info.isBot || info.isPrefetch) return null
  const source = resolveSource({
    explicit: opts.explicitSource,
    utmSource: opts.utm?.source,
    inApp: info.inApp,
    referrer: info.referrer,
    selfHost: opts.selfHost,
  })
  const refHost = referrerHost(info.referrer)
  await db.insert(events).values({
    pageId: opts.page.id,
    linkId: opts.linkId ?? null,
    type: opts.type,
    createdAt: new Date(),
    visitorId: visitorId(opts.page.id, info),
    source,
    referrer: refHost && refHost !== opts.selfHost ? refHost : null,
    inApp: opts.overrideInApp !== undefined ? opts.overrideInApp : info.inApp,
    escapeMethod: opts.escapeMethod?.slice(0, 40) ?? null,
    country: info.country,
    device: info.device,
    browser: info.browser,
    os: info.os,
    utmSource: opts.utm?.source?.slice(0, 80) ?? null,
    utmMedium: opts.utm?.medium?.slice(0, 80) ?? null,
    utmCampaign: opts.utm?.campaign?.slice(0, 80) ?? null,
  })
  return { info, source }
}
