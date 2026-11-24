import Link from "next/link"
import { ArrowUpRightIcon, CalendarClockIcon, CheckCircle2Icon, LayersIcon, SendIcon, TriangleAlertIcon } from "lucide-react"
import { SiteHeader } from "@/components/dashboard/site-header"
import { PlatformIcon } from "@/components/platform-icon"
import { ComposerDialog } from "@/components/socialclaw/composer-dialog"
import { ConnectForm, DisconnectButton } from "@/components/socialclaw/connect-form"
import { PROVIDER_PLATFORM, SOCIALCLAW_NETWORKS } from "@/components/socialclaw/provider"
import { SocialClawMark } from "@/components/socialclaw/socialclaw-mark"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { getPublicOrigin } from "@/lib/dashboard"
import { socialclawHref } from "@/lib/env"
import { requirePage } from "@/lib/pages"
import { getStoredKey, listAccounts, PROVIDER_LABEL, type SocialClawAccount } from "@/lib/socialclaw"

export const metadata = { title: "Integrations" }

export default async function IntegrationsPage() {
  const { user, page } = await requirePage()
  const [origin, stored] = await Promise.all([getPublicOrigin(), getStoredKey(user.id)])
  let accounts: SocialClawAccount[] = []
  let error: string | null = null
  if (stored) {
    try {
      accounts = await listAccounts(stored.key)
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not reach SocialClaw"
    }
  }
  const pageUrl = `${origin}/${page.handle}`

  return (
    <>
      <SiteHeader title="Integrations" pageUrl={pageUrl} />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <SocialClawMark className="size-7 text-foreground [--sc-ink:var(--background)]" />
              SocialClaw
              {stored && <Badge variant="secondary">Connected</Badge>}
            </CardTitle>
            <CardDescription>
              Schedule and publish posts about your links to 11 networks without leaving LinkCliq. SocialClaw handles the OAuth connections, media hosting and retries.
            </CardDescription>
            {stored && (
              <CardAction>
                <DisconnectButton />
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="grid gap-5">
            {!stored ? (
              <>
                <ItemGroup className="grid gap-3 @2xl/main:grid-cols-3">
                  {[
                    { icon: SendIcon, title: "Post from any link", text: "Every link card has a post button." },
                    { icon: CalendarClockIcon, title: "Schedule ahead", text: "Pick a time, SocialClaw publishes it." },
                    { icon: LayersIcon, title: "11 networks", text: "X, Instagram, TikTok, LinkedIn and more." },
                  ].map((f) => (
                    <Item key={f.title} variant="muted" className="items-start">
                      <ItemMedia variant="icon">
                        <f.icon />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{f.title}</ItemTitle>
                        <ItemDescription>{f.text}</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
                <ConnectForm />
              </>
            ) : error ? (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>SocialClaw did not accept the saved key</AlertTitle>
                <AlertDescription>{error}. Disconnect and paste a fresh key.</AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-3">
                <p className="text-sm text-muted-foreground">
                  {stored.workspace ? `Workspace ${stored.workspace}. ` : ""}
                  {accounts.length} connected account{accounts.length === 1 ? "" : "s"}.
                </p>
                {accounts.length === 0 ? (
                  <p className="text-sm">
                    No accounts yet.{" "}
                    <a href={socialclawHref("integrations_no_accounts", "/dashboard")} target="_blank" rel="noreferrer" className="underline">
                      Connect your socials in SocialClaw
                    </a>
                    .
                  </p>
                ) : (
                  <ItemGroup className="grid gap-2 @2xl/main:grid-cols-2">
                    {accounts.map((a) => (
                      <Item key={a.id} variant="outline" size="sm">
                        <ItemMedia variant="icon">
                          <PlatformIcon platform={PROVIDER_PLATFORM[a.provider]} colored />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{a.displayName || a.handle}</ItemTitle>
                          <ItemDescription>{PROVIDER_LABEL[a.provider] ?? a.provider}</ItemDescription>
                        </ItemContent>
                        <CheckCircle2Icon className="size-4 text-chart-3" />
                      </Item>
                    ))}
                  </ItemGroup>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-wrap gap-2 border-t">
            {stored ? (
              <ComposerDialog defaultText={`All my links in one place: ${pageUrl}`}>
                <Button>
                  <SendIcon /> Compose post
                </Button>
              </ComposerDialog>
            ) : (
              <Button asChild>
                <a href={socialclawHref("integrations_signup")} target="_blank" rel="noreferrer">
                  Create a free SocialClaw account <ArrowUpRightIcon />
                </a>
              </Button>
            )}
            <div className="ml-auto flex items-center gap-1.5 text-muted-foreground">
              {SOCIALCLAW_NETWORKS.map((p) => (
                <PlatformIcon key={p} platform={p} className="size-3.5" />
              ))}
            </div>
          </CardFooter>
        </Card>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Analytics and ad pixels</CardTitle>
            <CardDescription>Google Analytics 4 and Meta Pixel are set per page.</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings">Open settings</Link>
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </>
  )
}
