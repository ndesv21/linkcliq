import { CheckCircle2Icon, CircleDashedIcon, CircleIcon, CreditCardIcon, KeyRoundIcon, LogInIcon, WalletIcon } from "lucide-react"
import { RangeSelect } from "@/components/analytics/range-select"
import { SiteHeader } from "@/components/dashboard/site-header"
import { EscapePreview } from "@/components/escape/escape-preview"
import { EscapeSettings } from "@/components/escape/escape-settings"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBreakdown, getEscapeMethods, getSummary, parseRange } from "@/lib/analytics"
import { getPublicOrigin } from "@/lib/dashboard"
import { planEscape, type EscapePlan } from "@/lib/escape"
import { fmtNumber, fmtPercent } from "@/lib/format"
import type { InAppApp } from "@/lib/in-app"
import { requirePage } from "@/lib/pages"
import { backgroundCss } from "@/lib/themes"

export const metadata = { title: "Browser escape" }

const MATRIX_APPS: InAppApp[] = ["TikTok", "Instagram", "Facebook", "Messenger", "Threads", "LinkedIn", "Snapchat", "X", "WhatsApp", "Telegram", "LINE", "WeChat"]

const METHOD_LABEL: Record<string, string> = {
  ig_extbrowser: "Instagram external browser",
  threads_extbrowser: "Threads external browser",
  x_safari: "Open in Safari",
  intent: "Android intent",
  line_param: "LINE official parameter",
  copy: "Copied link",
  unknown: "Other",
}

function MethodCell({ plan }: { plan: EscapePlan | null }) {
  if (!plan) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <CheckCircle2Icon className="size-3.5 text-chart-3" /> Already the real browser
      </span>
    )
  }
  const auto = plan.auto ? METHOD_LABEL[plan.auto.method] : null
  const tap = plan.tap ? METHOD_LABEL[plan.tap.method] : null
  return (
    <div className="grid gap-0.5">
      <span className="inline-flex items-center gap-1.5">
        {plan.auto ? <CheckCircle2Icon className="size-3.5 text-chart-3" /> : plan.tap ? <CircleDashedIcon className="size-3.5 text-chart-4" /> : <CircleIcon className="size-3.5 text-muted-foreground" />}
        {auto ? `Automatic: ${auto}` : tap ? `One tap: ${tap}` : "Guide to the app menu"}
      </span>
      <span className="text-xs text-muted-foreground">
        Fallback: menu {plan.guide.menu === "kebab" ? "⋮" : plan.guide.menu === "dots" ? "•••" : "Safari icon"}, &ldquo;{plan.guide.action}&rdquo;
      </span>
    </div>
  )
}

const CONFIDENCE = { high: "Verified", medium: "Works, may prompt", low: "Best effort" } as const

