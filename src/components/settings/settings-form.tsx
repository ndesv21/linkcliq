"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { BanIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { deletePage, updateSettings } from "@/lib/actions/pages"

type Settings = {
  handle: string
  seoTitle: string
  seoDescription: string
  sensitive: boolean
  showBranding: boolean
  published: boolean
  gaMeasurementId: string
  metaPixelId: string
}

export function SettingsForm({
  pageId,
  host,
  initial,
  suspended = false,
}: {
  pageId: string
  host: string
  initial: Settings
  suspended?: boolean
}) {
  const router = useRouter()
  const [s, setS] = useState(initial)
  const [saving, startSaving] = useTransition()
  const [deleting, startDeleting] = useTransition()
  const [confirm, setConfirm] = useState("")
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }))
  const dirty = JSON.stringify(s) !== JSON.stringify(initial)

  function save() {
    startSaving(async () => {
      const res = await updateSettings(pageId, {
        ...s,
        seoTitle: s.seoTitle || null,
        seoDescription: s.seoDescription || null,
        gaMeasurementId: s.gaMeasurementId,
        metaPixelId: s.metaPixelId,
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Settings saved")
      router.refresh()
    })
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {suspended && (
        <Alert variant="destructive">
          <BanIcon />
          <AlertTitle>This page is suspended</AlertTitle>
          <AlertDescription>
            An admin took /{initial.handle} offline for breaking the terms of this instance. Visitors see a 404 and its links do not redirect. Contact the instance owner to appeal.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Page</CardTitle>
          <CardDescription>Address, visibility and branding.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="handle">Address</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>{host}/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="handle" value={s.handle} onChange={(e) => set("handle", e.target.value.toLowerCase().replace(/\s+/g, ""))} />
              </InputGroup>
              <FieldDescription>Changing it breaks the old address everywhere you posted it. Tracked /go links keep working.</FieldDescription>
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="published">Published</FieldLabel>
                <FieldDescription>Unpublished pages return a 404 to visitors.</FieldDescription>
              </FieldContent>
              <Switch id="published" checked={s.published && !suspended} disabled={suspended} onCheckedChange={(v) => set("published", v)} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="sensitive">Sensitive content warning</FieldLabel>
                <FieldDescription>Visitors confirm they are over 18 before links appear. The page is also hidden from search engines.</FieldDescription>
              </FieldContent>
              <Switch id="sensitive" checked={s.sensitive} onCheckedChange={(v) => set("sensitive", v)} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="branding">Show &ldquo;Made with LinkCliq&rdquo;</FieldLabel>
                <FieldDescription>Optional. LinkCliq is free either way.</FieldDescription>
              </FieldContent>
              <Switch id="branding" checked={s.showBranding} onCheckedChange={(v) => set("showBranding", v)} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search and sharing</CardTitle>
          <CardDescription>How your page looks in Google and in link previews.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="seoTitle">Title</FieldLabel>
              <Input id="seoTitle" maxLength={70} placeholder="Defaults to your name" value={s.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="seoDescription">Description</FieldLabel>
              <Textarea id="seoDescription" maxLength={160} rows={2} placeholder="Defaults to your bio" value={s.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
              <FieldDescription>{s.seoDescription.length}/160</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking pixels</CardTitle>
          <CardDescription>Send page views to your own analytics and ad accounts as well.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="ga">Google Analytics 4</FieldLabel>
              <Input id="ga" placeholder="G-XXXXXXXXXX" value={s.gaMeasurementId} onChange={(e) => set("gaMeasurementId", e.target.value.trim())} />
            </Field>
            <Field>
              <FieldLabel htmlFor="pixel">Meta Pixel</FieldLabel>
              <Input id="pixel" placeholder="123456789012345" inputMode="numeric" value={s.metaPixelId} onChange={(e) => set("metaPixelId", e.target.value.trim())} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={!dirty || saving}>
          {saving && <Spinner />} Save settings
        </Button>
      </div>

      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle>Delete page</CardTitle>
          <CardDescription>Removes the page, its links and all of its analytics. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardFooter className="border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete /{initial.handle}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete /{initial.handle} for good?</AlertDialogTitle>
                <AlertDialogDescription>Type the handle to confirm. Every link and every recorded visit will be removed.</AlertDialogDescription>
              </AlertDialogHeader>
              <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={initial.handle} aria-label="Confirm handle" />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={confirm !== initial.handle || deleting}
                  onClick={(e) => {
                    e.preventDefault()
                    startDeleting(async () => {
                      const res = await deletePage(pageId)
                      if (!res.ok) {
                        toast.error(res.error)
                        return
                      }
                      router.push("/dashboard")
                      router.refresh()
                    })
                  }}
                >
                  {deleting && <Spinner />} Delete page
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  )
}
