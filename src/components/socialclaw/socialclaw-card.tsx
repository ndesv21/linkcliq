"use client"

import Link from "next/link"
import { ArrowUpRightIcon, CheckCircle2Icon, SendIcon } from "lucide-react"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { socialclawHref } from "@/lib/env"
import { ComposerDialog } from "./composer-dialog"
import { SocialClawMark } from "./socialclaw-mark"

const PREVIEW = ["x", "instagram", "tiktok", "linkedin", "youtube"]

export function SocialClawCard({
  connected,
  workspace,
  pageUrl,
}: {
  connected: boolean
  workspace: string | null
  pageUrl: string
}) {
  return (
    <>
      <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="SocialClaw">
            <Link href="/dashboard/integrations">
              <SocialClawMark className="size-4 text-foreground [--sc-ink:var(--background)]" />
              <span>SocialClaw</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <Card size="sm" className="shadow-none group-data-[collapsible=icon]:hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SocialClawMark className="size-6 text-foreground [--sc-ink:var(--background)]" />
            <CardTitle className="text-sm">
              {connected ? "SocialClaw connected" : "Post your links everywhere"}
            </CardTitle>
          </div>
          <CardDescription className="text-xs leading-relaxed">
            {connected ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2Icon className="size-3 text-chart-3" />
                {workspace ? `Workspace: ${workspace}` : "Ready to schedule posts"}
              </span>
            ) : (
              "Schedule posts to X, Instagram, TikTok, LinkedIn and 7 more networks from this dashboard."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {!connected && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {PREVIEW.map((p) => (
                <PlatformIcon key={p} platform={p} className="size-3.5" />
              ))}
              <span className="text-[11px]">+6</span>
            </div>
          )}
          {connected ? (
            <ComposerDialog defaultText={`New links are up: ${pageUrl}`}>
              <Button size="sm" className="w-full">
                <SendIcon /> Compose post
              </Button>
            </ComposerDialog>
          ) : (
            <Button size="sm" className="w-full" asChild>
              <Link href="/dashboard/integrations">Connect SocialClaw</Link>
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-6 w-full text-xs text-muted-foreground" asChild>
            <a href={socialclawHref("sidebar_card")} target="_blank" rel="noreferrer">
              getsocialclaw.com <ArrowUpRightIcon />
            </a>
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
