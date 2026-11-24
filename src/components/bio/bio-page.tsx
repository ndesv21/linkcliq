"use client"

import { useState } from "react"
import { EyeOffIcon } from "lucide-react"
import { PlatformIcon } from "@/components/platform-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { LinkHighlight, LinkKind } from "@/lib/db/schema"
import { SITE_URL } from "@/lib/env"
import { platformFromUrl } from "@/lib/platforms"
import { backgroundCss, buttonCss, fontCss, type PageTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

const BADGE_HREF = `${SITE_URL}/?utm_source=badge&utm_medium=referral&utm_campaign=bio_page`

export type BioLink = {
  id: string
  kind: LinkKind
  title: string
  url: string
  platform: string | null
  thumbnail: string | null
  highlight: LinkHighlight
}

export type BioPageData = {
  displayName: string
  bio: string
  avatar: string | null
  theme: PageTheme
  showBranding: boolean
  sensitive: boolean
}

export function BioPage({
  page,
  links,
  mode,
  stay = false,
  source = null,
  reportHref = null,
  className,
}: {
  page: BioPageData
  links: BioLink[]
  mode: "live" | "preview"
  stay?: boolean
  source?: string | null
  reportHref?: string | null
  className?: string
}) {
  const [revealed, setRevealed] = useState(!page.sensitive || mode === "preview")
  const theme = page.theme

  const href = (l: BioLink) => {
    if (mode === "preview") return undefined
    const q = new URLSearchParams()
    if (source) q.set("s", source)
    if (stay) q.set("lc_stay", "1")
    const qs = q.toString()
    return qs ? `/go/${l.id}?${qs}` : `/go/${l.id}`
  }

  const socials = links.filter((l) => l.kind === "social" && l.url)
  const blocks = links.filter((l) => l.kind !== "social")
  const btn = buttonCss(theme)

  return (
    <div
      className={cn("relative min-h-full w-full", className)}
      style={{ background: backgroundCss(theme), color: theme.text, fontFamily: fontCss(theme) }}
    >
      <main className="mx-auto flex w-full max-w-[580px] flex-col items-center px-5 pt-14 pb-10">
        <Avatar className="size-24 shadow-lg ring-4 ring-white/20">
          {page.avatar && <AvatarImage src={page.avatar} alt={page.displayName} className="object-cover" />}
          <AvatarFallback className="text-2xl font-semibold" style={{ background: btn.background as string, color: theme.button.fg }}>
            {page.displayName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-center text-xl font-bold tracking-tight">{page.displayName}</h1>
        {page.bio && (
          <p className="mt-2 max-w-md text-center text-[15px] leading-relaxed whitespace-pre-line" style={{ color: theme.muted }}>
            {page.bio}
          </p>
        )}
        {socials.length > 0 && (
          <nav className="mt-5 flex flex-wrap items-center justify-center gap-1" aria-label="Social profiles">
            {socials.map((s) => (
              <a
                key={s.id}
                href={href(s)}
                aria-label={s.platform ?? "Social profile"}
                className="rounded-full p-2 transition-transform hover:scale-110"
                style={{ color: theme.text }}
              >
                <PlatformIcon platform={s.platform ?? platformFromUrl(s.url)} className="size-6" />
              </a>
            ))}
          </nav>
        )}

        {revealed ? (
          <div className="mt-7 flex w-full flex-col gap-3.5">
            {blocks.map((l) =>
              l.kind === "header" ? (
                <h2 key={l.id} className="mt-3 text-center text-sm font-semibold tracking-wide uppercase" style={{ color: theme.muted }}>
                  {l.title}
                </h2>
              ) : (
                <Button
                  key={l.id}
                  asChild
                  className={cn(
                    "relative h-auto min-h-14 w-full justify-center px-14 py-3.5 text-[15px] font-semibold whitespace-normal transition-transform hover:scale-[1.015] hover:opacity-95 active:scale-[0.99]",
                    l.highlight !== "none" && `lc-hl-${l.highlight}`
                  )}
                  style={btn}
                >
                  <a href={href(l)} rel="noopener">
                    <LinkThumb link={l} />
                    <span className="text-center leading-snug">{l.title || l.url}</span>
                  </a>
                </Button>
              )
            )}
          </div>
        ) : (
          <div className="mt-8 w-full rounded-2xl p-6 text-center" style={{ ...btn, boxShadow: undefined }}>
            <EyeOffIcon className="mx-auto mb-3 size-6" />
            <p className="font-semibold">Sensitive content</p>
            <p className="mt-1 text-sm opacity-80">This page may contain content that is not suitable for everyone.</p>
            <Button className="mt-4" variant="secondary" onClick={() => setRevealed(true)}>
              I am over 18, continue
            </Button>
          </div>
        )}

        {(page.showBranding || reportHref) && (
          <div className="mt-12 flex items-center gap-1 text-xs font-medium" style={{ color: theme.text }}>
            {page.showBranding && (
              <a
                href={mode === "live" ? BADGE_HREF : undefined}
                target="_blank"
                rel="noopener"
                className="rounded-full px-3 py-1.5 opacity-70 transition-opacity hover:opacity-100"
              >
                Made with LinkCliq
              </a>
            )}
            {reportHref && mode === "live" && (
              <a href={reportHref} className="rounded-full px-3 py-1.5 opacity-50 transition-opacity hover:opacity-100">
                Report
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function LinkThumb({ link }: { link: BioLink }) {
  const thumb = link.thumbnail
  const platform = link.platform ?? platformFromUrl(link.url)
  const box = "absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[inherit]"
  if (thumb?.startsWith("data:") || thumb?.startsWith("http")) {
    return (
      <span className={box} style={{ borderRadius: "min(10px, inherit)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt="" className="size-full object-cover" />
      </span>
    )
  }
  if (thumb) return <span className={cn(box, "text-xl")}>{thumb}</span>
  if (platform) {
    return (
      <span className={box}>
        <PlatformIcon platform={platform} className="size-5" />
      </span>
    )
  }
  return null
}
