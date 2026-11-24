import { cn } from "@/lib/utils"

export function SocialClawMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 21.5c2.2-1.2 3.4-3.4 3.6-6.6M14.4 22.6c1.9-1.7 2.8-4.3 2.6-7.8M19.6 22.4c1.6-2 2.2-4.8 1.7-8.4"
        stroke="var(--sc-ink, #fff)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
