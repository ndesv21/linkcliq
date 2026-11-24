import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getPublicOrigin, getSocialClawStatus } from "@/lib/dashboard"
import { isAdminEmail } from "@/lib/env"
import { requirePage } from "@/lib/pages"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, page, pages } = await requirePage()
  const [origin, socialclaw] = await Promise.all([getPublicOrigin(), getSocialClawStatus(user.id)])
  return (
    <SidebarProvider style={{ "--header-height": "3.5rem" } as React.CSSProperties}>
      <AppSidebar
        pages={pages.map((p) => ({ id: p.id, handle: p.handle, displayName: p.displayName, avatar: p.avatar }))}
        activeId={page.id}
        handle={page.handle}
        pageUrl={`${origin}/${page.handle}`}
        escapeOn={page.escapeMode !== "off"}
        isAdmin={isAdminEmail(user.email)}
        user={{ name: user.name, email: user.email, image: user.image }}
        socialclaw={socialclaw}
      />
      <SidebarInset>
        {children}
        <footer className="mt-auto px-4 pt-2 pb-4 text-xs text-muted-foreground lg:px-6">
          Country data: <a href="https://db-ip.com" className="underline-offset-4 hover:text-foreground hover:underline">IP Geolocation by DB-IP</a>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
