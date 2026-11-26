import { SiteHeader } from "@/components/dashboard/site-header"
import { SocialCalendar } from "@/components/socialclaw/social-calendar"
import { getPublicOrigin } from "@/lib/dashboard"
import { requirePage } from "@/lib/pages"
import { getStoredKey, listAccounts, listPosts, type SocialClawAccount, type SocialClawPost } from "@/lib/socialclaw"

export const metadata = { title: "Social Calendar" }

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/

function parseMonth(value: string | string[] | undefined) {
  const match = typeof value === "string" ? MONTH.exec(value) : null
  const now = new Date()
  const year = match ? Number(match[1]) : now.getUTCFullYear()
  const month = match ? Number(match[2]) - 1 : now.getUTCMonth()
  return { year, month, key: `${year}-${String(month + 1).padStart(2, "0")}` }
}

export default async function CalendarPage({ searchParams }: PageProps<"/dashboard/calendar">) {
  const { user, page } = await requirePage()
  const sp = await searchParams
  const { year, month, key } = parseMonth(sp.month)
  const [origin, stored] = await Promise.all([getPublicOrigin(), getStoredKey(user.id)])

  let posts: SocialClawPost[] = []
  let accounts: SocialClawAccount[] = []
  let error: string | null = null
  if (stored) {
    // A week either side covers the leading and trailing days of the grid in any timezone.
    const from = new Date(Date.UTC(year, month, 1) - 7 * 86_400_000)
    const to = new Date(Date.UTC(year, month + 1, 1) + 7 * 86_400_000)
    try {
      ;[posts, accounts] = await Promise.all([listPosts(stored.key, { from, to }), listAccounts(stored.key)])
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not reach SocialClaw"
    }
  }

  const pageUrl = `${origin}/${page.handle}`
  return (
    <>
      <SiteHeader title="Social Calendar" pageUrl={pageUrl} />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <SocialCalendar
          month={key}
          posts={posts}
          accounts={accounts.map((a) => ({ handle: a.handle, provider: a.provider, name: a.displayName || a.handle }))}
          connection={stored ? { connected: true, workspace: stored.workspace, error } : { connected: false, workspace: null, error: null }}
          openSettings={sp.settings === "1"}
          pageUrl={pageUrl}
        />
      </div>
    </>
  )
}
