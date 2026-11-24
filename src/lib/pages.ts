import "server-only"
import { and, asc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { requireUser } from "./auth"
import { db } from "./db"
import { links, pages, type Link, type Page } from "./db/schema"

export const ACTIVE_PAGE_COOKIE = "lc_page"

export const getUserPages = cache(async (userId: string) => {
  return db.select().from(pages).where(eq(pages.userId, userId)).orderBy(asc(pages.createdAt))
})

export const requirePage = cache(async (): Promise<{ user: Awaited<ReturnType<typeof requireUser>>; page: Page; pages: Page[] }> => {
  const user = await requireUser()
  const all = await getUserPages(user.id)
  if (all.length === 0) redirect("/onboarding")
  const wanted = (await cookies()).get(ACTIVE_PAGE_COOKIE)?.value
  const page = all.find((p) => p.id === wanted) ?? all[0]
  return { user, page, pages: all }
})

export async function getOwnedPage(userId: string, pageId: string) {
  const [page] = await db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, userId)))
  return page ?? null
}

export async function getPageLinks(pageId: string): Promise<Link[]> {
  return db.select().from(links).where(eq(links.pageId, pageId)).orderBy(asc(links.position))
}

export async function getPageByHandle(handle: string) {
  const [page] = await db.select().from(pages).where(eq(pages.handle, handle.toLowerCase()))
  return page ?? null
}

/** Whether visitors can see the page: published by its owner and not suspended. */
export function isPagePublic(page: Pick<Page, "published" | "suspendedAt">) {
  return page.published && !page.suspendedAt
}

export function isLinkLive(link: Pick<Link, "enabled" | "startsAt" | "endsAt">, now = Date.now()) {
  if (!link.enabled) return false
  if (link.startsAt && link.startsAt.getTime() > now) return false
  if (link.endsAt && link.endsAt.getTime() <= now) return false
  return true
}
