import Link from "next/link"
import { ArrowRightIcon, ShieldAlertIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BreakdownRow } from "@/lib/analytics"
import { fmtNumber, fmtPercent } from "@/lib/format"

export function InAppCard({ rows, escapeOn }: { rows: BreakdownRow[]; escapeOn: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          In-app browsers
          <Badge variant={escapeOn ? "secondary" : "outline"}>{escapeOn ? "Escape on" : "Escape off"}</Badge>
        </CardTitle>
        <CardDescription>Visitors stuck in TikTok, Instagram and Facebook webviews, and how many you sent to a real browser</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/escape">
              Configure <ArrowRightIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <ShieldAlertIcon className="size-5" />
            No in-app traffic in this period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Escaped</TableHead>
                <TableHead className="w-[38%]">Escape rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const rate = r.views ? Math.min(1, r.escapes / r.views) : 0
                return (
                  <TableRow key={r.label}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(r.views)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(r.escapes)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={rate * 100} className="h-1.5 [&>[data-slot=progress-indicator]]:bg-chart-3" />
                        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{fmtPercent(rate, 0)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
