"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUpRightIcon, CompassIcon, CopyIcon, ExternalLinkIcon, LockIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import type { EscapePlan } from "@/lib/escape"
import { cn } from "@/lib/utils"

const GRACE_MS = 1400
const DRIFT_MS = 900

function useLeaveGuard() {
  const left = useRef(false)
  const timers = useRef<number[]>([])

  const clear = useCallback(() => {
    timers.current.forEach((t) => {
      window.clearTimeout(t)
      window.clearInterval(t)
    })
    timers.current = []
  }, [])

  const watch = useCallback(
    (onStillHere: () => void) => {
      clear()
      left.current = false
      let last = Date.now()
      const drift = window.setInterval(() => {
        const now = Date.now()
        if (now - last > DRIFT_MS) left.current = true
        last = now
      }, 250)
      const done = window.setTimeout(() => {
        window.clearInterval(drift)
        if (!left.current && document.visibilityState === "visible" && document.hasFocus()) onStillHere()
      }, GRACE_MS)
      timers.current.push(drift, done)
    },
    [clear]
  )

  useEffect(() => {
    const mark = () => {
      left.current = true
    }
    const onVis = () => {
      if (document.visibilityState === "hidden") left.current = true
    }
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("pagehide", mark)
    window.addEventListener("blur", mark)
    return () => {
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("pagehide", mark)
      window.removeEventListener("blur", mark)
      clear()
    }
  }, [clear])

  return watch
}

export type EscapeBrand = { displayName: string; avatar: string | null; background: string; text: string }

export function EscapeScreen({
  mode,
  plan,
  copyUrl,
  stayHref,
  brand,
  destinationHost,
}: {
  mode: "auto" | "guide"
  plan: EscapePlan
  copyUrl: string
  stayHref: string
  brand: EscapeBrand
  destinationHost?: string
}) {
  const autoRuns = mode === "auto" && plan.auto !== null
  const [phase, setPhase] = useState<"trying" | "guide">(autoRuns ? "trying" : "guide")
  const [copied, setCopied] = useState(false)
  const [tapped, setTapped] = useState(false)
  const watch = useLeaveGuard()
  const browser = plan.os === "ios" ? "Safari" : "your browser"

  useEffect(() => {
    if (!autoRuns || !plan.auto) return
    if (plan.auto.kind === "script") window.location.href = plan.auto.href
    watch(() => setPhase("guide"))
    const back = () => {
      if (document.visibilityState === "visible") setPhase("guide")
    }
    document.addEventListener("visibilitychange", back)
    return () => document.removeEventListener("visibilitychange", back)
  }, [autoRuns, plan.auto, watch])

  function tap() {
    if (!plan.tap) return
    window.location.href = plan.tap.href
    setTapped(false)
    watch(() => setTapped(true))
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyUrl)
      setCopied(true)
    } catch {
      const input = document.getElementById("lc-escape-url") as HTMLInputElement | null
      input?.select()
    }
  }

  const title = destinationHost ? `Continue to ${destinationHost} in ${browser}` : `Open ${brand.displayName}'s page in ${browser}`

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-16" style={{ background: brand.background, color: brand.text }}>
      {phase === "guide" && <MenuPointer plan={plan} color={brand.text} />}

      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="items-center text-center">
          <Avatar className="mx-auto size-14">
            {brand.avatar && <AvatarImage src={brand.avatar} alt="" className="object-cover" />}
            <AvatarFallback className="text-lg font-semibold">{brand.displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-2 text-lg leading-snug">
            {phase === "trying" ? `Opening ${browser}…` : title}
          </CardTitle>
          <CardDescription>
            {phase === "trying" ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> One moment
              </span>
            ) : (
              <>
                {plan.app}&apos;s built-in browser can&apos;t use your saved passwords or cards
                {plan.os === "ios" ? " or Apple Pay" : ""}. {browser === "Safari" ? "Safari" : "Your browser"} can.
              </>
            )}
          </CardDescription>
        </CardHeader>

        {phase === "trying" ? (
          <CardFooter className="justify-center">
            <Button variant="link" size="sm" onClick={() => setPhase("guide")}>
              Not opening?
            </Button>
          </CardFooter>
        ) : (
          <>
            <CardContent className="grid gap-4">
              {plan.tap && (
                <Button size="lg" className="h-11 w-full text-base" onClick={tap}>
                  {plan.os === "ios" ? <CompassIcon /> : <ExternalLinkIcon />}
                  Open in {plan.os === "ios" ? "Safari" : "browser"}
                </Button>
              )}
              {tapped && <p className="text-center text-xs text-muted-foreground">Still here? Use the menu instead:</p>}
              <ItemGroup className="gap-2">
                <Item variant="muted" size="sm">
                  <ItemMedia variant="icon" className="font-semibold">1</ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex-wrap">
                      Tap <MenuGlyph plan={plan} /> {plan.guide.position === "top-right" ? "at the top right" : "at the bottom right"}
                    </ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" size="sm">
                  <ItemMedia variant="icon" className="font-semibold">2</ItemMedia>
                  <ItemContent>
                    <ItemTitle>Choose &ldquo;{plan.guide.action}&rdquo;</ItemTitle>
                  </ItemContent>
                </Item>
              </ItemGroup>
              <div className="grid gap-1.5">
                <p className="text-xs text-muted-foreground">No menu? Copy the link and paste it into {plan.os === "ios" ? "Safari" : "Chrome"}.</p>
                <InputGroup>
                  <InputGroupAddon>
                    <LockIcon />
                  </InputGroupAddon>
                  <InputGroupInput id="lc-escape-url" readOnly value={copyUrl} onFocus={(e) => e.currentTarget.select()} className="text-xs" />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton size="xs" onClick={copy}>
                      <CopyIcon /> {copied ? "Copied" : "Copy"}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="link" size="sm" className="text-muted-foreground" asChild>
                <a href={stayHref}>Continue in {plan.app} anyway</a>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

function MenuGlyph({ plan }: { plan: EscapePlan }) {
  if (plan.guide.menu === "safari") return <CompassIcon className="inline size-4" aria-label="the Safari icon" />
  return <Kbd className="text-sm">{plan.guide.menu === "kebab" ? "⋮" : "•••"}</Kbd>
}

function MenuPointer({ plan, color }: { plan: EscapePlan; color: string }) {
  const top = plan.guide.position === "top-right"
  return (
    <div
      aria-hidden
      className={cn("lc-nudge pointer-events-none absolute right-4 flex items-center gap-2", top ? "top-3" : "bottom-3")}
      style={{ color }}
    >
      <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-md">
        Tap {plan.guide.menu === "safari" ? "Safari" : plan.guide.menu === "kebab" ? "⋮" : "•••"}
      </span>
      <ArrowUpRightIcon className={cn("size-8 drop-shadow", !top && "rotate-90")} strokeWidth={2.5} />
    </div>
  )
}
