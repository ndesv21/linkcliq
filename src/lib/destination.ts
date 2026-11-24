import type { Link, Page } from "./db/schema"
import { sourceSlug } from "./tracking"

export function buildDestination(link: Pick<Link, "url" | "appendUtm">, page: Pick<Page, "handle">, source: string | null) {
  if (!link.appendUtm || !/^https?:/i.test(link.url)) return link.url
  try {
    const url = new URL(link.url)
    if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", source && source !== "Direct" ? sourceSlug(source) : "linkinbio")
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "social")
    if (!url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", page.handle)
    return url.toString()
  } catch {
    return link.url
  }
}
