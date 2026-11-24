import "server-only"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { cache } from "react"
import { db } from "./db"
import { integrations } from "./db/schema"

export const getPublicOrigin = cache(async () => {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "")
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https")
  return `${proto}://${host}`
})

export const getSocialClawStatus = cache(async (userId: string) => {
  const [row] = await db.select().from(integrations).where(eq(integrations.userId, userId))
  return { connected: Boolean(row?.socialclawKey), workspace: row?.socialclawWorkspace ?? null }
})
