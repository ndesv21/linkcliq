"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  BatteryFullIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  CircleCheckIcon,
  CircleXIcon,
  CompassIcon,
  EllipsisIcon,
  HeartIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  LinkIcon,
  LockIcon,
  MessageCircleIcon,
  Music2Icon,
  PauseIcon,
  PlayIcon,
  RotateCwIcon,
  Share2Icon,
  SignalHighIcon,
  WifiIcon,
  XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SUNSET = "linear-gradient(160deg, #f97316, #db2777)"

const STEPS = [
  {
    label: "Tap the bio link",
    ms: 2800,
    without: "A viewer taps the link in your TikTok bio.",
    with: "A viewer taps the link in your TikTok bio.",
  },
  {
    label: "In-app browser",
    ms: 3600,
    without: "Your page opens inside TikTok's own browser, not Safari.",
    with: "LinkCliq spots TikTok's browser and offers a one-tap jump to Safari.",
  },
  {
    label: "Checkout",
    ms: 4000,
    without: "Checkout wants a sign-in and a card typed by hand. No Apple Pay.",
    with: "In Safari they're signed in, the card autofills and Apple Pay works.",
  },
  {
    label: "Result",
    ms: 3400,
    without: "Halfway through the card number, they swipe back to the feed.",
    with: "Two taps later, the course is paid for.",
  },
] as const

type Side = "without" | "with"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

