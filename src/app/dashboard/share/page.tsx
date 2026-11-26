import Link from "next/link"
import { ExternalLinkIcon, SendIcon } from "lucide-react"
import { CopyButton } from "@/components/dashboard/copy-button"
import { SiteHeader } from "@/components/dashboard/site-header"
import { PlatformIcon } from "@/components/platform-icon"
import { QrCard } from "@/components/share/qr-card"
import { ComposerDialog } from "@/components/socialclaw/composer-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPublicOrigin } from "@/lib/dashboard"
import { requirePage } from "@/lib/pages"

export const metadata = { title: "Share & QR" }

const CHANNELS = [
  { platform: "instagram", label: "Instagram bio", source: "instagram" },
  { platform: "tiktok", label: "TikTok bio", source: "tiktok" },
  { platform: "youtube", label: "YouTube channel and descriptions", source: "youtube" },
  { platform: "x", label: "X profile", source: "x" },
  { platform: "threads", label: "Threads bio", source: "threads" },
  { platform: "linkedin", label: "LinkedIn profile", source: "linkedin" },
  { platform: "facebook", label: "Facebook page", source: "facebook" },
  { platform: null, label: "Email signature and newsletter", source: "email" },
]

export default async function SharePage() {
  const { page } = await requirePage()
  const origin = await getPublicOrigin()
  const pageUrl = `${origin}/${page.handle}`

  return (
    <>
      <SiteHeader title="Share & QR" pageUrl={pageUrl} />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Your page</CardTitle>
            <CardDescription>Put this in every bio. It is short, it is yours and it tracks every click.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <InputGroup className="h-10 flex-1">
              <InputGroupInput readOnly value={pageUrl} className="font-medium" />
              <InputGroupAddon align="inline-end">
                <CopyButton value={pageUrl} variant="ghost" size="icon-sm" />
              </InputGroupAddon>
            </InputGroup>
            <Button variant="outline" className="h-10" asChild>
              <a href={pageUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon /> Open
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:gap-6 @5xl/main:grid-cols-2">
          <QrCard pageUrl={pageUrl} handle={page.handle} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SendIcon className="size-4 text-muted-foreground" />
                Announce it everywhere
              </CardTitle>
              <CardDescription>
                Post your page or a single link to X, Instagram, TikTok, LinkedIn, YouTube, Facebook, Threads, Pinterest, Reddit, Discord and Telegram at once, now or on a schedule. Posting runs through SocialClaw with your own API key.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>Works well for:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Launch day: the same announcement on every network at 9:00</li>
                <li>A weekly reminder of your newsletter or booking link</li>
                <li>Pushing a scheduled link the moment it goes live</li>
              </ul>
            </CardContent>
            <CardFooter className="gap-2 border-t">
              <ComposerDialog defaultText={`New page, all my links in one place: ${pageUrl}`}>
                <Button>
                  <SendIcon /> Compose post
                </Button>
              </ComposerDialog>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/calendar">Open Social Calendar</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>One link per channel</CardTitle>
            <CardDescription>
              TikTok and Instagram hide the referrer, so use the tagged version in each bio. Every click is then attributed to the right platform, and links with UTM tags turned on pass that platform to your shop&apos;s analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Where</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {CHANNELS.map((c) => {
                  const url = `${pageUrl}?utm_source=${c.source}`
                  return (
                    <TableRow key={c.source}>
                      <TableCell className="whitespace-nowrap">
                        <span className="flex items-center gap-2 font-medium">
                          <PlatformIcon platform={c.platform} className="size-4" />
                          {c.label}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0 w-full truncate font-mono text-xs text-muted-foreground">{url}</TableCell>
                      <TableCell>
                        <CopyButton value={url} variant="ghost" size="icon-sm" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
