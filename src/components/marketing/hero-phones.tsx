"use client"

import { BioPage } from "@/components/bio/bio-page"
import { EscapeScreen } from "@/components/escape/escape-screen"
import { planEscape } from "@/lib/escape"
import { backgroundCss, PRESETS } from "@/lib/themes"

const { name: _n, ...theme } = PRESETS.find((p) => p.preset === "sunset")!

const page = {
  displayName: "Maya Chen",
  bio: "Creator systems, short-form video and the tools behind them.",
  avatar: null,
  theme,
  showBranding: true,
  sensitive: false,
}

const links = [
  { id: "1", kind: "link" as const, title: "Content Systems: the full course", url: "https://example.com", platform: null, thumbnail: "🎓", highlight: "pulse" as const },
  { id: "2", kind: "link" as const, title: "Free Notion content planner", url: "https://example.com", platform: null, thumbnail: "🎁", highlight: "none" as const },
  { id: "3", kind: "link" as const, title: "Watch: how I plan 30 videos in a day", url: "https://youtube.com", platform: null, thumbnail: null, highlight: "none" as const },
  { id: "4", kind: "link" as const, title: "Book a strategy call", url: "https://example.com", platform: null, thumbnail: "📅", highlight: "none" as const },
  ...["instagram", "tiktok", "youtube", "x"].map((p) => ({ id: p, kind: "social" as const, title: "", url: `https://${p}.com`, platform: p, thumbnail: null, highlight: "none" as const })),
]

function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="relative aspect-[9/19] w-[260px] overflow-hidden rounded-[2.4rem] border-[9px] border-neutral-900 bg-neutral-900 shadow-2xl sm:w-[280px] dark:border-neutral-700">
        <div className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-neutral-900 dark:bg-neutral-700" />
        <div className="pointer-events-none h-full overflow-hidden rounded-[1.9rem]">
          <div className="flex min-h-[140%] w-full *:min-w-0" style={{ zoom: 0.72 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroPhones() {
  const plan = planEscape("TikTok", "ios", () => "https://linkcliq.com/maya?lc_x=1")!
  return (
    <div className="relative mx-auto flex w-full max-w-xl items-start justify-center">
      <Phone className="relative z-10 -rotate-3">
        <BioPage page={page} links={links} mode="preview" className="flex-1" />
      </Phone>
      <Phone className="relative -ml-16 mt-14 hidden rotate-3 sm:block">
        <div className="w-full min-w-0 flex-1 [&>div]:min-h-full">
          <EscapeScreen
            mode="guide"
            plan={plan}
            copyUrl="https://linkcliq.com/maya"
            stayHref="#"
            brand={{ displayName: "Maya Chen", avatar: null, background: backgroundCss(theme), text: theme.text }}
          />
        </div>
      </Phone>
    </div>
  )
}
