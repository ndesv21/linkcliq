import Link from "next/link"
import {
  ActivityIcon,
  ArrowRightIcon,
  BarChart3Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckIcon,
  CookieIcon,
  CreditCardIcon,
  DatabaseIcon,
  DownloadIcon,
  EyeOffIcon,
  GraduationCapIcon,
  KeyRoundIcon,
  LayersIcon,
  LayoutListIcon,
  LogInIcon,
  MapPinIcon,
  MicIcon,
  MinusIcon,
  Music2Icon,
  PaletteIcon,
  QrCodeIcon,
  ScanEyeIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TagIcon,
  WalletIcon,
} from "lucide-react"
import { EscapeStory } from "@/components/marketing/escape-story"
import { ProductTour } from "@/components/marketing/product-tour"
import { PlatformIcon } from "@/components/platform-icon"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSession } from "@/lib/auth"
import { GITHUB_URL, isCloud, socialclawHref } from "@/lib/env"

const FEATURES = [
  { icon: ShieldCheckIcon, title: "In-app browser escape", text: "Sends TikTok, Instagram and Facebook visitors to Safari or Chrome, where they are logged in and their cards autofill." },
  { icon: BarChart3Icon, title: "Click analytics", text: "Views, clicks, CTR, sources, countries, devices and browsers for every link. Kept forever, not 28 days." },
  { icon: ScanEyeIcon, title: "Platform attribution", text: "Knows a visit came from TikTok even when TikTok hides the referrer, from its in-app browser signature." },
  { icon: TagIcon, title: "UTM passthrough", text: "Outbound links carry utm_source=tiktok or instagram, so your store sees where buyers came from." },
  { icon: CalendarClockIcon, title: "Scheduled links", text: "Links that appear and disappear on time. Built for drops, launches and sales that end." },
  { icon: SparklesIcon, title: "Highlighted links", text: "Make the link that matters pulse, wobble or glow so it gets the tap." },
  { icon: LayoutListIcon, title: "Headers and social icons", text: "Group links under headers and add icons for Instagram, TikTok, YouTube and the rest of your profiles." },
  { icon: PaletteIcon, title: "Themes that look designed", text: "Presets, gradients, seven fonts, four button styles and a live phone preview while you edit." },
  { icon: QrCodeIcon, title: "QR codes", text: "PNG and SVG in your colors, with scans tracked as their own source." },
  { icon: CalendarDaysIcon, title: "Social Calendar", text: "Connect SocialClaw to see your scheduled and published posts next to your links, and schedule a post about any link." },
  { icon: CookieIcon, title: "No cookie banner", text: "Visitors are counted with a hash that rotates daily. Nothing is stored on their device and raw IPs are never saved." },
  { icon: DownloadIcon, title: "Your data, exportable", text: "Every event as CSV. GA4 and Meta Pixel if you want them too." },
]

const USE_CASES = [
  { icon: SparklesIcon, title: "Creators", text: "Latest video, brand deals and discount codes, merch and a newsletter, all one tap from your profile." },
  { icon: ShoppingBagIcon, title: "Online shops", text: "Best sellers, new drops and the sale that ends on Sunday, straight from the post that sold it." },
  { icon: GraduationCapIcon, title: "Coaches and courses", text: "A sales page, a free guide that grows your list and a calendar for discovery calls." },
  { icon: Music2Icon, title: "Musicians", text: "The new single on every streaming service, tour dates and the ticket link while it lasts." },
  { icon: MicIcon, title: "Podcasters", text: "Every listening app, the latest episode and the sponsor offer you promised on air." },
  { icon: MapPinIcon, title: "Local businesses", text: "Menu, bookings, directions and reviews for the people who found you on Instagram." },
]

const PAINS = [
  { icon: LogInIcon, title: "Logged out", text: "The app's browser keeps its own cookies, so your store, course platform and calendar all ask visitors to sign in again." },
  { icon: KeyRoundIcon, title: "No saved passwords", text: "Password managers and Keychain rarely fill inside a webview." },
  { icon: CreditCardIcon, title: "No saved cards", text: "Visitors type a 16-digit card number by hand on a phone. Many stop." },
  { icon: WalletIcon, title: "Apple Pay often off", text: "WebKit disables Apple Pay in webviews where the host app injects scripts, which the big social apps do." },
]

