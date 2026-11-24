import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Script from "next/script"
import { after } from "next/server"
import { BioPage } from "@/components/bio/bio-page"
import { EscapeScreen } from "@/components/escape/escape-screen"
import { getPublicOrigin } from "@/lib/dashboard"
import { contactEmail } from "@/lib/env"
import { ESCAPE_FROM_PARAM, ESCAPE_METHOD_PARAM, ESCAPE_PARAM, STAY_PARAM } from "@/lib/escape"
import { resolveEscape, searchParamsOf } from "@/lib/escape-server"
import { appFromSlug } from "@/lib/in-app"
import { getPageByHandle, getPageLinks, isLinkLive, isPagePublic } from "@/lib/pages"
import { recordEvent } from "@/lib/record"
import { backgroundCss } from "@/lib/themes"
import { clientInfo, resolveSource } from "@/lib/tracking"

export const dynamic = "force-dynamic"

type Props = PageProps<"/[handle]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const page = await getPageByHandle(decodeURIComponent(handle))
  if (!page || !isPagePublic(page)) return { title: "Not found" }
  const title = page.seoTitle || `${page.displayName} | Links`
  const description = page.seoDescription || page.bio || `All of ${page.displayName}'s links in one place.`
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
    robots: page.sensitive ? { index: false } : undefined,
  }
}

function reportHref(origin: string, handle: string) {
  const email = contactEmail()
  if (!email) return null
  return `mailto:${email}?subject=${encodeURIComponent(`Report ${origin}/${handle}`)}`
}

export default async function PublicPage({ params, searchParams }: Props) {
  const { handle } = await params
  const page = await getPageByHandle(decodeURIComponent(handle))
  if (!page || !isPagePublic(page)) notFound()

  const [h, sp, origin] = await Promise.all([headers(), searchParams, getPublicOrigin()])
  const query = searchParamsOf(sp)
  const info = clientInfo(h)
  const selfHost = new URL(origin).host
  const utm = { source: query.get("utm_source"), medium: query.get("utm_medium"), campaign: query.get("utm_campaign") }
  const explicit = query.get("src")
  const source = resolveSource({ explicit, utmSource: utm.source, inApp: info.inApp, referrer: info.referrer, selfHost })
  const landedFromEscape = query.get(ESCAPE_PARAM) === "1"

  const escape = resolveEscape({
    mode: page.escapeMode,
    skipAds: page.escapeSkipAds,
    inApp: info.inApp,
    ua: info.ua,
    params: query,
    base: new URL(`/${page.handle}`, origin),
    source,
  })

  if (escape?.plan.auto?.kind === "redirect") {
    after(() => recordEvent({ page, type: "view", headers: h, explicitSource: explicit, utm, selfHost }))
    redirect(escape.plan.auto.href)
  }

  after(async () => {
    if (landedFromEscape) {
      if (!info.inApp) {
        await recordEvent({
          page,
          type: "escape",
          headers: h,
          explicitSource: explicit,
          utm,
          selfHost,
          overrideInApp: appFromSlug(query.get(ESCAPE_FROM_PARAM)) ?? "Unknown",
          escapeMethod: query.get(ESCAPE_METHOD_PARAM),
        })
      }
      return
    }
    if (query.get(STAY_PARAM) === "1") return
    await recordEvent({ page, type: "view", headers: h, explicitSource: explicit, utm, selfHost })
  })

  if (escape) {
    return (
      <>
        {escape.mode === "auto" && escape.plan.auto?.kind === "meta-refresh" && (
          <meta httpEquiv="refresh" content={`0;url=${escape.plan.auto.href}`} />
        )}
        <EscapeScreen
          mode={escape.mode === "guide" ? "guide" : "auto"}
          plan={escape.plan}
          copyUrl={escape.copyUrl}
          stayHref={escape.stayHref}
          brand={{ displayName: page.displayName, avatar: page.avatar, background: backgroundCss(page.theme), text: page.theme.text }}
        />
      </>
    )
  }

  const links = (await getPageLinks(page.id)).filter((l) => isLinkLive(l))
  const stay = query.get(STAY_PARAM) === "1"

  return (
    <>
      <BioPage
        mode="live"
        stay={stay}
        source={source === "Direct" ? null : source}
        reportHref={reportHref(origin, page.handle)}
        page={{
          displayName: page.displayName,
          bio: page.bio,
          avatar: page.avatar,
          theme: page.theme,
          showBranding: page.showBranding,
          sensitive: page.sensitive,
        }}
        links={links.map((l) => ({
          id: l.id,
          kind: l.kind,
          title: l.title,
          url: l.url,
          platform: l.platform,
          thumbnail: l.thumbnail,
          highlight: l.highlight,
        }))}
        className="min-h-svh"
      />
      {page.gaMeasurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${page.gaMeasurementId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(page.gaMeasurementId)});`}
          </Script>
        </>
      )}
      {page.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(page.metaPixelId)});fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
