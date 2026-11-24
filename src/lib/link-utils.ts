export function isLive(link: { enabled: boolean; startsAt: Date | string | null; endsAt: Date | string | null }, now = Date.now()) {
  if (!link.enabled) return false
  if (link.startsAt && new Date(link.startsAt).getTime() > now) return false
  if (link.endsAt && new Date(link.endsAt).getTime() <= now) return false
  return true
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
