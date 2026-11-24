import "server-only"
import { ESCAPE_FROM_PARAM, ESCAPE_METHOD_PARAM, ESCAPE_PARAM, STAY_PARAM, looksLikeAdTraffic, planEscape, type EscapeMode } from "./escape"
import { appSlug, detectOs, type InAppApp } from "./in-app"

export function searchParamsOf(sp: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") params.set(k, v)
    else if (Array.isArray(v) && v[0]) params.set(k, v[0])
  }
  return params
}

export function resolveEscape(opts: {
  mode: EscapeMode
  skipAds: boolean
  inApp: InAppApp | null
  ua: string
  params: URLSearchParams
  base: URL
  source: string | null
}) {
  const { params } = opts
  if (opts.mode === "off" || !opts.inApp) return null
  if (params.get(ESCAPE_PARAM) === "1" || params.get(STAY_PARAM) === "1") return null
  if (opts.skipAds && looksLikeAdTraffic(params)) return null

  const app = opts.inApp
  const targetFor = (method: string) => {
    const url = new URL(opts.base)
    url.searchParams.set(ESCAPE_PARAM, "1")
    url.searchParams.set(ESCAPE_FROM_PARAM, appSlug(app))
    url.searchParams.set(ESCAPE_METHOD_PARAM, method)
    if (opts.source && opts.source !== "Direct" && !url.searchParams.has("src")) url.searchParams.set("src", opts.source)
    return url.toString()
  }
  const plan = planEscape(app, detectOs(opts.ua), targetFor)
  if (!plan) return null
  const stay = new URL(opts.base)
  for (const [k, v] of params) if (!stay.searchParams.has(k)) stay.searchParams.set(k, v)
  stay.searchParams.set(STAY_PARAM, "1")
  return {
    plan,
    mode: opts.mode,
    copyUrl: targetFor("copy"),
    stayHref: `${stay.pathname}${stay.search}`,
  }
}
