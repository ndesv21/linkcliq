import { AppearanceEditor } from "@/components/appearance/appearance-editor"
import { SiteHeader } from "@/components/dashboard/site-header"
import { getPublicOrigin } from "@/lib/dashboard"
import { isLive } from "@/lib/link-utils"
import { getPageLinks, requirePage } from "@/lib/pages"

export const metadata = { title: "Appearance" }

export default async function AppearancePage() {
  const { page } = await requirePage()
  const [links, origin] = await Promise.all([getPageLinks(page.id), getPublicOrigin()])
  return (
    <>
      <SiteHeader title="Appearance" pageUrl={`${origin}/${page.handle}`} />
      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <AppearanceEditor
          key={page.id}
          pageId={page.id}
          initialProfile={{ displayName: page.displayName, bio: page.bio, avatar: page.avatar }}
          initialTheme={page.theme}
          showBranding={page.showBranding}
          links={links
            .filter((l) => isLive(l) && (l.kind !== "social" || l.url))
            .map((l) => ({ id: l.id, kind: l.kind, title: l.title, url: l.url, platform: l.platform, thumbnail: l.thumbnail, highlight: l.highlight }))}
        />
      </div>
    </>
  )
}
