import { GlobeIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPlatform } from "@/lib/platforms"

const LINKEDIN_PATH =
  "M3 1h18a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zM7 5.3a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5zM5.5 9.8v9.2h3V9.8zM10.5 9.8V19h3v-4.6c0-1.3.6-2.2 1.9-2.2 1.2 0 1.6.9 1.6 2.2V19h3v-5c0-2.7-1-4.4-3.6-4.4-1.4 0-2.5.6-3 1.6V9.8z"

export function PlatformIcon({
  platform,
  className,
  colored = false,
}: {
  platform: string | null | undefined
  className?: string
  colored?: boolean
}) {
  const meta = getPlatform(platform)
  if (!meta) return <GlobeIcon className={cn("size-4", className)} aria-hidden />
  const fill = colored ? meta.color : "currentColor"
  const d = meta.path ?? LINKEDIN_PATH
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} role="img" aria-label={meta.name}>
      <path d={d} fill={fill} fillRule={meta.path ? undefined : "evenodd"} />
    </svg>
  )
}
