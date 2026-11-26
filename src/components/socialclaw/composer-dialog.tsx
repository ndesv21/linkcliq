"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowUpRightIcon, CalendarIcon, ImageIcon, SendIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"
import { PlatformIcon } from "@/components/platform-icon"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getSocialClawAccounts, scheduleSocialPost } from "@/lib/actions/socialclaw"
import { socialclawHref } from "@/lib/env"
import type { SocialClawAccount } from "@/lib/socialclaw"
import { PROVIDER_PLATFORM } from "./provider"
import { SocialClawMark } from "./socialclaw-mark"

const MEDIA_REQUIRED = new Set(["instagram", "instagram_business", "tiktok", "youtube", "pinterest", "snapchat"])
const TITLE_REQUIRED = new Set(["reddit", "youtube", "wordpress", "pinterest"])
const CHAR_LIMIT: Record<string, number> = { x: 280, bluesky: 300, threads: 500, pinterest: 500 }

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "disconnected" }
  | { status: "ready"; accounts: SocialClawAccount[] }

export function ComposerDialog({ defaultText, children }: { defaultText: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>({ status: "loading" })
  const [selected, setSelected] = useState<string[]>([])
  const [text, setText] = useState(defaultText)
  const [title, setTitle] = useState("")
  const [media, setMedia] = useState("")
  const [when, setWhen] = useState<"now" | "later">("now")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("09:00")
  const [pending, startTransition] = useTransition()

  const request = useRef(0)

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) return
    setText(defaultText)
    setState({ status: "loading" })
    const id = ++request.current
    getSocialClawAccounts().then((res) => {
      if (id !== request.current) return
      if (!res.ok) setState({ status: "error", error: res.error })
      else if (!res.data.connected) setState({ status: "disconnected" })
      else setState({ status: "ready", accounts: res.data.accounts })
    })
  }

  const accounts = useMemo(() => (state.status === "ready" ? state.accounts : []), [state])
  const chosen = useMemo(() => accounts.filter((a) => selected.includes(a.id)), [accounts, selected])
  const needsMedia = chosen.some((a) => MEDIA_REQUIRED.has(a.provider))
  const needsTitle = chosen.some((a) => TITLE_REQUIRED.has(a.provider))
  const limit = Math.min(...chosen.map((a) => CHAR_LIMIT[a.provider] ?? 5000), 5000)
  const over = text.length > limit

  function submit() {
    let publishAt = new Date()
    if (when === "later") {
      if (!date) return toast.error("Pick a date")
      const [h, m] = time.split(":").map(Number)
      publishAt = new Date(date)
      publishAt.setHours(h, m, 0, 0)
      if (publishAt.getTime() < Date.now()) return toast.error("Pick a time in the future")
    }
    startTransition(async () => {
      const res = await scheduleSocialPost({
        accounts: chosen.map((a) => ({ handle: a.handle, provider: a.provider })),
        text,
        title: title || undefined,
        mediaUrl: media || undefined,
        publishAt: publishAt.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      if (!res.ok) {
        toast.error("SocialClaw rejected the post", { description: res.error })
        return
      }
      toast.success(when === "now" ? `Publishing to ${res.data.count} account${res.data.count === 1 ? "" : "s"}` : `Scheduled ${res.data.count} post${res.data.count === 1 ? "" : "s"}`, {
        description: when === "later" ? format(publishAt, "EEE d MMM, HH:mm") : "Track delivery in your SocialClaw dashboard.",
        action: { label: "Open", onClick: () => window.open(socialclawHref("composer_success", "/dashboard"), "_blank") },
      })
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SocialClawMark className="size-5 text-foreground [--sc-ink:var(--background)]" />
            Post with SocialClaw
          </DialogTitle>
          <DialogDescription>Publish now or schedule it. Delivery runs on your SocialClaw workspace.</DialogDescription>
        </DialogHeader>

        {state.status === "loading" && (
          <div className="grid gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-9 w-1/2" />
          </div>
        )}

        {state.status === "error" && (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>Could not reach SocialClaw</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {state.status === "disconnected" && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SendIcon />
              </EmptyMedia>
              <EmptyTitle>Connect SocialClaw to post</EmptyTitle>
              <EmptyDescription>Paste a SocialClaw API key once and post your links to 11 networks from here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center">
              <Button asChild>
                <Link href="/dashboard/calendar?settings=1" onClick={() => setOpen(false)}>
                  Add API key
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={socialclawHref("composer_empty")} target="_blank" rel="noreferrer">
                  Get a key <ArrowUpRightIcon />
                </a>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {state.status === "ready" && (
          <FieldGroup>
            <Field>
              <FieldLabel>Accounts</FieldLabel>
              {accounts.length === 0 ? (
                <FieldDescription>
                  No connected accounts yet.{" "}
                  <a className="underline" href={socialclawHref("composer_no_accounts", "/dashboard")} target="_blank" rel="noreferrer">
                    Connect one in SocialClaw
                  </a>
                  .
                </FieldDescription>
              ) : (
                <ToggleGroup type="multiple" variant="outline" size="sm" value={selected} onValueChange={setSelected} className="flex-wrap justify-start">
                  {accounts.map((a) => (
                    <ToggleGroupItem key={a.id} value={a.id} className="gap-1.5 data-[state=on]:border-primary">
                      <PlatformIcon platform={PROVIDER_PLATFORM[a.provider]} className="size-3.5" />
                      <span className="max-w-36 truncate">{a.displayName || a.handle}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            </Field>
            {needsTitle && (
              <Field>
                <FieldLabel htmlFor="sc-title">Title</FieldLabel>
                <Input id="sc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Required by Reddit, YouTube and Pinterest" />
              </Field>
            )}
            <Field data-invalid={over || undefined}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="sc-text">Post</FieldLabel>
                <span className={over ? "text-xs text-destructive" : "text-xs text-muted-foreground tabular-nums"}>
                  {text.length}
                  {chosen.length > 0 && limit < 5000 ? ` / ${limit}` : ""}
                </span>
              </div>
              <Textarea id="sc-text" value={text} onChange={(e) => setText(e.target.value)} rows={5} aria-invalid={over || undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor="sc-media">
                Image or video URL {needsMedia ? <Badge variant="secondary">Required</Badge> : <span className="text-muted-foreground">(optional)</span>}
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <ImageIcon />
                </InputGroupAddon>
                <InputGroupInput id="sc-media" value={media} onChange={(e) => setMedia(e.target.value)} placeholder="https://..." />
              </InputGroup>
              {needsMedia && <FieldDescription>Instagram, TikTok, YouTube and Pinterest only publish with media.</FieldDescription>}
            </Field>
            <Field>
              <FieldLabel>When</FieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup type="single" variant="outline" size="sm" value={when} onValueChange={(v) => v && setWhen(v as "now" | "later")}>
                  <ToggleGroupItem value="now">Now</ToggleGroupItem>
                  <ToggleGroupItem value="later">Schedule</ToggleGroupItem>
                </ToggleGroup>
                {when === "later" && (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="min-w-36 justify-start font-normal">
                          <CalendarIcon />
                          {date ? format(date, "EEE d MMM") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }} />
                      </PopoverContent>
                    </Popover>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-7 w-28" />
                  </>
                )}
              </div>
            </Field>
          </FieldGroup>
        )}

        <DialogFooter className="items-center sm:justify-between">
          <a href={socialclawHref("composer_footer")} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
            Powered by SocialClaw
          </a>
          {state.status === "ready" && (
            <Button onClick={submit} disabled={pending || chosen.length === 0 || over || (needsMedia && !media) || (needsTitle && !title)}>
              {pending ? <Spinner /> : <SendIcon />}
              {when === "now" ? "Post now" : "Schedule"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
