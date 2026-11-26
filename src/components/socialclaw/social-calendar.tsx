"use client"

import { useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowUpRightIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, KeyRoundIcon, PlusIcon, TriangleAlertIcon } from "lucide-react"
import { PlatformIcon } from "@/components/platform-icon"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { socialclawHref } from "@/lib/env"
import type { SocialClawPost, SocialClawPostStatus } from "@/lib/socialclaw"
import { cn } from "@/lib/utils"
import { CalendarSettings } from "./calendar-settings"
import { ComposerDialog } from "./composer-dialog"
import { PROVIDER_PLATFORM } from "./provider"

type Account = { handle: string; provider: string; name: string }
type Connection = { connected: boolean; workspace: string | null; error: string | null }

const STATUS: Record<SocialClawPostStatus, { label: string; tone: string; badge: "outline" | "secondary" | "destructive" }> = {
  draft: { label: "Draft", tone: "border-l-muted-foreground/50 [--dot:var(--muted-foreground)]", badge: "outline" },
  scheduled: { label: "Scheduled", tone: "border-l-chart-1 [--dot:var(--chart-1)]", badge: "outline" },
  publishing: { label: "Publishing", tone: "border-l-chart-4 [--dot:var(--chart-4)]", badge: "outline" },
  retry_pending: { label: "Retrying", tone: "border-l-chart-4 [--dot:var(--chart-4)]", badge: "outline" },
  published: { label: "Published", tone: "border-l-chart-3 [--dot:var(--chart-3)]", badge: "secondary" },
  action_required: { label: "Needs action", tone: "border-l-destructive [--dot:var(--destructive)]", badge: "destructive" },
  failed: { label: "Failed", tone: "border-l-destructive [--dot:var(--destructive)]", badge: "destructive" },
  canceled: { label: "Canceled", tone: "border-l-muted-foreground/50 [--dot:var(--muted-foreground)]", badge: "outline" },
}
const statusOf = (s: string) => STATUS[s as SocialClawPostStatus] ?? STATUS.scheduled

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const MAX_CHIPS = 3

const pad = (n: number) => String(n).padStart(2, "0")
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const monthKey = (year: number, month: number) => {
  const d = new Date(year, month, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

const noop = () => () => {}
/** False on the server and during hydration, true afterwards. Dates and times depend on the viewer's timezone. */
function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false)
}

function gridDays(year: number, month: number) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  const length = new Date(year, month + 1, 0).getDate()
  const cells = Math.ceil((offset + length) / 7) * 7
  return Array.from({ length: cells }, (_, i) => new Date(year, month, 1 - offset + i))
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

