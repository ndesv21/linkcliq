import InAppSpy from "inapp-spy"

export type InAppApp =
  | "TikTok"
  | "Instagram"
  | "Threads"
  | "Facebook"
  | "Messenger"
  | "X"
  | "LinkedIn"
  | "Snapchat"
  | "Pinterest"
  | "Reddit"
  | "Telegram"
  | "WhatsApp"
  | "LINE"
  | "WeChat"
  | "Discord"
  | "Google App"

const FROM_SPY: Record<string, InAppApp> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  threads: "Threads",
  facebook: "Facebook",
  messenger: "Messenger",
  twitter: "X",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  reddit: "Reddit",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  line: "LINE",
  wechat: "WeChat",
  gsa: "Google App",
}

const EXTRA: [RegExp, InAppApp][] = [
  [/\bPinterest\//i, "Pinterest"],
  [/\bDiscord\//i, "Discord"],
]

export const IN_APP_APPS = Object.values(FROM_SPY).concat(EXTRA.map(([, app]) => app))

// inapp-spy reports every FB_IAB webview as Messenger. The Facebook app itself
// identifies as FB4A (Android) or FBAN/FBIOS (iOS); Messenger as Orca-Android
// or MessengerForiOS.
const MESSENGER_UA = /Orca-Android|MessengerForiOS|FBAN\/MessengerForiOS|FB_IAB\/MESSENGER/i
const FACEBOOK_UA = /FB4A|FBAN\/FBIOS|FBAN\/FB4A|FBIOS/i

export function detectInApp(ua: string | null | undefined): InAppApp | null {
  if (!ua) return null
  const { appKey } = InAppSpy({ ua })
  if ((appKey === "messenger" || appKey === "facebook") && !MESSENGER_UA.test(ua) && FACEBOOK_UA.test(ua)) {
    return "Facebook"
  }
  if (appKey && FROM_SPY[appKey]) return FROM_SPY[appKey]
  for (const [re, app] of EXTRA) if (re.test(ua)) return app
  return null
}

export function detectOs(ua: string | null | undefined): "ios" | "android" | "other" {
  if (!ua) return "other"
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "other"
}

export function appFromSlug(slug: string | null | undefined): InAppApp | null {
  if (!slug) return null
  return IN_APP_APPS.find((a) => a.toLowerCase().replace(/[^a-z]/g, "") === slug) ?? null
}

export function appSlug(app: InAppApp) {
  return app.toLowerCase().replace(/[^a-z]/g, "")
}