type Mark = boolean | string
const COMPARE: { feature: string; us: Mark; linktree: Mark; escape: Mark }[] = [
  { feature: "Price", us: "Free, MIT licensed", linktree: "Free to $35/mo", escape: "$9 to $36/mo" },
  { feature: "In-app browser escape", us: true, linktree: false, escape: true },
  { feature: "Analytics history", us: "Unlimited", linktree: "28 days free, lifetime on Premium", escape: "Varies" },
  { feature: "UTM parameters", us: true, linktree: "Paid plans", escape: "Varies" },
  { feature: "Google Analytics / Meta Pixel", us: true, linktree: "Paid plans", escape: "Varies" },
  { feature: "Data export", us: "CSV, every event", linktree: "Premium", escape: "Varies" },
  { feature: "Your own domain", us: "Yes, self-hosted", linktree: false, escape: "Paid plans" },
  { feature: "Own your data", us: "Your database", linktree: false, escape: false },
]

const FAQ = [
  {
    q: "Is LinkCliq really free?",
    a: "Yes. The code is MIT licensed and every feature is in the open source version. Host it yourself on any Node host with a SQLite file, or on Vercel with Turso. There is no paid tier.",
  },
  {
    q: "Does the browser escape work in every app?",
    a: "No single trick does, and anyone who claims otherwise is guessing. LinkCliq uses the method that is verified for each app and phone: Instagram and Threads on iPhone, most Meta apps on Android, LINE, WhatsApp and Telegram can be opened automatically. TikTok on iPhone has no verified automatic method today, so visitors get a one-tap button and a pointer to TikTok's own Open in browser menu. The dashboard shows your real escape rate per app.",
  },
  {
    q: "Is it allowed by TikTok and Instagram?",
    a: "LinkCliq only uses the apps' own menus and public URL schemes, and it never shows reviewers different content. Paid ad traffic skips the escape by default, because Meta and TikTok ad policies require ad clicks to land on the real page.",
  },
  {
    q: "Do I need a cookie banner?",
    a: "Not for LinkCliq analytics. Visitors are counted with a hash of the IP and browser that rotates daily, nothing is stored on the device, and raw IPs are never saved. If you add GA4 or Meta Pixel, their rules apply.",
  },
  {
    q: "What is the Social Calendar?",
    a: "A month view of the posts you have scheduled and published through SocialClaw, a social media scheduler with an API. It is optional. Add a SocialClaw API key in the calendar settings and your real posts show up next to your links, and every link gets a button to schedule a post about it on X, Instagram, TikTok, LinkedIn and seven more networks.",
  },
]

function MarkCell({ value }: { value: Mark }) {
  if (value === true) return <CheckIcon className="size-4 text-chart-3" aria-label="Yes" />
  if (value === false) return <MinusIcon className="size-4 text-muted-foreground" aria-label="No" />
  return <span className="text-sm">{value}</span>
}

