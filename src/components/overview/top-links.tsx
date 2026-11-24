import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LinkStat } from "@/lib/analytics"
import { fmtNumber, fmtPercent } from "@/lib/format"
import { getPlatform, platformFromUrl } from "@/lib/platforms"

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function TopLinks({ stats, views, limit = 6 }: { stats: LinkStat[]; views: number; limit?: number }) {
  const rows = stats.slice(0, limit)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top links</CardTitle>
        <CardDescription>Clicks and click-through per link</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/links">
              Manage <ArrowRightIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No clicks in this period.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="hidden text-right @lg/card:table-cell">In-app</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const platform = s.platform ?? platformFromUrl(s.url)
                const title = s.kind === "social" ? getPlatform(platform)?.name ?? "Social icon" : s.title || host(s.url)
                return (
                  <TableRow key={s.id}>
                    <TableCell className="max-w-0 w-full">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                          <PlatformIcon platform={platform} className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{title}</p>
                          <p className="truncate text-xs text-muted-foreground">{host(s.url)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(s.clicks)}</TableCell>
                    <TableCell className="text-right tabular-nums">{views ? fmtPercent(s.clicks / views) : "0%"}</TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground @lg/card:table-cell">
                      {s.clicks ? fmtPercent(s.inAppClicks / s.clicks, 0) : "0%"}
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
