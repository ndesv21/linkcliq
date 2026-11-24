import type { InAppApp } from "./in-app"

export type Os = "ios" | "android" | "other"
export type EscapeMode = "off" | "auto" | "guide"

export type AutoMethod =
  | { kind: "redirect"; href: string; method: string }
  | { kind: "meta-refresh"; href: string; method: string }
  | { kind: "script"; href: string; method: string }

export type GuideStep = { menu: "dots" | "kebab" | "safari"; position: "top-right" | "bottom-right"; action: string }

export type EscapePlan = {
  app: InAppApp
  os: Os
  auto: AutoMethod | null
  tap: { href: string; method: string } | null
  guide: GuideStep
  confidence: "high" | "medium" | "low"
}

const CUSTOM_TAB_ON_ANDROID = new Set<InAppApp>(["Snapchat", "LinkedIn", "X", "Google App"])
const NEVER_ESCAPE = new Set<InAppApp>(["Google App"])

function withParam(target: string, key: string, value: string) {
  const url = new URL(target)
  url.searchParams.set(key, value)
  return url.toString()
}

export function intentUrl(target: string) {
  const url = new URL(target)
  const scheme = url.protocol.replace(":", "")
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(target)};end`
}

export function safariUrl(target: string) {
  return `x-safari-${target}`
}

function guide(app: InAppApp, os: Os): GuideStep {
  const dots = os === "android" ? ("kebab" as const) : ("dots" as const)
  switch (app) {
    case "Instagram":
    case "Threads":
      return { menu: "dots", position: "top-right", action: "Open in external browser" }
    case "Facebook":
    case "Messenger":
    case "LinkedIn":
    case "Snapchat":
      return { menu: "dots", position: "top-right", action: os === "ios" ? "Open in Safari" : "Open in browser" }
    case "X":
      return os === "ios"
        ? { menu: "safari", position: "bottom-right", action: "Open in Safari" }
        : { menu: "kebab", position: "top-right", action: "Open in browser" }
    case "Reddit":
      return { menu: "kebab", position: "top-right", action: "Open in default browser" }
    case "TikTok":
      return { menu: "dots", position: "top-right", action: "Open in browser" }
    default:
      return { menu: dots, position: "top-right", action: os === "ios" ? "Open in Safari" : "Open in browser" }
  }
}

/**
 * Picks the escape route for one in-app browser. The matrix follows
 * docs/research/in-app-browser-escape.md: only methods with a published,
 * device-verified result fire automatically; everything else is offered
 * behind a tap and backed by the manual guide.
 */
export function planEscape(app: InAppApp | null, os: Os, targetFor: (method: string) => string): EscapePlan | null {
  if (!app || NEVER_ESCAPE.has(app) || os === "other") return null
  if (os === "android" && CUSTOM_TAB_ON_ANDROID.has(app)) return null

  const step = guide(app, os)

  if (app === "LINE") {
    const href = withParam(targetFor("line_param"), "openExternalBrowser", "1")
    return { app, os, auto: { kind: "redirect", href, method: "line_param" }, tap: { href, method: "line_param" }, guide: step, confidence: "high" }
  }

  if (os === "android") {
    const href = intentUrl(targetFor("intent"))
    const reliable = app === "Facebook" || app === "Messenger" || app === "Threads" || app === "Telegram"
    const conflicting = app === "Instagram"
    if (app === "WeChat") return { app, os, auto: null, tap: null, guide: step, confidence: "low" }
    return {
      app,
      os,
      auto: reliable || conflicting ? { kind: "script", href, method: "intent" } : null,
      tap: { href, method: "intent" },
      guide: step,
      confidence: reliable ? "high" : conflicting ? "medium" : "low",
    }
  }

  if (app === "Instagram") {
    const href = `instagram://extbrowser/?url=${encodeURIComponent(targetFor("ig_extbrowser"))}`
    return { app, os, auto: { kind: "meta-refresh", href, method: "ig_extbrowser" }, tap: { href, method: "ig_extbrowser" }, guide: step, confidence: "medium" }
  }
  if (app === "Threads") {
    const href = `barcelona://extbrowser/?url=${encodeURIComponent(targetFor("threads_extbrowser"))}`
    return { app, os, auto: { kind: "meta-refresh", href, method: "threads_extbrowser" }, tap: { href, method: "threads_extbrowser" }, guide: step, confidence: "medium" }
  }

  const safari = safariUrl(targetFor("x_safari"))
  switch (app) {
    case "WhatsApp":
    case "Telegram":
      return { app, os, auto: { kind: "script", href: safari, method: "x_safari" }, tap: { href: safari, method: "x_safari" }, guide: step, confidence: "medium" }
    case "Facebook":
    case "X":
      return { app, os, auto: null, tap: { href: safari, method: "x_safari" }, guide: step, confidence: "medium" }
    case "Messenger":
    case "LinkedIn":
    case "TikTok":
      return { app, os, auto: null, tap: { href: safari, method: "x_safari" }, guide: step, confidence: "low" }
    default:
      return { app, os, auto: null, tap: null, guide: step, confidence: "low" }
  }
}

const AD_MEDIUM = /^(cpc|ppc|cpm|paid|paid[_-]?social|paidsocial|ads?|display|sponsored)$/i

export function looksLikeAdTraffic(params: URLSearchParams) {
  if (params.has("ttclid") || params.has("gclid") || params.has("ScCid") || params.has("twclid") || params.has("li_fat_id")) return true
  const medium = params.get("utm_medium")
  return Boolean(medium && AD_MEDIUM.test(medium))
}

export const ESCAPE_PARAM = "lc_x"
export const ESCAPE_FROM_PARAM = "lc_from"
export const ESCAPE_METHOD_PARAM = "lc_m"
export const STAY_PARAM = "lc_stay"
export const COUNTED_PARAM = "lc_c"
