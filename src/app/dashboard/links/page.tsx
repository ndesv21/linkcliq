import { EyeIcon } from "lucide-react"
import { SiteHeader } from "@/components/dashboard/site-header"
import { LinksEditor } from "@/components/links/links-editor"
import { PhonePreview } from "@/components/links/phone-preview"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getLinkSparklines } from "@/lib/analytics"
import { getPublicOrigin } from "@/lib/dashboard"
import { isLive } from "@/lib/link-utils"
import { getPageLinks, requirePage } from "@/lib/pages"

export const metadata = { title: "Links" }

export default async function LinksPage() {
  const { page } = await requirePage()
  const [links, sparklines, origin] = await Promise.all([getPageLinks(page.id), getLinkSparklines(page.id), getPublicOrigin()])
  const preview = {
    displayName: page.displayName,
    bio: page.bio,
    avatar: page.avatar,
    theme: page.theme,
    showBranding: page.showBranding,
    sensitive: page.sensitive,
  }
  const editable = links.map((l) => ({
    id: l.id,
    kind: l.kind,
    title: l.title,
    url: l.url,
    platform: l.platform,
    thumbnail: l.thumbnail,
    position: l.position,
    enabled: l.enabled,
    highlight: l.highlight,
    escapeMode: l.escapeMode,
    appendUtm: l.appendUtm,
    startsAt: l.startsAt,
    endsAt: l.endsAt,
  }))

  return (
    <>
      <SiteHeader
        title="Links"
        pageUrl={`${origin}/${page.handle}`}
        actions={
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="xl:hidden">
                <EyeIcon /> Preview
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Preview</SheetTitle>
                <SheetDescription>What visitors see right now.</SheetDescription>
              </SheetHeader>
              <PhonePreview page={preview} links={editable.filter((l) => isLive(l))} className="pb-6" />
            </SheetContent>
          </Sheet>
        }
      />
      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <LinksEditor
          pageId={page.id}
          initial={editable}
          sparklines={sparklines}
          origin={origin}
          preview={preview}
          pageEscapeMode={page.escapeMode}
        />
      </div>
    </>
  )
}
