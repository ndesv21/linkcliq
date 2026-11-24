"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { getPlatform, PLATFORMS } from "@/lib/platforms"
import type { EditableLink, LinkPatch } from "./types"

export function SocialLinksCard({
  socials,
  onAdd,
  onChange,
  onDelete,
}: {
  socials: EditableLink[]
  onAdd: (platform: string) => void
  onChange: (id: string, patch: LinkPatch, opts?: { debounce?: boolean }) => void
  onDelete: (id: string) => void
}) {
  const used = new Set(socials.map((s) => s.platform))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social icons</CardTitle>
        <CardDescription>Shown as a row of icons under your bio. Clicks are tracked too.</CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusIcon /> Add icon
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-0">
              <ScrollArea className="h-72 p-1">
                {PLATFORMS.filter((p) => !used.has(p.id)).map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => onAdd(p.id)}>
                    <PlatformIcon platform={p.id} colored />
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2">
        {socials.length === 0 && <p className="py-3 text-sm text-muted-foreground">No icons yet. Add Instagram, TikTok, YouTube and more.</p>}
        {socials.map((s) => {
          const meta = getPlatform(s.platform)
          return (
            <div key={s.id} className="flex items-center gap-2">
              <InputGroup className="flex-1">
                <InputGroupAddon>
                  <PlatformIcon platform={s.platform} colored className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label={`${meta?.name ?? "Social"} URL`}
                  value={s.url}
                  placeholder={meta?.prefix ?? "https://"}
                  onChange={(e) => onChange(s.id, { url: e.target.value }, { debounce: true })}
                />
              </InputGroup>
              <Switch checked={s.enabled} onCheckedChange={(enabled) => onChange(s.id, { enabled })} aria-label="Show icon" />
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label="Remove icon" onClick={() => onDelete(s.id)}>
                <Trash2Icon />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

