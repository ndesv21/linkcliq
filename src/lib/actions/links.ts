"use server"

import { and, eq, inArray, max } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { fail, ok, type ActionResult } from "@/lib/action-result"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { links, type Link } from "@/lib/db/schema"
import { shortId } from "@/lib/ids"
import { getOwnedPage } from "@/lib/pages"

async function ownedPage(pageId: string) {
  const user = await requireUser()
  const page = await getOwnedPage(user.id, pageId)
  if (!page) throw new Error("Page not found")
  return page
}

function refresh(handle: string) {
  revalidatePath("/dashboard", "layout")
  revalidatePath(`/${handle}`)
}

const url = z
  .string()
  .trim()
  .max(2048)
  .transform((v) => (v && !/^[a-z][a-z0-9+.-]*:/i.test(v) ? `https://${v}` : v))
  .refine((v) => v === "" || /^(https?:|mailto:|tel:|sms:)/i.test(v), "Use an http(s), mailto, tel or sms link")

const createSchema = z.object({
  kind: z.enum(["link", "header", "social"]),
  title: z.string().trim().max(120).default(""),
  url: url.default(""),
  platform: z.string().max(40).nullable().default(null),
})

export async function createLink(pageId: string, input: z.input<typeof createSchema>): Promise<ActionResult<Link>> {
  try {
    const page = await ownedPage(pageId)
    const data = createSchema.parse(input)
    const [{ top }] = await db.select({ top: max(links.position) }).from(links).where(eq(links.pageId, page.id))
    const position = data.kind === "social" ? (top ?? 0) + 1 : -1
    if (data.kind !== "social") {
      const rows = await db.select({ id: links.id, position: links.position }).from(links).where(eq(links.pageId, page.id))
      await Promise.all(rows.map((r) => db.update(links).set({ position: r.position + 1 }).where(eq(links.id, r.id))))
    }
    const [row] = await db
      .insert(links)
      .values({ id: shortId(), pageId: page.id, ...data, position: data.kind === "social" ? position : 0 })
      .returning()
    refresh(page.handle)
    return ok(row)
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message)
    return fail(e)
  }
}

const patchSchema = z
  .object({
    title: z.string().trim().max(120),
    url,
    platform: z.string().max(40).nullable(),
    thumbnail: z.string().max(400_000).nullable(),
    enabled: z.boolean(),
    highlight: z.enum(["none", "pulse", "wobble", "glow"]),
    escapeMode: z.enum(["inherit", "off", "auto", "guide"]),
    appendUtm: z.boolean(),
    startsAt: z.coerce.date().nullable(),
    endsAt: z.coerce.date().nullable(),
  })
  .partial()

export async function updateLink(pageId: string, linkId: string, patch: z.input<typeof patchSchema>): Promise<ActionResult> {
  try {
    const page = await ownedPage(pageId)
    const data = patchSchema.parse(patch)
    if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) return fail("End time must be after the start time")
    await db.update(links).set(data).where(and(eq(links.id, linkId), eq(links.pageId, page.id)))
    refresh(page.handle)
    return ok(undefined)
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message)
    return fail(e)
  }
}

export async function deleteLink(pageId: string, linkId: string): Promise<ActionResult> {
  try {
    const page = await ownedPage(pageId)
    await db.delete(links).where(and(eq(links.id, linkId), eq(links.pageId, page.id)))
    refresh(page.handle)
    return ok(undefined)
  } catch (e) {
    return fail(e)
  }
}

export async function reorderLinks(pageId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const page = await ownedPage(pageId)
    const ids = z.array(z.string().max(32)).max(500).parse(orderedIds)
    const existing = await db
      .select({ id: links.id })
      .from(links)
      .where(and(eq(links.pageId, page.id), inArray(links.id, ids)))
    const allowed = new Set(existing.map((r) => r.id))
    await db.transaction(async (tx) => {
      for (const [i, id] of ids.entries()) {
        if (allowed.has(id)) await tx.update(links).set({ position: i }).where(eq(links.id, id))
      }
    })
    refresh(page.handle)
    return ok(undefined)
  } catch (e) {
    return fail(e)
  }
}
