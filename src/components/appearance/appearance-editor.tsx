"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, RotateCcwIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"
import type { BioLink } from "@/components/bio/bio-page"
import { PhonePreview } from "@/components/links/phone-preview"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldSet, FieldLegend } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { updateProfile, updateTheme } from "@/lib/actions/pages"
import { resizeImage } from "@/lib/image"
import { backgroundCss, buttonCss, FONTS, PRESETS, type PageTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { ColorField } from "./color-field"

type Profile = { displayName: string; bio: string; avatar: string | null }

export function AppearanceEditor({
  pageId,
  initialProfile,
  initialTheme,
  links,
  showBranding,
}: {
  pageId: string
  initialProfile: Profile
  initialTheme: PageTheme
  links: BioLink[]
  showBranding: boolean
}) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [theme, setTheme] = useState(initialTheme)
  const [saving, startSaving] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const dirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(initialProfile) || JSON.stringify(theme) !== JSON.stringify(initialTheme),
    [profile, theme, initialProfile, initialTheme]
  )

  const patchTheme = (patch: Partial<PageTheme>) => setTheme((t) => ({ ...t, ...patch, preset: "custom" }))

  function save() {
    startSaving(async () => {
      const [a, b] = await Promise.all([updateProfile(pageId, profile), updateTheme(pageId, theme)])
      const err = !a.ok ? a.error : !b.ok ? b.error : null
      if (err) {
        toast.error(err)
        return
      }
      toast.success("Appearance saved")
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your photo, name and a short bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {profile.avatar && <AvatarImage src={profile.avatar} alt="" className="object-cover" />}
                  <AvatarFallback className="text-xl">{profile.displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <UploadIcon /> Upload photo
                  </Button>
                  {profile.avatar && (
                    <Button variant="ghost" size="sm" onClick={() => setProfile((p) => ({ ...p, avatar: null }))}>
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
                      const avatar = await resizeImage(file, 320)
                      setProfile((p) => ({ ...p, avatar }))
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not read that image")
                    }
                    e.target.value = ""
                  }}
                />
              </div>
              <Field>
                <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                <Input id="displayName" value={profile.displayName} maxLength={60} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <span className="text-xs tabular-nums text-muted-foreground">{profile.bio.length}/280</span>
                </div>
                <Textarea id="bio" rows={3} maxLength={280} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Themes</CardTitle>
            <CardDescription>Start from a preset, then fine-tune below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRESETS.map(({ name, ...preset }) => {
                const active = theme.preset === preset.preset
                const btn = buttonCss(preset)
                return (
                  <button
                    key={preset.preset}
                    type="button"
                    onClick={() => setTheme(preset)}
                    className={cn(
                      "group flex flex-col gap-2 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    )}
                    aria-pressed={active}
                  >
                    <div
                      className={cn("relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border p-3 transition", active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "group-hover:scale-[1.02]")}
                      style={{ background: backgroundCss(preset) }}
                    >
                      <span className="mb-1 size-6 rounded-full" style={{ background: preset.text, opacity: 0.85 }} />
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-3.5 w-4/5" style={{ ...btn, borderWidth: 1.5, boxShadow: preset.button.style === "shadow" ? `2px 2px 0 ${preset.text}` : undefined }} />
                      ))}
                      {active && (
                        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-3" />
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{name}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customize</CardTitle>
            <CardDescription>Colors, buttons and typography.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <FieldLegend variant="label">Background</FieldLegend>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={theme.background.type}
                  onValueChange={(v) => v && patchTheme({ background: { ...theme.background, type: v as "solid" | "gradient" } })}
                  className="justify-start"
                >
                  <ToggleGroupItem value="solid" className="px-3">Solid</ToggleGroupItem>
                  <ToggleGroupItem value="gradient" className="px-3">Gradient</ToggleGroupItem>
                </ToggleGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField id="bg-from" label={theme.background.type === "gradient" ? "From" : "Color"} value={theme.background.from} onChange={(from) => patchTheme({ background: { ...theme.background, from } })} />
                  {theme.background.type === "gradient" && (
                    <ColorField id="bg-to" label="To" value={theme.background.to} onChange={(to) => patchTheme({ background: { ...theme.background, to } })} />
                  )}
                </div>
                {theme.background.type === "gradient" && (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel>Angle</FieldLabel>
                      <span className="text-xs tabular-nums text-muted-foreground">{theme.background.angle}°</span>
                    </div>
                    <Slider min={0} max={360} step={5} value={[theme.background.angle]} onValueChange={([angle]) => patchTheme({ background: { ...theme.background, angle } })} />
                  </Field>
                )}
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend variant="label">Text</FieldLegend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField id="text" label="Headings" value={theme.text} onChange={(text) => patchTheme({ text })} />
                  <ColorField id="muted" label="Bio and labels" value={theme.muted} onChange={(muted) => patchTheme({ muted })} />
                </div>
                <Field>
                  <FieldLabel>Font</FieldLabel>
                  <Select value={theme.font} onValueChange={(font) => patchTheme({ font: font as PageTheme["font"] })}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => (
                        <SelectItem key={f.key} value={f.key} style={{ fontFamily: f.variable }}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend variant="label">Buttons</FieldLegend>
                <div className="flex flex-wrap gap-6">
                  <Field className="w-auto">
                    <FieldLabel>Style</FieldLabel>
                    <ToggleGroup type="single" variant="outline" size="sm" value={theme.button.style} onValueChange={(v) => v && patchTheme({ button: { ...theme.button, style: v as PageTheme["button"]["style"] } })}>
                      {["fill", "outline", "soft", "shadow"].map((s) => (
                        <ToggleGroupItem key={s} value={s} className="px-3 capitalize">{s}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>
                  <Field className="w-auto">
                    <FieldLabel>Corners</FieldLabel>
                    <ToggleGroup type="single" variant="outline" size="sm" value={theme.button.radius} onValueChange={(v) => v && patchTheme({ button: { ...theme.button, radius: v as PageTheme["button"]["radius"] } })}>
                      {[["none", "Square"], ["md", "Soft"], ["lg", "Round"], ["full", "Pill"]].map(([v, l]) => (
                        <ToggleGroupItem key={v} value={v} className="px-3">{l}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField id="btn-bg" label={theme.button.style === "outline" ? "Border" : "Button"} value={theme.button.bg} onChange={(bg) => patchTheme({ button: { ...theme.button, bg } })} />
                  <ColorField id="btn-fg" label="Button text" value={theme.button.fg} onChange={(fg) => patchTheme({ button: { ...theme.button, fg } })} />
                </div>
                <FieldDescription>Keep enough contrast between the button and its text so links stay readable.</FieldDescription>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <div className={cn("flex items-center gap-2 rounded-xl border bg-background/90 p-2 shadow-lg backdrop-blur transition", !dirty && "pointer-events-none opacity-0 translate-y-2")}>
            <span className="px-2 text-sm text-muted-foreground">Unsaved changes</span>
            <Button variant="ghost" size="sm" onClick={() => { setProfile(initialProfile); setTheme(initialTheme) }}>
              <RotateCcwIcon /> Reset
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving && <Spinner />} Save changes
            </Button>
          </div>
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-6">
          <PhonePreview page={{ ...profile, theme, showBranding, sensitive: false }} links={links} />
        </div>
      </aside>
    </div>
  )
}
