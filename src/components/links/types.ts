import type { EscapeMode, LinkHighlight, LinkKind } from "@/lib/db/schema"

export type EditableLink = {
  id: string
  kind: LinkKind
  title: string
  url: string
  platform: string | null
  thumbnail: string | null
  position: number
  enabled: boolean
  highlight: LinkHighlight
  escapeMode: EscapeMode | "inherit"
  appendUtm: boolean
  startsAt: Date | null
  endsAt: Date | null
}

export type LinkPatch = Partial<Omit<EditableLink, "id" | "kind" | "position">>
