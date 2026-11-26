"use client"

import Link from "next/link"
import { ActivityIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { PageSwitcher, type PageSummary } from "./page-switcher"

export function AppSidebar({
  pages,
  activeId,
  handle,
  escapeOn,
  isAdmin = false,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  pages: PageSummary[]
  activeId: string
  handle: string
  escapeOn: boolean
  isAdmin?: boolean
  user: { name: string; email: string; image?: string | null }
}) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" className="mb-1">
              <Link href="/dashboard" className="font-semibold">
                <ActivityIcon className="text-chart-1" />
                <span>LinkCliq</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <PageSwitcher pages={pages} activeId={activeId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain handle={handle} escapeOn={escapeOn} isAdmin={isAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
