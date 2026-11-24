import "server-only"
import { eq } from "drizzle-orm"
import { decrypt } from "./crypto"
import { db } from "./db"
import { integrations } from "./db/schema"
import { SOCIALCLAW_API } from "./env"

export type SocialClawAccount = {
  id: string
  provider: string
  handle: string
  displayName: string | null
  accountType: string | null
  status: string | null
}

export type SocialClawWorkspace = { id: string; name: string | null }

export class SocialClawError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function call<T>(key: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SOCIALCLAW_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      "user-agent": "linkcliq-oss",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  })
  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (!res.ok || body?.ok === false) {
    const err = body?.error
    const message =
      (typeof err === "string" && err) ||
      (err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "") ||
      (typeof body?.message === "string" && body.message) ||
      `SocialClaw returned ${res.status}`
    throw new SocialClawError(message, res.status)
  }
  return body as T
}

export async function validateKey(key: string) {
  const body = await call<{ tenant?: { id?: string; name?: string; slug?: string } }>(key, "/v1/keys/validate", {
    method: "POST",
    body: "{}",
  })
  return { id: body.tenant?.id ?? "", name: body.tenant?.name ?? body.tenant?.slug ?? null } satisfies SocialClawWorkspace
}

export async function listAccounts(key: string) {
  const body = await call<{ accounts?: SocialClawAccount[] }>(key, "/v1/accounts")
  return (body.accounts ?? []).filter((a) => !a.status || /connected|active|ok|healthy/i.test(a.status))
}

export type SchedulePostInput = {
  accounts: { handle: string; provider: string }[]
  text: string
  title?: string
  publishAt: string
  mediaUrl?: string
  timezone: string
}

export async function schedulePosts(key: string, input: SchedulePostInput) {
  const schedule = {
    timezone: input.timezone,
    mode: "scheduled" as const,
    idempotencyKey: `linkcliq-${input.accounts.map((a) => a.handle).join(",")}-${input.publishAt}-${input.text.length}`,
    posts: input.accounts.map((a) => ({
      account: a.handle,
      provider: a.provider,
      name: input.title || input.text.slice(0, 90),
      description: input.text,
      publish_at: input.publishAt,
      ...(input.mediaUrl ? { assets: [input.mediaUrl] } : {}),
    })),
  }
  await call(key, "/v1/posts/validate", { method: "POST", body: JSON.stringify(schedule) })
  return call<{ run?: { id: string }; posts?: { id: string }[]; duplicate?: boolean }>(key, "/v1/posts/apply", {
    method: "POST",
    body: JSON.stringify(schedule),
  })
}

export async function getStoredKey(userId: string) {
  const [row] = await db.select().from(integrations).where(eq(integrations.userId, userId))
  if (!row?.socialclawKey) return null
  try {
    return { key: decrypt(row.socialclawKey), workspace: row.socialclawWorkspace }
  } catch {
    return null
  }
}

export const MEDIA_REQUIRED = new Set(["instagram", "instagram_business", "tiktok", "youtube", "pinterest", "snapchat"])
export const TITLE_REQUIRED = new Set(["reddit", "youtube", "wordpress", "pinterest"])

export const PROVIDER_LABEL: Record<string, string> = {
  x: "X",
  meta: "Meta",
  facebook: "Facebook",
  instagram: "Instagram",
  instagram_business: "Instagram",
  threads: "Threads",
  snapchat: "Snapchat",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  linkedin_page: "LinkedIn",
  pinterest: "Pinterest",
  youtube: "YouTube",
  reddit: "Reddit",
  discord: "Discord",
  telegram: "Telegram",
  wordpress: "WordPress",
  bluesky: "Bluesky",
}

export const PROVIDER_CHAR_LIMIT: Record<string, number> = {
  x: 280,
  threads: 500,
  bluesky: 300,
  linkedin: 3000,
  linkedin_page: 3000,
  instagram: 2200,
  instagram_business: 2200,
  tiktok: 2200,
  facebook: 63206,
  pinterest: 500,
}
