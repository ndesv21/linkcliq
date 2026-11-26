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

export type SocialClawPostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "action_required"
  | "retry_pending"
  | "failed"
  | "canceled"

type RawAsset = string | { url?: string | null; publicUrl?: string | null; previewUrl?: string | null; thumbnailUrl?: string | null; posterUrl?: string | null; mime?: string | null; kind?: string | null }

type RawPost = {
  id: string
  provider?: string | null
  account?: string | null
  name?: string | null
  description?: string | null
  status?: string | null
  publishAtUtc?: string | null
  nextAttemptAt?: string | null
  publishedAt?: string | null
  providerUrl?: string | null
  lastError?: string | null
  mediaLink?: string | null
  assets?: RawAsset[] | null
  campaignName?: string | null
}

export type SocialClawPost = {
  id: string
  provider: string
  account: string
  title: string | null
  text: string
  status: SocialClawPostStatus
  /** When it went out, or when it is due. ISO 8601. */
  at: string
  url: string | null
  error: string | null
  thumbnail: string | null
  campaign: string | null
}

const IMAGE_URL = /\.(png|jpe?g|webp|gif|avif)(\?|$)/i

function thumbnailOf(post: RawPost) {
  for (const asset of post.assets ?? []) {
    if (typeof asset === "string") {
      if (IMAGE_URL.test(asset)) return asset
      continue
    }
    const url = asset.thumbnailUrl || asset.posterUrl || asset.previewUrl || (asset.mime?.startsWith("image/") || asset.kind === "image" ? asset.publicUrl || asset.url : null)
    if (url) return url
  }
  return post.mediaLink && IMAGE_URL.test(post.mediaLink) ? post.mediaLink : null
}

function toPost(raw: RawPost): SocialClawPost | null {
  const at = raw.publishedAt || raw.publishAtUtc || raw.nextAttemptAt
  if (!at) return null
  const text = (raw.description || raw.name || "").trim()
  const name = raw.name?.trim().replace(/(…|\.\.\.)$/, "") ?? ""
  return {
    id: raw.id,
    provider: raw.provider || "unknown",
    account: raw.account || "",
    // SocialClaw fills name with the start of the text when no title was given.
    title: name && !text.startsWith(name) ? raw.name!.trim() : null,
    text,
    status: (raw.status as SocialClawPostStatus) || "scheduled",
    at,
    url: raw.providerUrl || null,
    error: raw.lastError || null,
    thumbnail: thumbnailOf(raw),
    campaign: raw.campaignName || null,
  }
}

/** Posts due or published between two instants, oldest first, up to 1,000. Canceled posts are left out. */
export async function listPosts(key: string, range: { from: Date; to: Date }) {
  const pageSize = 200
  const posts: SocialClawPost[] = []
  for (let offset = 0; offset < 1000; offset += pageSize) {
    const params = new URLSearchParams({
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      limit: String(pageSize),
      offset: String(offset),
    })
    const body = await call<{ posts?: RawPost[]; total?: number }>(key, `/v1/posts?${params}`)
    const batch = body.posts ?? []
    for (const raw of batch) {
      const post = toPost(raw)
      if (post && post.status !== "canceled") posts.push(post)
    }
    if (batch.length < pageSize || (typeof body.total === "number" && offset + pageSize >= body.total)) break
  }
  return posts.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
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
