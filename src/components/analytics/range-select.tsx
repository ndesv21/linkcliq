"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const OPTIONS = [
  { value: "24h", short: "24h", label: "Last 24 hours" },
  { value: "7d", short: "7d", label: "Last 7 days" },
  { value: "30d", short: "30d", label: "Last 30 days" },
  { value: "90d", short: "90d", label: "Last 90 days" },
  { value: "12m", short: "12m", label: "Last 12 months" },
]

export function RangeSelect({ value }: { value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  function set(v: string) {
    if (!v) return
    const next = new URLSearchParams(params)
    next.set("range", v)
    startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }))
  }

  return (
    <div className="flex items-center gap-2">
      {pending && <Spinner className="text-muted-foreground" />}
      <ToggleGroup type="single" variant="outline" size="sm" value={value} onValueChange={set} className="hidden @[640px]/main:flex">
        {OPTIONS.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value} className="px-3" aria-label={o.label}>
            {o.short}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Select value={value} onValueChange={set}>
        <SelectTrigger size="sm" className="w-36 @[640px]/main:hidden" aria-label="Date range">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
