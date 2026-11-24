import { cn } from "@/lib/utils"
import { fmtNumber } from "@/lib/format"

export type BarRow = { key: string; label: React.ReactNode; value: number; secondary?: React.ReactNode }

export function BarList({
  rows,
  valueLabel,
  secondaryLabel,
  className,
  empty = "No data yet",
}: {
  rows: BarRow[]
  valueLabel: string
  secondaryLabel?: string
  className?: string
  empty?: string
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
  return (
    <div className={cn("grid gap-1", className)}>
      <div className="flex items-center justify-between px-2 pb-1 text-xs text-muted-foreground">
        <span />
        <span className="flex gap-6">
          {secondaryLabel && <span className="w-12 text-right">{secondaryLabel}</span>}
          <span className="w-12 text-right">{valueLabel}</span>
        </span>
      </div>
      {rows.map((r) => (
        <div key={r.key} className="group relative flex h-9 items-center justify-between gap-3 rounded-md px-2 text-sm hover:bg-muted/60">
          <div
            className="absolute inset-y-1 left-0 rounded-[4px] bg-chart-1/15 transition-[width] dark:bg-chart-1/25"
            style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
            aria-hidden
          />
          <span className="relative flex min-w-0 items-center gap-2 truncate">{r.label}</span>
          <span className="relative flex shrink-0 gap-6 tabular-nums">
            {r.secondary !== undefined && <span className="w-12 text-right text-muted-foreground">{r.secondary}</span>}
            <span className="w-12 text-right font-medium">{fmtNumber(r.value)}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
