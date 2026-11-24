"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LinkFilter({ value, links }: { value: string; links: { id: string; title: string }[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const next = new URLSearchParams(params)
        if (v === "all") next.delete("link")
        else next.set("link", v)
        router.replace(`${pathname}?${next}`, { scroll: false })
      }}
    >
      <SelectTrigger size="sm" className="w-56" aria-label="Filter by link">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="all">All links</SelectItem>
        <SelectSeparator />
        {links.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            <span className="truncate">{l.title}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
