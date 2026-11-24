"use client"

import { useCallback, useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { HeadingIcon, LinkIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import type { BioPageData } from "@/components/bio/bio-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { createLink, deleteLink, reorderLinks, updateLink } from "@/lib/actions/links"
import { isLive } from "@/lib/link-utils"
import { getPlatform, platformFromUrl } from "@/lib/platforms"
import { HeaderCard, LinkCard } from "./link-card"
import { PhonePreview } from "./phone-preview"
import { SocialLinksCard } from "./social-links-card"
import type { EditableLink, LinkPatch } from "./types"

function guessTitle(url: string) {
  const platform = getPlatform(platformFromUrl(url))
  if (platform) return platform.name
  try {
    const host = new URL(/^[a-z]+:/i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "")
    return host.charAt(0).toUpperCase() + host.slice(1)
  } catch {
    return "New link"
  }
}

export function LinksEditor({
  pageId,
  initial,
  sparklines,
  origin,
  preview,
  pageEscapeMode,
}: {
  pageId: string
  initial: EditableLink[]
  sparklines: Record<string, number[]>
  origin: string
  preview: BioPageData
  pageEscapeMode: "off" | "auto" | "guide"
}) {
  const router = useRouter()
  const [links, setLinks] = useState(initial)
  const [newUrl, setNewUrl] = useState("")
  const [adding, setAdding] = useState(false)
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const pendingPatch = useRef(new Map<string, LinkPatch>())

  const [synced, setSynced] = useState(initial)
  if (synced !== initial) {
    setSynced(initial)
    setLinks(initial)
  }

  const blocks = useMemo(() => links.filter((l) => l.kind !== "social"), [links])
  const socials = useMemo(() => links.filter((l) => l.kind === "social"), [links])

  const save = useCallback(
    async (id: string, patch: LinkPatch) => {
      const res = await updateLink(pageId, id, patch)
      if (!res.ok) {
        toast.error(res.error)
        router.refresh()
      }
    },
    [pageId, router]
  )

  const change = useCallback(
    (id: string, patch: LinkPatch, opts?: { debounce?: boolean }) => {
      setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
      if (!opts?.debounce) return void save(id, patch)
      pendingPatch.current.set(id, { ...pendingPatch.current.get(id), ...patch })
      clearTimeout(timers.current.get(id))
      timers.current.set(
        id,
        setTimeout(() => {
          const p = pendingPatch.current.get(id)
          pendingPatch.current.delete(id)
          if (p) save(id, p)
        }, 600)
      )
    },
    [save]
  )

  async function add(kind: "link" | "header" | "social", input: { url?: string; title?: string; platform?: string }) {
    setAdding(true)
    const res = await createLink(pageId, { kind, url: input.url ?? "", title: input.title ?? "", platform: input.platform ?? null })
    setAdding(false)
    if (!res.ok) return toast.error(res.error)
    const row = res.data
    setLinks((prev) => {
      const created: EditableLink = { ...row, startsAt: row.startsAt ? new Date(row.startsAt) : null, endsAt: row.endsAt ? new Date(row.endsAt) : null }
      return kind === "social" ? [...prev, created] : [created, ...prev]
    })
    if (kind === "link") setNewUrl("")
  }

  async function remove(id: string) {
    const before = links
    setLinks((prev) => prev.filter((l) => l.id !== id))
    const res = await deleteLink(pageId, id)
    if (!res.ok) {
      setLinks(before)
      toast.error(res.error)
    }
  }

  const dndId = useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = blocks.findIndex((l) => l.id === active.id)
    const to = blocks.findIndex((l) => l.id === over.id)
    const next = [...arrayMove(blocks, from, to), ...socials]
    setLinks(next)
    reorderLinks(
      pageId,
      next.map((l) => l.id)
    ).then((res) => {
      if (!res.ok) {
        toast.error(res.error)
        router.refresh()
      }
    })
  }

  const liveLinks = links.filter((l) => isLive(l) && (l.kind !== "social" || l.url))

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="@container/editor flex min-w-0 flex-col gap-4">
        <Card size="sm">
          <CardContent>
            <form
              className="flex flex-col gap-2 @md/editor:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                if (!newUrl.trim()) return
                add("link", { url: newUrl.trim(), title: guessTitle(newUrl.trim()) })
              }}
            >
              <InputGroup className="h-10 flex-1">
                <InputGroupAddon>
                  <LinkIcon />
                </InputGroupAddon>
                <InputGroupInput value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Paste a link: shop, video, newsletter, booking page…" aria-label="New link URL" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton type="submit" variant="default" size="sm" disabled={adding || !newUrl.trim()}>
                    {adding ? <Spinner /> : <PlusIcon />} Add link
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <Button type="button" variant="outline" className="h-10" onClick={() => add("header", { title: "New section" })}>
                <HeadingIcon /> Add header
              </Button>
            </form>
          </CardContent>
        </Card>

        {blocks.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LinkIcon />
              </EmptyMedia>
              <EmptyTitle>No links yet</EmptyTitle>
              <EmptyDescription>Paste your first link above. It shows up on your page right away.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
            <SortableContext items={blocks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
                {blocks.map((l) =>
                  l.kind === "header" ? (
                    <HeaderCard key={l.id} link={l} onChange={(p, o) => change(l.id, p, o)} onDelete={() => remove(l.id)} />
                  ) : (
                    <LinkCard
                      key={l.id}
                      link={l}
                      series={sparklines[l.id]}
                      trackedUrl={`${origin}/go/${l.id}`}
                      pageEscapeMode={pageEscapeMode}
                      onChange={(p, o) => change(l.id, p, o)}
                      onDelete={() => remove(l.id)}
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <SocialLinksCard
          socials={socials}
          onAdd={(platform) => add("social", { platform, url: "" })}
          onChange={change}
          onDelete={remove}
        />
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-6">
          <PhonePreview page={preview} links={liveLinks} />
        </div>
      </aside>
    </div>
  )
}
