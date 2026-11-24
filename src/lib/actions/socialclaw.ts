"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { fail, ok, type ActionResult } from "@/lib/action-result"
import { requireUser } from "@/lib/auth"
import { encrypt } from "@/lib/crypto"
import { db } from "@/lib/db"
import { integrations } from "@/lib/db/schema"
import {
  getStoredKey,
  listAccounts,
  schedulePosts,
  validateKey,
  type SocialClawAccount,
} from "@/lib/socialclaw"

export async function connectSocialClaw(rawKey: string): Promise<ActionResult<{ workspace: string | null }>> {
  try {
    const user = await requireUser()
    const key = z.string().trim().min(10, "Paste your full API key").max(400).parse(rawKey)
    const workspace = await validateKey(key)
    const values = { userId: user.id, socialclawKey: encrypt(key), socialclawWorkspace: workspace.name }
    await db.insert(integrations).values(values).onConflictDoUpdate({ target: integrations.userId, set: values })
    revalidatePath("/dashboard", "layout")
    return ok({ workspace: workspace.name })
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message)
    return fail(e)
  }
}

export async function disconnectSocialClaw(): Promise<ActionResult> {
  try {
    const user = await requireUser()
    await db
      .update(integrations)
      .set({ socialclawKey: null, socialclawWorkspace: null })
      .where(eq(integrations.userId, user.id))
    revalidatePath("/dashboard", "layout")
    return ok(undefined)
  } catch (e) {
    return fail(e)
  }
}

export async function getSocialClawAccounts(): Promise<ActionResult<{ connected: boolean; accounts: SocialClawAccount[] }>> {
  try {
    const user = await requireUser()
    const stored = await getStoredKey(user.id)
    if (!stored) return ok({ connected: false, accounts: [] })
    return ok({ connected: true, accounts: await listAccounts(stored.key) })
  } catch (e) {
    return fail(e)
  }
}

const postSchema = z.object({
  accounts: z.array(z.object({ handle: z.string().min(1), provider: z.string().min(1) })).min(1, "Pick at least one account"),
  text: z.string().trim().min(1, "Write something to post").max(10_000),
  title: z.string().trim().max(300).optional(),
  publishAt: z.string().datetime({ offset: true }),
  mediaUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  timezone: z.string().max(64).default("UTC"),
})

export async function scheduleSocialPost(input: z.input<typeof postSchema>): Promise<ActionResult<{ runId: string | null; count: number }>> {
  try {
    const user = await requireUser()
    const stored = await getStoredKey(user.id)
    if (!stored) return fail("Connect SocialClaw first")
    const data = postSchema.parse(input)
    const result = await schedulePosts(stored.key, data)
    return ok({ runId: result.run?.id ?? null, count: result.posts?.length ?? data.accounts.length })
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message)
    return fail(e)
  }
}
