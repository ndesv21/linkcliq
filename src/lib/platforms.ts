import { PLATFORMS, type PlatformMeta } from "./platforms.generated"

export { PLATFORMS }
export type { PlatformMeta }

const byId = new Map(PLATFORMS.map((p) => [p.id, p]))

export function getPlatform(id: string | null | undefined): PlatformMeta | undefined {
  return id ? byId.get(id) : undefined
}

const HOST_HINTS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(x\.com|twitter\.com)$/, "x"],
  [/(^|\.)threads\.(net|com)$/, "threads"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)bsky\.app$/, "bluesky"],
  [/(^|\.)snapchat\.com$/, "snapchat"],
  [/(^|\.)pinterest\./, "pinterest"],
  [/(^|\.)twitch\.tv$/, "twitch"],
  [/(^|\.)kick\.com$/, "kick"],
  [/(^|\.)(discord\.gg|discord\.com)$/, "discord"],
  [/(^|\.)(t\.me|telegram\.me)$/, "telegram"],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, "whatsapp"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)spotify\.com$/, "spotify"],
  [/^music\.apple\.com$/, "applemusic"],
  [/^podcasts\.apple\.com$/, "applepodcasts"],
  [/(^|\.)soundcloud\.com$/, "soundcloud"],
  [/(^|\.)github\.com$/, "github"],
  [/(^|\.)substack\.com$/, "substack"],
  [/(^|\.)medium\.com$/, "medium"],
  [/(^|\.)patreon\.com$/, "patreon"],
  [/(^|\.)ko-fi\.com$/, "kofi"],
  [/(^|\.)etsy\.com$/, "etsy"],
  [/(^|\.)paypal\.(me|com)$/, "paypal"],
  [/(^|\.)cash\.app$/, "cashapp"],
  [/(^|\.)venmo\.com$/, "venmo"],
  [/(^|\.)dribbble\.com$/, "dribbble"],
  [/(^|\.)behance\.net$/, "behance"],
  [/(^|\.)vimeo\.com$/, "vimeo"],
]

export function platformFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase()
    return HOST_HINTS.find(([re]) => re.test(host))?.[1] ?? null
  } catch {
    return null
  }
}
