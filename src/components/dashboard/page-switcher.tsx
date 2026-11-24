"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { setActivePage } from "@/lib/actions/pages"
import { initials } from "@/lib/format"

export type PageSummary = { id: string; handle: string; displayName: string; avatar: string | null }

export function PageSwitcher({ pages, activeId }: { pages: PageSummary[]; activeId: string }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const active = pages.find((p) => p.id === activeId) ?? pages[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent" disabled={pending}>
              <Avatar className="size-8 rounded-lg">
                {active.avatar && <AvatarImage src={active.avatar} alt="" />}
                <AvatarFallback className="rounded-lg">{initials(active.displayName)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{active.displayName}</span>
                <span className="truncate text-xs text-muted-foreground">/{active.handle}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Your pages</DropdownMenuLabel>
            {pages.map((p, i) => (
              <DropdownMenuItem
                key={p.id}
                className="gap-2 p-2"
                onSelect={() =>
                  startTransition(async () => {
                    await setActivePage(p.id)
                    router.refresh()
                  })
                }
              >
                <Avatar className="size-6 rounded-md">
                  {p.avatar && <AvatarImage src={p.avatar} alt="" />}
                  <AvatarFallback className="rounded-md text-[10px]">{initials(p.displayName)}</AvatarFallback>
                </Avatar>
                <span className="truncate">/{p.handle}</span>
                {p.id === active.id ? (
                  <CheckIcon className="ml-auto" />
                ) : (
                  i < 9 && <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onSelect={() => router.push("/onboarding?new=1")}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <PlusIcon className="size-4" />
              </div>
              <span className="font-medium text-muted-foreground">New page</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
