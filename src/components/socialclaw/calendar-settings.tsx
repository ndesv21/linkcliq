"use client"

import { useState } from "react"
import { ArrowUpRightIcon, KeyRoundIcon, Settings2Icon, UsersIcon } from "lucide-react"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { socialclawHref } from "@/lib/env"
import { ConnectForm, DisconnectButton } from "./connect-form"
import { PROVIDER_PLATFORM } from "./provider"

type Account = { handle: string; provider: string; name: string }

export function CalendarSettings({
  connection,
  accounts,
  defaultOpen = false,
  children,
}: {
  connection: { connected: boolean; workspace: string | null; error: string | null }
  accounts: Account[]
  defaultOpen?: boolean
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [replacing, setReplacing] = useState(false)
  const showForm = !connection.connected || replacing || Boolean(connection.error)
  const providers = [...new Set(accounts.map((a) => PROVIDER_PLATFORM[a.provider] ?? a.provider))]

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setReplacing(false)
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <Settings2Icon /> Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Calendar settings</DialogTitle>
          <DialogDescription>
            The calendar reads your scheduled and published posts from SocialClaw with an API key. The key is encrypted at rest and only ever sent to SocialClaw.
          </DialogDescription>
        </DialogHeader>

        {connection.connected && (
          <ItemGroup className="gap-2">
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <KeyRoundIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>API key</ItemTitle>
                <ItemDescription>
                  {connection.error ? "Not accepted by SocialClaw" : connection.workspace ? `Connected to ${connection.workspace}` : "Connected"}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                {!replacing && !connection.error && (
                  <Button variant="ghost" size="sm" onClick={() => setReplacing(true)}>
                    Replace
                  </Button>
                )}
                <DisconnectButton />
              </ItemActions>
            </Item>
            {!connection.error && (
              <Item variant="outline" size="sm">
                <ItemMedia variant="icon">
                  <UsersIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {accounts.length} social account{accounts.length === 1 ? "" : "s"}
                  </ItemTitle>
                  <ItemDescription className="flex flex-wrap items-center gap-1.5">
                    {providers.length > 0
                      ? providers.map((p) => <PlatformIcon key={p} platform={p} className="size-3.5" />)
                      : "Connect your socials in SocialClaw to post from here."}
                  </ItemDescription>
                </ItemContent>
              </Item>
            )}
          </ItemGroup>
        )}

        {showForm && (
          <ConnectForm
            onConnected={() => {
              setReplacing(false)
              setOpen(false)
            }}
          />
        )}

        <DialogFooter className="sm:justify-start">
          <Button variant="link" className="h-auto px-0" asChild>
            <a href={socialclawHref("calendar_settings", "/dashboard?tab=api")} target="_blank" rel="noreferrer">
              Manage connection in SocialClaw <ArrowUpRightIcon />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
