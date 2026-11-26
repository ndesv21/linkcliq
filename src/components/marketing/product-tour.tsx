import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TOUR = [
  {
    key: "links",
    label: "Links",
    path: "dashboard/links",
    text: "Add links, headers and social icons, drag to reorder, schedule a link to appear and disappear, and watch a live phone preview while you edit.",
  },
  {
    key: "analytics",
    label: "Analytics",
    path: "dashboard/analytics",
    text: "Views, clicks, click-through rate, sources, countries, devices and browsers for every link, kept for as long as your database is.",
  },
  {
    key: "escape",
    label: "Browser escape",
    path: "dashboard/escape",
    text: "Turn the escape on, choose automatic or guided, and see how many visitors from each app actually made it to Safari or Chrome.",
  },
  {
    key: "calendar",
    label: "Social Calendar",
    path: "dashboard/calendar",
    text: "Your scheduled and published posts from SocialClaw on a calendar next to your links. Schedule a new post about any link without leaving the dashboard.",
  },
  {
    key: "appearance",
    label: "Appearance",
    path: "dashboard/appearance",
    text: "Theme presets, gradients, seven fonts and four button styles, with the page updating on the phone preview as you go.",
  },
  {
    key: "share",
    label: "Share & QR",
    path: "dashboard/share",
    text: "Your page link ready to paste into each app's bio field, and a QR code in your colors for print, packaging and stage screens.",
  },
] as const

export function ProductTour() {
  return (
    <Tabs defaultValue="links" className="gap-6">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList className="h-9 w-max">
          {TOUR.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="px-3">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {TOUR.map((t) => (
        <TabsContent key={t.key} value={t.key} className="flex flex-col gap-4">
          <p className="max-w-2xl text-sm text-muted-foreground">{t.text}</p>
          <div className="overflow-hidden rounded-xl border bg-card shadow-xl">
            <div className="flex items-center gap-1.5 border-b bg-muted/50 px-3 py-2">
              <span className="size-2.5 rounded-full bg-muted-foreground/25" />
              <span className="size-2.5 rounded-full bg-muted-foreground/25" />
              <span className="size-2.5 rounded-full bg-muted-foreground/25" />
              <span className="mx-auto truncate rounded-md bg-background px-3 py-0.5 text-xs text-muted-foreground">linkcliq.com/{t.path}</span>
              <span className="w-10" />
            </div>
            <Image
              src={`/screenshots/${t.key}-light.webp`}
              alt={`LinkCliq ${t.label} screen`}
              width={1440}
              height={900}
              unoptimized
              className="h-auto w-full dark:hidden"
            />
            <Image
              src={`/screenshots/${t.key}-dark.webp`}
              alt={`LinkCliq ${t.label} screen`}
              width={1440}
              height={900}
              unoptimized
              className="hidden h-auto w-full dark:block"
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