export default async function EscapePage({ searchParams }: PageProps<"/dashboard/escape">) {
  const { page } = await requirePage()
  const range = parseRange((await searchParams).range)
  const [summary, byApp, methods, origin] = await Promise.all([
    getSummary(page.id, range),
    getBreakdown(page.id, range, "inApp", { limit: 12 }),
    getEscapeMethods(page.id, range),
    getPublicOrigin(),
  ])
  const pageUrl = `${origin}/${page.handle}`
  const s = summary.current
  const rate = s.inAppViews ? Math.min(1, s.escapes / s.inAppViews) : 0
  const methodTotal = methods.reduce((a, m) => a + m.count, 0)

  return (
    <>
      <SiteHeader title="Browser escape" pageUrl={pageUrl} />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl">Get visitors out of TikTok and Instagram&apos;s browser</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-relaxed">
              When someone taps your bio link inside TikTok, Instagram or Facebook, the page opens in the app&apos;s own webview. It is a separate browser, so checkout and sign-up flows break there. LinkCliq detects these browsers and sends visitors to Safari or Chrome before they reach your offer.
            </CardDescription>
            <CardAction>
              <EscapePreview brand={{ displayName: page.displayName, avatar: page.avatar, background: backgroundCss(page.theme), text: page.theme.text }} pageUrl={pageUrl} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ItemGroup className="grid gap-3 @3xl/main:grid-cols-4">
              {[
                { icon: LogInIcon, title: "Logged out everywhere", text: "No sessions from Safari or Chrome, so every store and course asks for a sign-in." },
                { icon: KeyRoundIcon, title: "No saved passwords", text: "Keychain and password managers rarely fill inside webviews." },
                { icon: CreditCardIcon, title: "No saved cards", text: "Visitors type the card number by hand on a phone, and many give up." },
                { icon: WalletIcon, title: "Apple Pay often off", text: "WebKit disables Apple Pay in webviews where the app injects scripts." },
              ].map((b) => (
                <Item key={b.title} variant="muted" className="items-start">
                  <ItemMedia variant="icon">
                    <b.icon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{b.title}</ItemTitle>
                    <ItemDescription className="line-clamp-none">{b.text}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>

        <EscapeSettings pageId={page.id} mode={page.escapeMode} skipAds={page.escapeSkipAds} />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Results</h2>
          <RangeSelect value={range} />
        </div>
        <div className="grid gap-4 @3xl/main:grid-cols-3">
          {[
            { label: "In-app views", value: fmtNumber(s.inAppViews), foot: `${fmtPercent(s.inAppShare, 0)} of all page views` },
            { label: "Sent to a real browser", value: fmtNumber(s.escapes), foot: "Counted when the visitor lands in Safari or Chrome" },
            { label: "Escape rate", value: fmtPercent(rate, 0), foot: "Escapes per in-app view" },
          ].map((k) => (
            <Card key={k.label}>
              <CardHeader>
                <CardDescription>{k.label}</CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">{k.value}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">{k.foot}</CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:gap-6 @4xl/main:grid-cols-5">
          <Card className="@4xl/main:col-span-3">
            <CardHeader>
              <CardTitle>By app</CardTitle>
              <CardDescription>Escape rate per in-app browser, measured on your own traffic</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead className="text-right">In-app views</TableHead>
                    <TableHead className="text-right">Escaped</TableHead>
                    <TableHead className="w-[36%]">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byApp.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        No in-app visits in this period.
                      </TableCell>
                    </TableRow>
                  )}
                  {byApp.map((r) => {
                    const appRate = r.views ? Math.min(1, r.escapes / r.views) : 0
                    return (
                      <TableRow key={r.label}>
                        <TableCell className="font-medium">{r.label}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmtNumber(r.views)}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmtNumber(r.escapes)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={appRate * 100} className="h-1.5 [&>[data-slot=progress-indicator]]:bg-chart-3" />
                            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{fmtPercent(appRate, 0)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="@4xl/main:col-span-2">
            <CardHeader>
              <CardTitle>How visitors got out</CardTitle>
              <CardDescription>Which method actually landed</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {methods.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No escapes yet.</p>}
              {methods.map((m) => (
                <div key={m.method} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{METHOD_LABEL[m.method] ?? m.method}</span>
                    <span className="tabular-nums text-muted-foreground">{fmtNumber(m.count)}</span>
                  </div>
                  <Progress value={(m.count / Math.max(1, methodTotal)) * 100} className="h-1.5 [&>[data-slot=progress-indicator]]:bg-chart-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What happens in each app</CardTitle>
            <CardDescription>
              Generated from the same code that runs the escape. Only methods with a published, device-verified result fire automatically. Everything else waits for a tap, with the app&apos;s menu as the fallback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>iPhone</TableHead>
                  <TableHead>Android</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MATRIX_APPS.map((app) => {
                  const ios = planEscape(app, "ios", () => pageUrl)
                  const android = planEscape(app, "android", () => pageUrl)
                  return (
                    <TableRow key={app}>
                      <TableCell className="align-top font-medium">{app}</TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <MethodCell plan={ios} />
                        {ios && <Badge variant="outline" className="mt-1.5">{CONFIDENCE[ios.confidence]}</Badge>}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <MethodCell plan={android} />
                        {android && <Badge variant="outline" className="mt-1.5">{CONFIDENCE[android.confidence]}</Badge>}
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
