import { randomBytes } from "node:crypto"
import { hashPassword } from "better-auth/crypto"
import { eq } from "drizzle-orm"
import { db } from "../src/lib/db"
import { migrateDatabase } from "../src/lib/db/migrate"
import { account, events, links, pages, user } from "../src/lib/db/schema"
import { PRESETS } from "../src/lib/themes"

const EMAIL = process.env.SEED_EMAIL ?? "demo@linkcliq.com"
const PASSWORD = process.env.SEED_PASSWORD ?? "linkcliq-demo"
const HANDLE = process.env.SEED_HANDLE ?? "demo"
const DAYS = 120

let seed = 42
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
function pick<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of items) {
    r -= w
    if (r <= 0) return v
  }
  return items[0][0]
}
const id = (len = 8) => randomBytes(len).toString("base64url").slice(0, len)

async function main() {
  await migrateDatabase()
  await db.delete(user).where(eq(user.email, EMAIL))
  await db.delete(pages).where(eq(pages.handle, HANDLE))

  const userId = id(16)
  await db.insert(user).values({ id: userId, name: "Maya Chen", email: EMAIL, emailVerified: true })
  await db.insert(account).values({
    id: id(16),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(PASSWORD),
  })

  const pageId = id(12)
  const { name: _n, ...theme } = PRESETS.find((p) => p.preset === "sunset")!
  await db.insert(pages).values({
    id: pageId,
    userId,
    handle: HANDLE,
    displayName: "Maya Chen",
    bio: "Creator systems, short-form video and the tools behind them. New course out now.",
    theme,
    escapeMode: "auto",
    seoTitle: "Maya Chen | Courses, templates and videos",
    seoDescription: "Everything Maya is building: the Content Systems course, free templates and the newsletter.",
  })

  const rows = [
    { kind: "link", title: "Content Systems: the full course", url: "https://example.com/course", highlight: "pulse", escapeMode: "auto", appendUtm: true },
    { kind: "link", title: "Free Notion content planner", url: "https://example.com/planner", appendUtm: true },
    { kind: "link", title: "Watch: how I plan 30 videos in a day", url: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
    { kind: "header", title: "Work with me", url: "" },
    { kind: "link", title: "Book a strategy call", url: "https://example.com/call", escapeMode: "guide" },
    { kind: "link", title: "The Sunday newsletter", url: "https://example.com/newsletter" },
    { kind: "link", title: "Black Friday bundle (ends Monday)", url: "https://example.com/bf", enabled: true, endsAt: new Date(Date.now() + 6 * 86_400_000) },
    { kind: "social", title: "", url: "https://instagram.com/maya", platform: "instagram" },
    { kind: "social", title: "", url: "https://tiktok.com/@maya", platform: "tiktok" },
    { kind: "social", title: "", url: "https://youtube.com/@maya", platform: "youtube" },
    { kind: "social", title: "", url: "https://x.com/maya", platform: "x" },
    { kind: "social", title: "", url: "https://linkedin.com/in/maya", platform: "linkedin" },
  ] as const
  const linkRows = rows.map((r, i) => ({ id: id(), pageId, position: i, ...r }))
  await db.insert(links).values(linkRows as never)

  const clickable = linkRows.filter((l) => l.kind !== "header")
  const linkWeights: [string, number][] = clickable.map((l, i) => [l.id, l.kind === "social" ? 1.2 : [9, 6, 4, 0, 3, 2.5, 3.5][i] ?? 1])
  const sources: [string, number][] = [["Instagram", 36], ["TikTok", 27], ["YouTube", 11], ["X", 7], ["Direct", 9], ["Google", 4], ["LinkedIn", 3], ["Email", 3]]
  const inAppFor: Record<string, string> = { Instagram: "Instagram", TikTok: "TikTok", X: "X", LinkedIn: "LinkedIn", Facebook: "Facebook" }
  const countries: [string, number][] = [["US", 34], ["GB", 11], ["CA", 7], ["DE", 6], ["AU", 5], ["IN", 6], ["BR", 5], ["FR", 4], ["NL", 3], ["AL", 3], ["ES", 3], ["MX", 3]]

  const batch: (typeof events.$inferInsert)[] = []
  const now = Date.now()
  const escapeOdds: Record<string, Record<string, number>> = {
    Instagram: { iOS: 0.64, Android: 0.58 },
    TikTok: { iOS: 0.31, Android: 0.36 },
    X: { iOS: 0.45, Android: 0.4 },
    LinkedIn: { iOS: 0.38, Android: 0.4 },
  }
  const methodFor = (app: string, os: string) =>
    os === "Android" ? "intent" : app === "Instagram" ? "ig_extbrowser" : app === "TikTok" ? (rand() < 0.55 ? "copy" : "x_safari") : "x_safari"
  const returning: { id: string; until: number }[] = []

  for (let d = DAYS; d >= 0; d--) {
    const dayEnd = now - d * 86_400_000
    const weekday = new Date(dayEnd).getUTCDay()
    const growth = 1 + (DAYS - d) / DAYS
    const views = Math.round((90 + rand() * 50) * growth * (weekday === 0 || weekday === 6 ? 1.25 : 1) * (d < 7 ? 1.35 : 1))
    for (let v = 0; v < views; v++) {
      const t = dayEnd - Math.floor(rand() * 86_400_000)
      const source = pick(sources)
      const mobile = rand() < 0.83
      const inApp = mobile && inAppFor[source] && rand() < 0.88 ? inAppFor[source] : null
      const os = mobile ? (rand() < 0.58 ? "iOS" : "Android") : pick<string>([["Mac OS", 5], ["Windows", 5], ["Linux", 1]])
      const browser = inApp ? `${inApp} in-app` : mobile ? (os === "iOS" ? "Mobile Safari" : "Chrome") : pick<string>([["Chrome", 6], ["Safari", 3], ["Firefox", 1], ["Edge", 1]])
      const back = returning.length > 0 && rand() < 0.22 ? returning[Math.floor(rand() * returning.length)] : null
      const visitorId = back && back.until > t ? back.id : id(16)
      if (!back && rand() < 0.3) returning.push({ id: visitorId, until: t + 86_400_000 })
      if (returning.length > 400) returning.splice(0, 100)
      const base = {
        pageId,
        visitorId,
        source,
        referrer: source === "Google" ? "google.com" : source === "YouTube" ? "youtube.com" : null,
        inApp,
        country: pick(countries),
        device: mobile ? (rand() < 0.04 ? "Tablet" : "Mobile") : "Desktop",
        browser,
        os,
        utmSource: source === "Email" ? "newsletter" : null,
        utmMedium: null,
        utmCampaign: null,
      }
      batch.push({ ...base, type: "view", createdAt: new Date(t) })
      let clickBase = base
      const odds = inApp ? escapeOdds[inApp]?.[os] ?? 0 : 0
      if (inApp && rand() < odds) {
        const realBrowser = os === "iOS" ? "Mobile Safari" : "Chrome"
        batch.push({ ...base, visitorId: id(16), type: "escape", escapeMethod: methodFor(inApp, os), browser: realBrowser, createdAt: new Date(t + 1800) })
        clickBase = { ...base, inApp: null, browser: realBrowser }
      }
      const clickOdds = clickBase.inApp ? 0.33 : 0.52
      if (rand() < clickOdds) {
        const linkId = pick(linkWeights)
        const ct = new Date(Math.min(now - 500, t + 4000 + Math.floor(rand() * 40_000)))
        batch.push({ ...clickBase, linkId, type: "click", createdAt: ct })
      }
    }
  }
  for (let i = 0; i < batch.length; i += 1000) await db.insert(events).values(batch.slice(i, i + 1000))
  console.log(`Seeded ${batch.length} events for /${HANDLE}. Sign in with ${EMAIL} / ${PASSWORD}`)
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err)
    process.exit(1)
  }
)
