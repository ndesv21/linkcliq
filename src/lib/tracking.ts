import "server-only"
import { createHash } from "node:crypto"
import { isbot } from "isbot"
import UAParser from "ua-parser-js"
import { authSecret } from "./env"
import { countryFromIp } from "./geo"
import { detectInApp, type InAppApp } from "./in-app"
import { getPlatform, platformFromUrl } from "./platforms"

export type ClientInfo = {
  ua: string
  ip: string
  isBot: boolean
  isPrefetch: boolean
  inApp: InAppApp | null
  country: string | null
  device: string
  browser: string
  os: string
  referrer: string | null
}

const COUNTRY_HEADERS = ["cf-ipcountry", "x-vercel-ip-country", "x-country-code", "x-geo-country", "fly-client-country"]

export function clientInfo(headers: Headers): ClientInfo {
  const ua = headers.get("user-agent") ?? ""
  const ip =
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "0.0.0.0"
  const parsed = new UAParser(ua).getResult()
  const type = parsed.device.type
  const device = type === "mobile" ? "Mobile" : type === "tablet" ? "Tablet" : "Desktop"
  let country: string | null = null
  for (const h of COUNTRY_HEADERS) {
    const v = headers.get(h)
    if (v && /^[A-Z]{2}$/i.test(v) && v.toUpperCase() !== "XX" && v.toUpperCase() !== "T1") {
      country = v.toUpperCase()
      break
    }
  }
  country ??= countryFromIp(ip)
  const purpose = `${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""} ${headers.get("x-moz") ?? ""}`
  const inApp = detectInApp(ua)
  return {
    ua,
    ip,
    isBot: !ua || isbot(ua),
    isPrefetch: /prefetch|preview/i.test(purpose),
    inApp,
    country,
    device,
    browser: inApp ? `${inApp} in-app` : parsed.browser.name ?? "Unknown",
    os: parsed.os.name ?? "Unknown",
    referrer: headers.get("referer"),
  }
}

export function visitorId(pageId: string, info: Pick<ClientInfo, "ip" | "ua">) {
  const day = new Date().toISOString().slice(0, 10)
  return createHash("sha256")
    .update(`${authSecret()}|${day}|${pageId}|${info.ip}|${info.ua}`)
    .digest("base64url")
    .slice(0, 16)
}

const UTM_ALIASES: Record<string, string> = {
  ig: "Instagram",
  insta: "Instagram",
  instagram: "Instagram",
  tt: "TikTok",
  tiktok: "TikTok",
  yt: "YouTube",
  youtube: "YouTube",
  x: "X",
  twitter: "X",
  fb: "Facebook",
  facebook: "Facebook",
  threads: "Threads",
  li: "LinkedIn",
  linkedin: "LinkedIn",
  snap: "Snapchat",
  snapchat: "Snapchat",
  pin: "Pinterest",
  pinterest: "Pinterest",
  reddit: "Reddit",
  bsky: "Bluesky",
  bluesky: "Bluesky",
  email: "Email",
  newsletter: "Email",
  qr: "QR code",
}

const SEARCH_ENGINES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)t\.co$/, "X"],
  [/(^|\.)lnkd\.in$/, "LinkedIn"],
]

export function normalizeSource(raw: string) {
  const key = raw.trim().toLowerCase()
  if (UTM_ALIASES[key]) return UTM_ALIASES[key]
  return raw.trim().slice(0, 40).replace(/^\w/, (c) => c.toUpperCase())
}

export function resolveSource(input: {
  explicit?: string | null
  utmSource?: string | null
  inApp?: string | null
  referrer?: string | null
  selfHost?: string | null
}) {
  if (input.explicit) return normalizeSource(input.explicit)
  if (input.utmSource) return normalizeSource(input.utmSource)
  if (input.inApp) return input.inApp
  if (input.referrer) {
    try {
      const host = new URL(input.referrer).hostname.replace(/^www\./, "").toLowerCase()
      if (input.selfHost && host === input.selfHost.replace(/^www\./, "")) return "Direct"
      const platform = getPlatform(platformFromUrl(input.referrer))
      if (platform) return platform.name
      for (const [re, name] of SEARCH_ENGINES) if (re.test(host)) return name
      return host
    } catch {
      return "Direct"
    }
  }
  return "Direct"
}

export function referrerHost(referrer: string | null) {
  if (!referrer) return null
  try {
    return new URL(referrer).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

export function sourceSlug(source: string) {
  return source.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "direct"
}
