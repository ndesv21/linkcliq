"use client"

import { useRef, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { formatDistanceToNowStrict } from "date-fns"
import {
  CalendarClockIcon,
  CopyIcon,
  GripVerticalIcon,
  ImageIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TagIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"
import { DateTimePicker } from "@/components/date-time-picker"
import { PlatformIcon } from "@/components/platform-icon"
import { ComposerDialog } from "@/components/socialclaw/composer-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { resizeImage } from "@/lib/image"
import { hostOf } from "@/lib/link-utils"
import { platformFromUrl } from "@/lib/platforms"
import { cn } from "@/lib/utils"
import { Sparkline } from "./sparkline"
import type { EditableLink, LinkPatch } from "./types"

const EMOJIS = ["🔥", "⭐", "🎁", "🛍️", "🎓", "📩", "🎧", "📅", "💬", "🚀", "✨", "💸"]
const ESCAPE_LABEL = { inherit: "Page setting", off: "Off", auto: "Auto", guide: "Guide" } as const

function ToolButton({ label, active, children, ...props }: React.ComponentProps<typeof Button> & { label: string; active?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} className={cn(active && "bg-muted text-foreground")} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function useSortableCard(id: string) {
  const s = useSortable({ id })
  return {
    ...s,
    style: { transform: CSS.Translate.toString(s.transform), transition: s.transition } as React.CSSProperties,
  }
}

export function LinkCard({
  link,
  series,
  trackedUrl,
  pageEscapeMode,
  onChange,
  onDelete,
}: {
  link: EditableLink
  series: number[] | undefined
  trackedUrl: string
  pageEscapeMode: "off" | "auto" | "guide"
  onChange: (patch: LinkPatch, opts?: { debounce?: boolean }) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableCard(link.id)
  const fileRef = useRef<HTMLInputElement>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const total = series?.reduce((a, b) => a + b, 0) ?? 0
  const platform = link.platform ?? platformFromUrl(link.url)
  const [now] = useState(() => Date.now())
  const scheduled = link.startsAt && link.startsAt.getTime() > now
  const expired = link.endsAt && link.endsAt.getTime() <= now
  const effectiveEscape = link.escapeMode === "inherit" ? pageEscapeMode : link.escapeMode

  return (
    <Card
      ref={setNodeRef}
      style={style}
      size="sm"
      className={cn("gap-0 py-0 transition-shadow", isDragging && "z-10 shadow-lg ring-2 ring-ring/40", !link.enabled && "opacity-70")}
    >
      <div className="flex items-start gap-2 p-3 pb-2">
        <button
          type="button"
          className="mt-1.5 cursor-grab touch-none rounded-sm p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40 text-lg">
          {link.thumbnail?.startsWith("data:") || link.thumbnail?.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.thumbnail} alt="" className="size-full object-cover" />
          ) : link.thumbnail ? (
            link.thumbnail
          ) : (
            <PlatformIcon platform={platform} className="size-4" />
          )}
        </div>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <Input
            aria-label="Title"
            value={link.title}
            placeholder="Title"
            onChange={(e) => onChange({ title: e.target.value }, { debounce: true })}
            className="h-7 border-transparent bg-transparent px-1.5 font-medium shadow-none hover:border-input dark:bg-transparent"
          />
          <Input
            aria-label="URL"
            value={link.url}
            placeholder="https://"
            onChange={(e) => onChange({ url: e.target.value }, { debounce: true })}
            className="h-7 border-transparent bg-transparent px-1.5 text-xs text-muted-foreground shadow-none hover:border-input dark:bg-transparent"
          />
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden flex-col items-end @md/editor:flex">
                <Sparkline data={series ?? Array(15).fill(0)} />
                <span className="text-[11px] tabular-nums text-muted-foreground">{total} clicks</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Clicks in the last 14 days</TooltipContent>
          </Tooltip>
          <Switch checked={link.enabled} onCheckedChange={(enabled) => onChange({ enabled })} aria-label="Show on page" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-0.5 border-t px-2 py-1.5">
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Thumbnail" className={cn(link.thumbnail && "bg-muted")}>
                  <ImageIcon />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Thumbnail</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-64" align="start">
            <FieldGroup className="gap-3">
              <FieldLabel>Emoji</FieldLabel>
              <div className="grid grid-cols-6 gap-1">
                {EMOJIS.map((e) => (
                  <Button key={e} variant={link.thumbnail === e ? "secondary" : "ghost"} size="icon-sm" className="text-base" onClick={() => onChange({ thumbnail: e })}>
                    {e}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => fileRef.current?.click()}>
                  <UploadIcon /> Upload image
                </Button>
                {link.thumbnail && (
                  <Button variant="ghost" size="sm" onClick={() => onChange({ thumbnail: null })}>
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    onChange({ thumbnail: await resizeImage(file, 160) })
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not read that image")
                  }
                  e.target.value = ""
                }}
              />
            </FieldGroup>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Highlight" className={cn(link.highlight !== "none" && "bg-muted text-chart-2")}>
                  <SparklesIcon />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Highlight</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Draw attention</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={link.highlight} onValueChange={(v) => onChange({ highlight: v as EditableLink["highlight"] })}>
              <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pulse">Pulse</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="wobble">Wobble</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="glow">Glow</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Schedule" className={cn((link.startsAt || link.endsAt) && "bg-muted text-chart-1")}>
                  <CalendarClockIcon />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Schedule</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80" align="start">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Show from</FieldLabel>
                <DateTimePicker value={link.startsAt} onChange={(startsAt) => onChange({ startsAt })} placeholder="Right away" />
              </Field>
              <Field>
                <FieldLabel>Hide after</FieldLabel>
                <DateTimePicker value={link.endsAt} onChange={(endsAt) => onChange({ endsAt })} placeholder="Never" />
                <FieldDescription>Great for drops, launches and sales that end.</FieldDescription>
              </Field>
            </FieldGroup>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Browser escape" className={cn(link.escapeMode !== "inherit" && "bg-muted", effectiveEscape !== "off" && "text-chart-3")}>
                  <ShieldCheckIcon />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Browser escape: {link.escapeMode === "inherit" ? `page setting (${pageEscapeMode})` : ESCAPE_LABEL[link.escapeMode]}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>When opened inside TikTok, Instagram…</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={link.escapeMode} onValueChange={(v) => onChange({ escapeMode: v as EditableLink["escapeMode"] })}>
              <DropdownMenuRadioItem value="inherit">Use page setting ({pageEscapeMode})</DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="auto">Auto: try to open the real browser</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="guide">Guide: show how to open it</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="off">Off: redirect straight away</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle size="sm" pressed={link.appendUtm} onPressedChange={(appendUtm) => onChange({ appendUtm })} aria-label="Add UTM tags" className="h-7 min-w-7 px-1.5">
              <TagIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>{link.appendUtm ? "UTM tags on: utm_source follows the visitor's platform" : "Add UTM tags"}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />

        <ComposerDialog defaultText={`${link.title}\n${trackedUrl}`}>
          <Button variant="ghost" size="icon-sm" aria-label="Post this link">
            <SendIcon />
          </Button>
        </ComposerDialog>
        <ToolButton
          label="Copy tracked link"
          onClick={async () => {
            await navigator.clipboard.writeText(trackedUrl)
            toast.success("Tracked link copied", { description: trackedUrl })
          }}
        >
          <CopyIcon />
        </ToolButton>

        <div className="ml-auto flex items-center gap-1.5">
          {!link.enabled && <Badge variant="outline">Hidden</Badge>}
          {scheduled && <Badge variant="secondary">Starts in {formatDistanceToNowStrict(link.startsAt!)}</Badge>}
          {expired && <Badge variant="outline">Ended</Badge>}
          {!scheduled && !expired && link.endsAt && <Badge variant="secondary">Ends in {formatDistanceToNowStrict(link.endsAt)}</Badge>}
          {link.url && !/^https?:/i.test(link.url) && <Badge variant="outline">{link.url.split(":")[0]}</Badge>}
          <span className="hidden text-xs text-muted-foreground @lg/editor:inline">{link.url ? hostOf(link.url) : ""}</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Delete" className="text-muted-foreground hover:text-destructive">
                <Trash2Icon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this link?</AlertDialogTitle>
                <AlertDialogDescription>Its click history stays in your analytics. Anyone with the tracked link will land on your page instead.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  )
}

export function HeaderCard({ link, onChange, onDelete }: { link: EditableLink; onChange: LinkCardProps["onChange"]; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, style, isDragging } = useSortableCard(link.id)
  return (
    <Card ref={setNodeRef} style={style} size="sm" className={cn("gap-0 py-0", isDragging && "z-10 shadow-lg ring-2 ring-ring/40")}>
      <div className="flex items-center gap-2 p-2.5">
        <button type="button" className="cursor-grab touch-none rounded-sm p-0.5 text-muted-foreground hover:text-foreground" aria-label="Drag to reorder" {...attributes} {...listeners}>
          <GripVerticalIcon className="size-4" />
        </button>
        <Badge variant="outline" className="shrink-0">
          Header
        </Badge>
        <Input
          aria-label="Header text"
          value={link.title}
          placeholder="Section title"
          onChange={(e) => onChange({ title: e.target.value }, { debounce: true })}
          className="h-7 flex-1 border-transparent bg-transparent px-1.5 font-semibold shadow-none hover:border-input dark:bg-transparent"
        />
        <Switch checked={link.enabled} onCheckedChange={(enabled) => onChange({ enabled })} aria-label="Show on page" />
        <Button variant="ghost" size="icon-sm" aria-label="Delete header" className="text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2Icon />
        </Button>
      </div>
    </Card>
  )
}

type LinkCardProps = React.ComponentProps<typeof LinkCard>
