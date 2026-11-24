import { SiteHeader } from "@/components/dashboard/site-header"
import { DeleteAccount } from "@/components/settings/delete-account"
import { SettingsForm } from "@/components/settings/settings-form"
import { getPublicOrigin } from "@/lib/dashboard"
import { requirePage } from "@/lib/pages"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { page } = await requirePage()
  const origin = await getPublicOrigin()
  return (
    <>
      <SiteHeader title="Settings" pageUrl={`${origin}/${page.handle}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <SettingsForm
          key={page.id}
          suspended={Boolean(page.suspendedAt)}
          pageId={page.id}
          host={new URL(origin).host}
          initial={{
            handle: page.handle,
            seoTitle: page.seoTitle ?? "",
            seoDescription: page.seoDescription ?? "",
            sensitive: page.sensitive,
            showBranding: page.showBranding,
            published: page.published,
            gaMeasurementId: page.gaMeasurementId ?? "",
            metaPixelId: page.metaPixelId ?? "",
          }}
        />
        <DeleteAccount />
      </div>
    </>
  )
}