function formatWhen(post: SocialClawPost) {
  const when = new Date(post.at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  if (post.status === "published") return `Published ${when}`
  if (post.status === "failed" || post.status === "action_required") return `Was due ${when}`
  if (post.status === "draft") return `Draft for ${when}`
  return `Scheduled for ${when}`
}

export function SocialCalendar({
  month,
  posts,
  accounts,
  connection,
  openSettings,
  pageUrl,
}: {
  month: string
  posts: SocialClawPost[]
  accounts: Account[]
  connection: Connection
  openSettings: boolean
  pageUrl: string
}) {
  const isClient = useIsClient()
  const [year, monthIndex] = month.split("-").map(Number) as [number, number]
  const m = monthIndex - 1
  const days = useMemo(() => gridDays(year, m), [year, m])
  const names = useMemo(() => new Map(accounts.map((a) => [`${a.provider}:${a.handle}`, a.name])), [accounts])

  const byDay = useMemo(() => {
    const map = new Map<string, SocialClawPost[]>()
    if (!isClient) return map
    for (const post of posts) {
      const key = dayKey(new Date(post.at))
      map.set(key, [...(map.get(key) ?? []), post])
    }
    return map
  }, [posts, isClient])

  const inMonth = useMemo(() => {
    if (!isClient) return []
    return posts.filter((p) => {
      const d = new Date(p.at)
      return d.getFullYear() === year && d.getMonth() === m
    })
  }, [posts, isClient, year, m])

  const counts = {
    scheduled: inMonth.filter((p) => ["scheduled", "publishing", "retry_pending"].includes(p.status)).length,
    published: inMonth.filter((p) => p.status === "published").length,
    failed: inMonth.filter((p) => p.status === "failed" || p.status === "action_required").length,
  }

  const today = isClient ? dayKey(new Date()) : null
  const thisMonth = isClient ? monthKey(new Date().getFullYear(), new Date().getMonth()) : null
  const href = (key: string) => `/dashboard/calendar?month=${key}`
  const accountName = (p: SocialClawPost) => names.get(`${p.provider}:${p.account}`) ?? (p.account.includes(":") ? null : p.account)
  const ready = connection.connected && !connection.error

  return (
    <div className="grid gap-4">
      {!connection.connected && (
        <Alert>
          <CalendarDaysIcon />
          <AlertTitle>See your social posts next to your links</AlertTitle>
          <AlertDescription>Add a SocialClaw API key to fill this calendar with your scheduled and published posts across X, Instagram, TikTok, LinkedIn, YouTube and more.</AlertDescription>
          <AlertAction>
            <CalendarSettings connection={connection} accounts={accounts} defaultOpen={openSettings}>
              <Button size="sm">
                <KeyRoundIcon /> Add API key
              </Button>
            </CalendarSettings>
          </AlertAction>
        </Alert>
      )}
      {connection.error && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>SocialClaw did not accept the saved key</AlertTitle>
          <AlertDescription>{connection.error}. Paste a fresh key in the calendar settings.</AlertDescription>
        </Alert>
      )}

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
          <h2 className="min-w-36 text-base font-semibold">
            {MONTH_NAMES[m]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={href(monthKey(year, m - 1))} aria-label="Previous month">
                <ChevronLeftIcon />
              </Link>
            </Button>
            <Button variant={thisMonth === month ? "secondary" : "outline"} size="sm" asChild>
              <Link href={thisMonth ? href(thisMonth) : "/dashboard/calendar"}>Today</Link>
            </Button>
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={href(monthKey(year, m + 1))} aria-label="Next month">
                <ChevronRightIcon />
              </Link>
            </Button>
          </div>
          {ready && isClient && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Legend tone="[--dot:var(--chart-1)]" label={`${counts.scheduled} scheduled`} />
              <Legend tone="[--dot:var(--chart-3)]" label={`${counts.published} published`} />
              {counts.failed > 0 && <Legend tone="[--dot:var(--destructive)]" label={`${counts.failed} need attention`} />}
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {ready && (
              <ComposerDialog defaultText={`All my links in one place: ${pageUrl}`}>
                <Button size="sm">
                  <PlusIcon /> New post
                </Button>
              </ComposerDialog>
            )}
            {connection.connected && <CalendarSettings connection={connection} accounts={accounts} defaultOpen={openSettings} />}
          </div>
        </div>

        <CardContent className="p-0">
          <div className="hidden md:block">
            <div className="grid grid-cols-7 border-b text-xs font-medium text-muted-foreground">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-2 py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 [&>*:nth-child(7n)]:border-r-0">
              {days.map((day) => {
                const key = dayKey(day)
                const list = byDay.get(key) ?? []
                const outside = day.getMonth() !== m
                return (
                  <div key={key} className={cn("flex min-h-28 min-w-0 flex-col gap-1 border-r border-b p-1.5", outside && "bg-muted/30")}>
                    <span
                      className={cn(
                        "ml-0.5 flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                        outside ? "text-muted-foreground/60" : "text-muted-foreground",
                        key === today && "bg-primary font-semibold text-primary-foreground"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {list.slice(0, MAX_CHIPS).map((p) => (
                      <PostChip key={p.id} post={p} account={accountName(p)} />
                    ))}
                    {list.length > MAX_CHIPS && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="rounded-md px-1.5 py-0.5 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground">+{list.length - MAX_CHIPS} more</button>
                        </PopoverTrigger>
                        <PopoverContent className="grid w-72 gap-1.5 p-2" align="start">
                          <p className="px-1 text-xs font-medium text-muted-foreground">{day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
                          {list.map((p) => (
                            <PostChip key={p.id} post={p} account={accountName(p)} />
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <Agenda days={days.filter((d) => d.getMonth() === m)} byDay={byDay} isClient={isClient} ready={ready} accountName={accountName} />
        </CardContent>
      </Card>

      {ready && isClient && inMonth.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Nothing scheduled or published in {MONTH_NAMES[m]}. Use New post to schedule your first one.</p>
      )}
    </div>
  )
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", tone)}>
      <span className="size-2 rounded-full bg-(--dot)" />
      {label}
    </span>
  )
}

function Agenda({
  days,
  byDay,
  isClient,
  ready,
  accountName,
}: {
  days: Date[]
  byDay: Map<string, SocialClawPost[]>
  isClient: boolean
  ready: boolean
  accountName: (p: SocialClawPost) => string | null
}) {
  const withPosts = days.filter((d) => byDay.has(dayKey(d)))
  return (
    <div className="grid md:hidden">
      {!isClient && ready && (
        <div className="grid gap-2 p-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      )}
      {isClient && withPosts.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No posts this month.</p>}
      {withPosts.map((d) => (
        <div key={dayKey(d)} className="grid gap-1.5 border-b px-4 py-3 last:border-b-0">
          <p className="text-xs font-medium text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          {(byDay.get(dayKey(d)) ?? []).map((p) => (
            <PostChip key={p.id} post={p} account={accountName(p)} large />
          ))}
        </div>
      ))}
    </div>
  )
}

function PostChip({ post, account, large = false }: { post: SocialClawPost; account: string | null; large?: boolean }) {
  const status = statusOf(post.status)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex w-full min-w-0 items-center gap-1.5 rounded-md border-l-2 bg-muted/60 text-left transition-colors hover:bg-muted",
            large ? "px-2.5 py-2 text-sm" : "px-1.5 py-1 text-xs",
            status.tone,
            post.status === "canceled" && "line-through opacity-60"
          )}
        >
          <PlatformIcon platform={PROVIDER_PLATFORM[post.provider] ?? post.provider} className={cn("shrink-0", large ? "size-4" : "size-3")} />
          <span className="shrink-0 text-muted-foreground tabular-nums">{formatTime(post.at)}</span>
          <span className="truncate">{post.title || post.text || "Untitled post"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="grid w-80 gap-3" align="start">
        <div className="flex items-start gap-2">
          <PlatformIcon platform={PROVIDER_PLATFORM[post.provider] ?? post.provider} colored className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{account ?? post.provider}</p>
            <p className="text-xs text-muted-foreground">{formatWhen(post)}</p>
          </div>
          <Badge variant={status.badge}>{status.label}</Badge>
        </div>
        {post.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt="" className="aspect-video w-full rounded-md border object-cover" loading="lazy" />
        )}
        {post.title && <p className="text-sm font-medium">{post.title}</p>}
        {post.text && <p className="line-clamp-6 text-sm whitespace-pre-wrap text-muted-foreground">{post.text}</p>}
        {post.error && (post.status === "failed" || post.status === "action_required" || post.status === "retry_pending") && (
          <p className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">{post.error}</p>
        )}
        {post.campaign && <p className="text-xs text-muted-foreground">Campaign: {post.campaign}</p>}
        <div className="flex flex-wrap gap-2">
          {post.url && (
            <Button size="sm" variant="outline" asChild>
              <a href={post.url} target="_blank" rel="noreferrer">
                View post <ArrowUpRightIcon />
              </a>
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild>
            <a href={socialclawHref("calendar_post", "/dashboard?tab=calendar")} target="_blank" rel="noreferrer">
              Open in SocialClaw <ArrowUpRightIcon />
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
