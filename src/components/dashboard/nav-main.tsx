"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  CalendarDaysIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  Link2Icon,
  PaletteIcon,
  Settings2Icon,
  ShareIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const MAIN = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Links", href: "/dashboard/links", icon: Link2Icon },
  { title: "Appearance", href: "/dashboard/appearance", icon: PaletteIcon },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3Icon },
]

const GROWTH = [
  { title: "Browser escape", href: "/dashboard/escape", icon: ShieldCheckIcon },
  { title: "Share & QR", href: "/dashboard/share", icon: ShareIcon },
  { title: "Social Calendar", href: "/dashboard/calendar", icon: CalendarDaysIcon },
  { title: "Settings", href: "/dashboard/settings", icon: Settings2Icon },
]

export function NavMain({ handle, escapeOn, isAdmin = false }: { handle: string; escapeOn: boolean; isAdmin?: boolean }) {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href))
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Page</SidebarGroupLabel>
        <SidebarMenu>
          {MAIN.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View live page">
              <a href={`/${handle}`} target="_blank" rel="noreferrer">
                <ExternalLinkIcon />
                <span className="truncate">View /{handle}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Grow</SidebarGroupLabel>
        <SidebarMenu>
          {GROWTH.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.href === "/dashboard/escape" && (
                <SidebarMenuBadge className={escapeOn ? "text-chart-3" : "text-muted-foreground"}>
                  {escapeOn ? "On" : "Off"}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Instance</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/admin")} tooltip="Admin">
                <Link href="/dashboard/admin">
                  <UsersIcon />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}
