"use server"

import { and, eq, ne } from "drizzle-orm"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { fail, ok, type ActionResult } from "@/lib/action-result"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { links, pages } from "@/lib/db/schema"
import { handleSchema } from "@/lib/handles"
import { shortId } from "@/lib/ids"
import { ACTIVE_PAGE_COOKIE, getOwnedPage } from "@/lib/pages"
import { DEFAULT_THEME, type PageTheme } from "@/lib/themes"

async function ownedPage(pageId: string) {
  const user = await requireUser()
  const page = await getOwnedPage(user.id, pageId)
  if (!page) throw new Error("Page not found")
  return { user, page }
}

function refresh(handle?: string) {
  revalidatePath("/dashboard", "layout")
  if (handle) revalidatePath(`/${handle}`)
}

async function handleTaken(handle: string, exceptId?: string) {
  const [row] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(exceptId ? and(eq(pages.handle, handle), ne(pages.id, exceptId)) : eq(pages.handle, handle))
  return Boolean(row)
}

const createSchema = z.object({
  handle: handleSchema,
  displayName: z.string().trim().min(1, "Add a display name").max(60),
})

export async function createPage(input: z.input<typeof createSchema>): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const data = createSchema.parse(input)
    if (await handleTaken(data.handle)) return fail("That handle is taken")
    const id = shortId(12)
    await db.insert(pages).values({ id, userId: user.id, handle: data.handle, displayName: data.displayName, theme: DEFAULT_THEME })
    await db.insert(links).values([
      { id: shortId(), pageId: id, kind: "link", title: "My website", url: "https://example.com", position: 0 },
    ])
    ;(await cookies()).set(ACTIVE_PAGE_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 })
    refresh(data.handle)
    return ok({ id })
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message)
    return fail(e)
  }
}

export async function checkHandle(handle: string): Promise<ActionResult<{ available: boolean; reason?: string }>> {
  const parsed = handleSchema.safeParse(handle)
  if (!parsed.success) return ok({ available: false, reason: parsed.error.issues[0]?.message })
  return ok({ available: !(await handleTaken(parsed.data)), reason: "That handle is taken" })
}

export async function setActivePage(pageId: string) {
  await ownedPage(pageId)
  ;(await cookies()).set(ACTIVE_PAGE_COOKIE, pageId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 })
  refresh()
}

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  bio: z.string().trim().max(280),
  avatar: z
    .string()
    .max(400_000, "Avatar is too large")
    .refine((v) => v.startsWith("data:image/") || /^https?:\/\//.test(v), "Invalid image")
    .nullable(),
})

export async function updateProfile(pageId: string, input: z.input<typeof profileSchema>): Promise<ActionResult> {
  try {
    const { page } = await ownedPage(pageId)
    await db.update(pages).set(profileSchema.parse(input)).where(eq(pages.id, page.id))
    refresh(page.handle)
    return ok(undefined)
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message)
    return fail(e)
  }
}

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const themeSchema = z.object({
  preset: z.string().max(40),
  background: z.object({ type: z.enum(["solid", "gradient"]), from: color, to: color, angle: z.number().min(0).max(360) }),
  text: color,
  muted: color,
  button: z.object({
    style: z.enum(["fill", "outline", "soft", "shadow"]),
    radius: z.enum(["none", "md", "lg", "full"]),
    bg: color,
    fg: color,
  }),
  font: z.enum(["geist", "inter", "dm-sans", "space-grotesk", "outfit", "playfair", "jetbrains"]),
}) satisfies z.ZodType<PageTheme>

export async function updateTheme(pageId: string, theme: PageTheme): Promise<ActionResult> {
  try {
    const { page } = await ownedPage(pageId)
    await db.update(pages).set({ theme: themeSchema.parse(theme) }).where(eq(pages.id, page.id))
    refresh(page.handle)
    return ok(undefined)
  } catch (e) {
    return fail(e)
  }
}

const settingsSchema = z.object({
  handle: handleSchema,
  seoTitle: z.string().trim().max(70).nullable(),
  seoDescription: z.string().trim().max(160).nullable(),
  sensitive: z.boolean(),
  showBranding: z.boolean(),
  published: z.boolean(),
  gaMeasurementId: z
    .string()
    .trim()
    .regex(/^G-[A-Z0-9]{4,12}$/i, "Use a GA4 ID like G-XXXXXXX")
    .nullable()
    .or(z.literal("").transform(() => null)),
  metaPixelId: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, "Meta Pixel IDs are digits only")
    .nullable()
    .or(z.literal("").transform(() => null)),
})

export async function updateSettings(pageId: string, input: z.input<typeof settingsSchema>): Promise<ActionResult> {
  try {
    const { page } = await ownedPage(pageId)
    const data = settingsSchema.parse(input)
    if (data.handle !== page.handle && (await handleTaken(data.handle, page.id))) return fail("That handle is taken")
    await db.update(pages).set(data).where(eq(pages.id, page.id))
    refresh(page.handle)
    if (data.handle !== page.handle) revalidatePath(`/${data.handle}`)
    return ok(undefined)
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message)
    return fail(e)
  }
}

const escapeSchema = z.object({ escapeMode: z.enum(["off", "auto", "guide"]), escapeSkipAds: z.boolean() })

export async function updateEscape(pageId: string, input: z.input<typeof escapeSchema>): Promise<ActionResult> {
  try {
    const { page } = await ownedPage(pageId)
    await db.update(pages).set(escapeSchema.parse(input)).where(eq(pages.id, page.id))
    refresh(page.handle)
    return ok(undefined)
  } catch (e) {
    return fail(e)
  }
}

export async function deletePage(pageId: string): Promise<ActionResult> {
  try {
    const { page } = await ownedPage(pageId)
    await db.delete(pages).where(eq(pages.id, page.id))
    ;(await cookies()).delete(ACTIVE_PAGE_COOKIE)
    refresh(page.handle)
    return ok(undefined)
  } catch (e) {
    return fail(e)
  }
}