export default async function Home() {
  const session = await getSession()
  const cta = session ? { href: "/dashboard", label: "Open dashboard" } : { href: "/sign-up", label: "Create your page" }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ActivityIcon className="size-4" />
            </span>
            LinkCliq
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
            <a href="#link-in-bio" className="hover:text-foreground">Link in bio</a>
            <a href="#escape" className="hover:text-foreground">Browser escape</a>
            <a href="#tour" className="hover:text-foreground">Tour</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#compare" className="hover:text-foreground">Compare</a>
            <a href="#self-host" className="hover:text-foreground">Self-host</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                <PlatformIcon platform="github" /> <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
            {!session && (
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,color-mix(in_oklab,var(--chart-2)_14%,transparent),transparent_45%),radial-gradient(circle_at_20%_80%,color-mix(in_oklab,var(--chart-1)_12%,transparent),transparent_40%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 md:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
            <div className="flex flex-col items-start gap-6">
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
                <span className="size-1.5 rounded-full bg-chart-3" /> Open source · MIT · self-hosted
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                The link in bio that gets buyers out of TikTok&apos;s browser
              </h1>
              <p className="max-w-xl text-lg text-pretty text-muted-foreground">
                LinkCliq is a free link in bio page with real click analytics. When a visitor arrives from TikTok, Instagram or Facebook, it moves them to Safari or Chrome, where they are signed in and their card fills itself.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-11 px-5" asChild>
                  <Link href={cta.href}>
                    {cta.label} <ArrowRightIcon />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-5" asChild>
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    <PlatformIcon platform="github" /> Star on GitHub
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">No paid tier. No tracking cookies. Your database.</p>
            </div>
            <div className="flex flex-col gap-5">
              <EscapeStory compact />
              <p className="mx-auto max-w-xl text-center text-xs text-pretty text-muted-foreground">
                TikTok on iPhone has no verified automatic route, so LinkCliq asks for that one tap and points at TikTok&apos;s own menu as a backup. Instagram and Threads on iPhone, and most Meta apps on Android, open Safari or Chrome automatically.
              </p>
            </div>
          </div>
        </section>

        <section id="link-in-bio" className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <div>
                <Badge variant="secondary">Link in bio, explained</Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">One link on your profile. Everything you sell behind it.</h2>
              </div>
              <div className="grid gap-4 text-muted-foreground">
                <p>
                  Social apps keep links out of posts. A link in an Instagram caption is plain text nobody can tap, and your profile only has room for a few links at most. So every post ends with the same line: link in bio.
                </p>
                <p>
                  A link in bio page turns that one profile link into a menu of everything you want people to find: your shop, your newest video, a newsletter, a booking page and your other socials. It is one of the most used tools on social media:{" "}
                  <a href="https://linktr.ee/about" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">
                    Linktree alone says it has more than 70 million users
                  </a>
                  .
                </p>
              </div>
            </div>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                { title: "Put one link in your bio", text: "linkcliq.com/yourname goes in the website field of TikTok, Instagram, YouTube, X and the rest." },
                { title: "Point every post at it", text: "A video, a story or a caption says link in bio, and followers know where to tap." },
                { title: "They choose where to go", text: "Your page lists the shop, the course and the latest drop, and shows you which link they picked." },
              ].map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-xl border bg-card p-5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <h3 className="mt-16 text-lg font-semibold">Who uses one</h3>
            <div className="mt-5 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((u) => (
                <div key={u.title} className="flex gap-3">
                  <u.icon className="mt-0.5 size-5 shrink-0 text-chart-2" />
                  <div>
                    <h4 className="font-medium">{u.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{u.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="escape" className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="max-w-2xl">
              <Badge variant="secondary">The problem nobody fixes</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">Your bio link opens in a browser your customers have never used</h2>
              <p className="mt-4 text-muted-foreground">
                TikTok, Instagram and Facebook open links inside their own webview. It looks like a normal page, but it is a separate browser with none of the visitor&apos;s logins, passwords or payment details. Your funnel breaks at the exact moment someone wants to buy.
              </p>
            </div>
            <h3 className="mt-12 text-lg font-semibold">What the in-app browser takes away</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PAINS.map((p) => (
                <Card key={p.title} size="sm">
                  <CardHeader>
                    <p.icon className="mb-2 size-5 text-chart-2" />
                    <CardTitle>{p.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{p.text}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                { step: "1", title: "Detect", text: "Recognises TikTok, Instagram, Facebook, Messenger, Threads, LinkedIn, Snapchat, LINE, WhatsApp and more from the browser signature." },
                { step: "2", title: "Hop out", text: "Fires the method that works in that app on that phone. If the app blocks it, shows a one-tap button and points at the app's own menu." },
                { step: "3", title: "Measure", text: "Counts who actually landed in Safari or Chrome, per app and per method, so you see your real escape rate instead of a vendor's promise." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold">{s.step}</span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 max-w-3xl text-sm text-muted-foreground">
              In 2022, researcher Felix Krause found TikTok&apos;s iOS in-app browser subscribing to every keypress and tap on the pages it opened. Getting visitors into their own browser is also simply better for them.
            </p>
          </div>
        </section>

        <section id="tour" className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance">A look inside the dashboard</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">These are real screens from LinkCliq, the same app you can run yourself or use at linkcliq.com.</p>
            <div className="mt-8">
              <ProductTour />
            </div>
          </div>
        </section>

        <section id="features" className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance">Everything the paid tools charge for, in the open</h2>
            <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <f.icon className="size-5 text-chart-1" />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="compare" className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">How it compares</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Escape tools such as linkboo, OpenUp and Bouncy sell browser escape as a paid upgrade. Linktree does not offer it at all.
            </p>
            <Card className="mt-8 py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[28%] pl-6">Feature</TableHead>
                    <TableHead className="text-foreground">LinkCliq</TableHead>
                    <TableHead>Linktree</TableHead>
                    <TableHead className="pr-6">Paid escape tools</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPARE.map((r) => (
                    <TableRow key={r.feature}>
                      <TableCell className="pl-6 font-medium">{r.feature}</TableCell>
                      <TableCell className="whitespace-normal"><MarkCell value={r.us} /></TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground"><MarkCell value={r.linktree} /></TableCell>
                      <TableCell className="pr-6 whitespace-normal text-muted-foreground"><MarkCell value={r.escape} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <p className="mt-3 text-xs text-muted-foreground">Competitor plans as published in November 2026. Check their pricing pages for current details.</p>
          </div>
        </section>

        <section id="self-host" className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Running in two minutes</h2>
              <p className="mt-3 text-muted-foreground">
                One Next.js app and one SQLite file. Point a domain at it and every bio link you share is on your own domain, which also avoids the warnings TikTok shows for shared link-in-bio domains.
              </p>
              <ul className="mt-6 grid gap-3 text-sm">
                {[
                  { icon: DatabaseIcon, text: "SQLite by default, Turso or libSQL when you need it" },
                  { icon: LayersIcon, text: "Docker image, or any Node 20+ host" },
                  { icon: EyeOffIcon, text: "No third-party scripts on your page unless you add them" },
                ].map((i) => (
                  <li key={i.text} className="flex items-center gap-3">
                    <i.icon className="size-4 text-muted-foreground" />
                    {i.text}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-neutral-950 py-0 text-neutral-100 ring-neutral-800 dark:bg-neutral-900">
              <CardContent className="p-0">
                <div className="flex items-center gap-1.5 border-b border-neutral-800 px-4 py-3">
                  <span className="size-2.5 rounded-full bg-neutral-700" />
                  <span className="size-2.5 rounded-full bg-neutral-700" />
                  <span className="size-2.5 rounded-full bg-neutral-700" />
                  <span className="ml-2 text-xs text-neutral-500">terminal</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6">
                  <code>
                    <span className="text-neutral-500"># clone and run</span>
                    {"\n"}git clone {GITHUB_URL}.git
                    {"\n"}cd linkcliq && npm install
                    {"\n"}npm run dev
                    {"\n\n"}
                    <span className="text-neutral-500"># or with Docker</span>
                    {"\n"}docker compose up -d
                  </code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-b">
          <div className="mx-auto max-w-3xl px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">Questions</h2>
            <Accordion type="single" collapsible className="mt-6">
              {FAQ.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-20 text-center">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-balance">Stop losing buyers to a browser they never chose</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="h-11 px-5" asChild>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5" asChild>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  <PlatformIcon platform="github" /> Star on GitHub
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Separator />
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground">
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>LinkCliq is MIT licensed.</span>
          {isCloud() && (
            <>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
            </>
          )}
        </span>
        <span>
          Built by the team behind{" "}
          <a href={socialclawHref("footer")} className="underline-offset-4 hover:text-foreground hover:underline" target="_blank" rel="noreferrer">
            SocialClaw
          </a>
          .
        </span>
      </footer>
    </div>
  )
}