export function EscapeStory() {
  const [step, setStep] = useState(0)
  const [run, setRun] = useState(0)
  const [choice, setChoice] = useState<boolean | null>(null)
  const [inView, setInView] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false)
  const wantsPlay = choice ?? !reducedMotion
  const playing = wantsPlay && inView

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  function go(next: number) {
    setStep(next)
    setRun((r) => r + 1)
  }

  return (
    <div
      ref={root}
      data-escape-story
      className={cn("mx-auto flex w-full max-w-3xl flex-col gap-8", !playing && "[&_.lc-anim]:[animation-play-state:paused]")}
    >
      <div className="flex items-start gap-3">
        <ol className="grid flex-1 grid-cols-4 gap-2 sm:gap-3">
          {STEPS.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === step ? "step" : undefined}
                className="w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="block h-1 overflow-hidden rounded-full bg-muted">
                  {i === step ? (
                    <span
                      key={run}
                      className="lc-anim lc-progress block h-full bg-primary"
                      style={{ animationDuration: `${s.ms}ms` }}
                      onAnimationEnd={() => go((step + 1) % STEPS.length)}
                    />
                  ) : (
                    <span className={cn("block h-full bg-primary", i < step ? "w-full" : "w-0")} />
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 block text-[11px] leading-tight font-medium sm:text-xs",
                    i === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <span className="hidden sm:inline">{i + 1}. </span>
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <Button
          variant="outline"
          size="icon-sm"
          className="-mt-1.5"
          aria-label={wantsPlay ? "Pause the demo" : "Play the demo"}
          onClick={() => setChoice(!wantsPlay)}
        >
          {wantsPlay ? <PauseIcon /> : <PlayIcon />}
        </Button>
      </div>

      <div className="grid grid-cols-2 justify-items-center gap-4 [--s:0.54] min-[400px]:[--s:0.6] sm:gap-8 sm:[--s:0.8] lg:[--s:1]">
        {(["without", "with"] as const).map((side) => (
          <figure key={side} className="flex flex-col items-center gap-4">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                side === "with" ? "border-chart-3/40 bg-chart-3/10" : "bg-background"
              )}
            >
              {side === "with" ? (
                <CircleCheckIcon className="size-3.5 text-chart-3" />
              ) : (
                <CircleXIcon className="size-3.5 text-destructive" />
              )}
              {side === "with" ? "With LinkCliq" : "Without LinkCliq"}
            </span>
            <Phone>
              <Screens side={side} step={step} run={run} />
            </Phone>
            <figcaption aria-live="polite" className="min-h-[3lh] max-w-[17rem] text-center text-xs text-pretty text-muted-foreground sm:text-sm">
              {STEPS[step][side]}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

/* The phone is drawn at 286 x 601 px and scaled with --s so both fit side by side on a phone. */
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(var(--s)*601px)] w-[calc(var(--s)*286px)]" aria-hidden>
      <div className="h-[601px] w-[286px] origin-top-left" style={{ transform: "scale(var(--s))" }}>
        <div className="relative size-full overflow-hidden rounded-[2.6rem] border-8 border-neutral-900 bg-neutral-900 shadow-2xl ring-1 ring-black/10 select-none dark:border-neutral-700 dark:ring-white/10">
          <div className="absolute top-2 left-1/2 z-30 h-[22px] w-[82px] -translate-x-1/2 rounded-full bg-black" />
          <div className="relative size-full overflow-hidden rounded-[2.1rem] bg-white font-sans">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Screens({ side, step, run }: { side: Side; step: number; run: number }) {
  const at = (n: number) => ({ show: step === n, run })
  return (
    <>
      <Screen {...at(0)}>
        <Profile tap={step === 0} run={run} />
      </Screen>
      {side === "without" ? (
        <>
          <Screen {...at(1)}>
            <InAppBrowser title="Maya Chen" domain="linkcliq.com">
              <MiniBio tap={step === 1} run={run} />
            </InAppBrowser>
          </Screen>
          <Screen {...at(2)}>
            <InAppBrowser title="Checkout" domain="shop.example.com">
              <Checkout kind="stuck" active={step === 2} run={run} />
            </InAppBrowser>
          </Screen>
          <Screen {...at(3)}>
            <Feed />
          </Screen>
        </>
      ) : (
        <>
          <Screen {...at(1)}>
            <InAppBrowser title="Maya Chen" domain="linkcliq.com">
              <MiniEscape tap={step === 1} run={run} />
            </InAppBrowser>
          </Screen>
          <Screen {...at(2)}>
            <Safari domain="shop.example.com">
              <Checkout kind="ready" active={step === 2} run={run} />
            </Safari>
          </Screen>
          <Screen {...at(3)}>
            <Safari domain="shop.example.com">
              <Paid />
            </Safari>
          </Screen>
        </>
      )}
    </>
  )
}

function Screen({ show, children }: { show: boolean; run: number; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col transition-opacity duration-500 ease-out motion-reduce:transition-none",
        show ? "z-10 opacity-100" : "opacity-0"
      )}
    >
      {children}
    </div>
  )
}

/** A finger tap: a ring that appears, presses and fades, `delay` ms into the step. */
function Tap({ delay, run }: { delay: number; run: number }) {
  return (
    <span
      key={run}
      className="lc-anim lc-tap pointer-events-none absolute top-1/2 left-1/2 z-20 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45 shadow-[0_0_0_2px_rgb(23_23_23/0.45),0_4px_14px_rgb(0_0_0/0.3)]"
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={cn("flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[13px] font-semibold", dark ? "text-white" : "text-neutral-900")}>
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <SignalHighIcon className="size-3.5" strokeWidth={3} />
        <WifiIcon className="size-3.5" strokeWidth={3} />
        <BatteryFullIcon className="size-4" strokeWidth={2.5} />
      </span>
    </div>
  )
}

const TILES = [
  "from-amber-400 to-rose-500",
  "from-sky-400 to-indigo-600",
  "from-emerald-400 to-teal-700",
  "from-fuchsia-500 to-purple-800",
  "from-orange-300 to-red-600",
  "from-cyan-300 to-blue-700",
  "from-lime-300 to-emerald-700",
  "from-pink-400 to-rose-700",
  "from-violet-400 to-indigo-800",
]
const PLAYS = ["48.1K", "12.4K", "203K", "9,812", "31.7K", "1.2M", "66.0K", "18.9K", "7,450"]

function Profile({ tap, run }: { tap: boolean; run: number }) {
  return (
    <div className="flex flex-1 flex-col bg-neutral-950 text-white">
      <StatusBar dark />
      <div className="flex h-9 items-center justify-between px-3">
        <ChevronLeftIcon className="size-5" />
        <span className="text-[14px] font-semibold">Maya Chen</span>
        <EllipsisIcon className="size-5" />
      </div>
      <div className="flex flex-col items-center px-4 pt-2">
        <span className="flex size-[72px] items-center justify-center rounded-full text-[28px] font-semibold" style={{ background: SUNSET }}>
          M
        </span>
        <span className="mt-2 text-[13px] font-medium">@mayamakes</span>
        <div className="mt-3 flex gap-5 text-center">
          {[
            ["214", "Following"],
            ["48.2K", "Followers"],
            ["1.1M", "Likes"],
          ].map(([n, l]) => (
            <span key={l} className="flex flex-col">
              <span className="text-[14px] font-bold">{n}</span>
              <span className="text-[10px] text-white/60">{l}</span>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-1.5">
          <span className="flex h-8 w-28 items-center justify-center rounded-md bg-[#fe2c55] text-[13px] font-semibold">Follow</span>
          <span className="flex h-8 w-20 items-center justify-center rounded-md bg-white/12 text-[13px] font-semibold">Message</span>
        </div>
        <p className="mt-3 text-center text-[12px] leading-snug">Creator systems and short-form video 🎬</p>
        <span className="relative mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold">
          <LinkIcon className="size-3" strokeWidth={2.5} />
          linkcliq.com/maya
          {tap && <Tap delay={1300} run={run} />}
        </span>
      </div>
      <div className="mt-3 flex border-b border-white/10">
        <span className="flex flex-1 justify-center border-b-2 border-white pb-2">
          <LayoutGridIcon className="size-4" />
        </span>
        <span className="flex flex-1 justify-center pb-2 text-white/40">
          <HeartIcon className="size-4" />
        </span>
      </div>
      <div className="grid flex-1 grid-cols-3 content-start gap-px">
        {TILES.map((t, i) => (
          <span key={t} className={cn("relative aspect-[3/4] bg-gradient-to-br", t)}>
            <span className="absolute bottom-1 left-1.5 flex items-center gap-0.5 text-[10px] font-semibold drop-shadow">
              <PlayIcon className="size-2.5 fill-current" /> {PLAYS[i]}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

function InAppBrowser({ title, domain, children }: { title: string; domain: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <StatusBar />
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-200 px-3 text-neutral-900">
        <XIcon className="size-5" />
        <span className="flex min-w-0 flex-1 flex-col items-center leading-tight">
          <span className="truncate text-[12px] font-semibold">{title}</span>
          <span className="flex items-center gap-0.5 text-[10px] text-neutral-500">
            <LockIcon className="size-2.5" /> {domain}
          </span>
        </span>
        <EllipsisIcon className="size-5" />
      </div>
      <div className="relative flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}

function Safari({ domain, children }: { domain: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <StatusBar />
      <div className="relative flex flex-1 flex-col overflow-hidden">{children}</div>
      <div className="shrink-0 border-t border-neutral-200 bg-neutral-50 px-3 pt-2 pb-5 text-neutral-900">
        <div className="flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-[12px] shadow-sm ring-1 ring-neutral-200">
          <span className="text-[11px] font-semibold">AA</span>
          <span className="flex flex-1 items-center justify-center gap-1 font-medium">
            <LockIcon className="size-3" /> {domain}
          </span>
          <RotateCwIcon className="size-3.5" />
        </div>
        <div className="mt-2 flex items-center justify-between px-2 text-[#0a84ff]">
          <ChevronLeftIcon className="size-5" />
          <ChevronLeftIcon className="size-5 rotate-180 opacity-40" />
          <Share2Icon className="size-4" />
          <BookmarkIcon className="size-4" />
          <CompassIcon className="size-4" />
        </div>
      </div>
    </div>
  )
}

const BIO_LINKS = [
  ["🎓", "Content Systems course"],
  ["🎁", "Free content planner"],
  ["▶️", "How I plan 30 videos"],
  ["📅", "Book a strategy call"],
]

function MiniBio({ tap, run }: { tap: boolean; run: number }) {
  return (
    <div className="flex flex-1 flex-col items-center px-5 pt-7 text-white" style={{ background: SUNSET }}>
      <span className="flex size-16 items-center justify-center rounded-full bg-white/20 text-[24px] font-semibold ring-2 ring-white/40">M</span>
      <span className="mt-2.5 text-[16px] font-semibold">Maya Chen</span>
      <span className="mt-1 text-center text-[11px] text-orange-100">Creator systems, short-form video and the tools behind them.</span>
      <div className="mt-5 flex w-full flex-col gap-2.5">
        {BIO_LINKS.map(([icon, text], i) => (
          <span
            key={text}
            className="relative flex h-10 items-center gap-2 rounded-full bg-white/18 px-3 text-[12px] font-medium ring-1 ring-white/30"
          >
            <span>{icon}</span>
            <span className="flex-1 truncate text-center">{text}</span>
            <span className="w-4" />
            {i === 0 && tap && <Tap delay={1700} run={run} />}
          </span>
        ))}
      </div>
    </div>
  )
}

function MiniEscape({ tap, run }: { tap: boolean; run: number }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 text-white" style={{ background: SUNSET }}>
      <span className="lc-nudge absolute top-2 right-3 flex items-center gap-1">
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-900 shadow">Tap •••</span>
      </span>
      <div className="w-full rounded-2xl bg-white p-4 text-center text-neutral-900 shadow-2xl">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-neutral-100 text-[17px] font-semibold">M</span>
        <p className="mt-2 text-[14px] leading-snug font-semibold">Open Maya Chen&apos;s page in Safari</p>
        <p className="mt-1 text-[11px] leading-snug text-neutral-500">
          TikTok&apos;s built-in browser can&apos;t use your saved passwords or cards or Apple Pay. Safari can.
        </p>
        <span className="relative mt-3 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 text-[13px] font-semibold text-white">
          <CompassIcon className="size-4" /> Open in Safari
          {tap && <Tap delay={1800} run={run} />}
        </span>
        <div className="mt-3 flex flex-col gap-1.5 text-left text-[11px]">
          <span className="flex items-center gap-2 rounded-md bg-neutral-100 px-2 py-1.5">
            <span className="font-semibold">1</span> Tap <span className="rounded border bg-white px-1 text-[10px]">•••</span> at the top right
          </span>
          <span className="flex items-center gap-2 rounded-md bg-neutral-100 px-2 py-1.5">
            <span className="font-semibold">2</span> Choose &ldquo;Open in browser&rdquo;
          </span>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <span className="text-[10px] font-medium text-neutral-500">{label}</span>
      <div className="mt-1 flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 text-[12px]">{children}</div>
    </div>
  )
}

function Checkout({ kind, active, run }: { kind: "stuck" | "ready"; active: boolean; run: number }) {
  return (
    <div className="flex flex-1 flex-col bg-white px-4 pt-4 text-neutral-900">
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-2.5">
        <span className="flex size-10 items-center justify-center rounded-lg text-[18px]" style={{ background: SUNSET }}>
          🎓
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold">Content Systems</span>
          <span className="block text-[10px] text-neutral-500">Full course, lifetime access</span>
        </span>
        <span className="text-[13px] font-semibold">$49</span>
      </div>

      {kind === "ready" ? (
        <>
          <span className="relative mt-4 flex h-10 items-center justify-center rounded-lg bg-black text-[13px] font-semibold text-white">
            Buy with Apple Pay
            {active && <Tap delay={2300} run={run} />}
          </span>
          <span className="my-3 flex items-center gap-2 text-[10px] text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200" /> or pay with card <span className="h-px flex-1 bg-neutral-200" />
          </span>
          <Field label="Email">
            <span className="flex-1">sam@example.com</span>
            <span className="rounded-full bg-emerald-50 px-1.5 text-[9px] font-semibold text-emerald-700">Signed in</span>
          </Field>
          <Field label="Card" className="mt-2.5">
            <span className="flex-1 font-mono">Visa •••• 4242</span>
            <span className="flex items-center gap-0.5 rounded-full bg-sky-50 px-1.5 text-[9px] font-semibold text-sky-700">
              <KeyRoundIcon className="size-2.5" /> Autofilled
            </span>
          </Field>
          <span className="mt-4 flex h-10 items-center justify-center rounded-lg bg-[#db2777] text-[13px] font-semibold text-white">Pay $49</span>
        </>
      ) : (
        <>
          <p className="mt-4 text-[11px] text-neutral-500">
            Bought from us before? <span className="font-semibold text-[#db2777] underline">Sign in</span>
          </p>
          <Field label="Email" className="mt-2">
            <span className="text-neutral-400">you@example.com</span>
          </Field>
          <Field label="Card number" className="mt-2.5">
            <span className="flex flex-1 items-center font-mono">
              {active ? (
                <span key={run} className="lc-anim lc-type inline-block overflow-hidden whitespace-nowrap" style={{ animationDelay: "1200ms" }}>
                  4242 4242 42
                </span>
              ) : null}
              <span className="lc-caret ml-px inline-block h-3.5 w-px bg-sky-600" />
              {!active && <span className="text-neutral-400">1234 1234 1234 1234</span>}
            </span>
          </Field>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <Field label="Expiry">
              <span className="text-neutral-400">MM / YY</span>
            </Field>
            <Field label="CVC">
              <span className="text-neutral-400">123</span>
            </Field>
          </div>
          <span className="mt-4 flex h-10 items-center justify-center rounded-lg bg-neutral-200 text-[13px] font-semibold text-neutral-500">Pay $49</span>
        </>
      )}
    </div>
  )
}

const FEED_ACTIONS = [
  { Icon: HeartIcon, n: "1.2M" },
  { Icon: MessageCircleIcon, n: "8,431" },
  { Icon: BookmarkIcon, n: "52K" },
  { Icon: Share2Icon, n: "Share" },
]

function Feed() {
  return (
    <div className="relative flex flex-1 flex-col bg-gradient-to-b from-indigo-800 via-purple-900 to-neutral-950 text-white">
      <StatusBar dark />
      <div className="flex justify-center gap-4 text-[13px] font-semibold">
        <span className="text-white/60">Following</span>
        <span className="border-b-2 border-white pb-1">For You</span>
      </div>
      <div className="absolute inset-x-0 top-[34%] flex justify-center pr-10">
        <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-semibold ring-1 ring-red-400/60">
          <CircleXIcon className="size-4 text-red-400" /> Checkout abandoned
        </span>
      </div>
      <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-4 text-[10px] font-semibold">
        <span className="size-9 rounded-full bg-gradient-to-br from-sky-300 to-blue-700 ring-2 ring-white" />
        {FEED_ACTIONS.map(({ Icon, n }) => (
          <span key={n} className="flex flex-col items-center gap-0.5">
            <Icon className="size-6 fill-white/90" strokeWidth={1.5} />
            {n}
          </span>
        ))}
      </div>
      <div className="absolute bottom-6 left-3 right-16 text-[12px]">
        <p className="font-semibold">@another.creator</p>
        <p className="mt-0.5 text-white/90">wait for the ending 😂</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
          <Music2Icon className="size-3" /> original sound
        </p>
      </div>
    </div>
  )
}

function Paid() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-neutral-900">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
        <CircleCheckIcon className="size-9" strokeWidth={2} />
      </span>
      <p className="mt-4 text-[17px] font-semibold">Payment complete</p>
      <p className="mt-1 text-[12px] text-neutral-500">Content Systems · $49 · Apple Pay</p>
      <p className="mt-1 text-[11px] text-neutral-400">Receipt sent to sam@example.com</p>
      <span className="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-neutral-900 text-[13px] font-semibold text-white">Start the course</span>
    </div>
  )
}
