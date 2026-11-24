"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { updateEscape } from "@/lib/actions/pages"

const MODES = [
  {
    value: "auto",
    title: "Auto",
    badge: "Recommended",
    description: "Fires the verified method for each app (Instagram and Threads on iPhone, most Meta apps on Android, LINE, WhatsApp, Telegram). Shows the guide if it does not land within 1.4 seconds.",
  },
  {
    value: "guide",
    title: "Guide only",
    description: "Never fires anything automatically. Shows a one-tap button and a pointer to the app's menu. Calmer, slightly lower escape rate.",
  },
  {
    value: "off",
    title: "Off",
    description: "Visitors stay in the in-app browser. Use this if your audience rarely buys or signs in.",
  },
] as const

export function EscapeSettings({ pageId, mode, skipAds }: { pageId: string; mode: "off" | "auto" | "guide"; skipAds: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState(mode)
  const [ads, setAds] = useState(skipAds)
  const [pending, startTransition] = useTransition()
  const dirty = value !== mode || ads !== skipAds

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escape mode for this page</CardTitle>
        <CardDescription>
          Applies when someone opens your page from a TikTok, Instagram, Facebook, Threads, LinkedIn or Snapchat bio. You can override it per link in Links.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <RadioGroup value={value} onValueChange={(v) => setValue(v as typeof value)} className="grid gap-3 @3xl/main:grid-cols-3">
            {MODES.map((m) => (
              <FieldLabel key={m.value} htmlFor={`mode-${m.value}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>
                      {m.title}
                      {"badge" in m && <Badge variant="secondary">{m.badge}</Badge>}
                    </FieldTitle>
                    <FieldDescription>{m.description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={m.value} id={`mode-${m.value}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="skip-ads">Skip paid ad traffic</FieldLabel>
              <FieldDescription>
                Visitors with ttclid, gclid or a paid utm_medium go straight through. Meta and TikTok ad policies require reviewers and ad clicks to land on the real page.
              </FieldDescription>
            </FieldContent>
            <Switch id="skip-ads" checked={ads} onCheckedChange={setAds} />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button
          disabled={!dirty || pending}
          onClick={() =>
            startTransition(async () => {
              const res = await updateEscape(pageId, { escapeMode: value, escapeSkipAds: ads })
              if (!res.ok) {
                toast.error(res.error)
                return
              }
              toast.success(value === "off" ? "Browser escape turned off" : "Browser escape saved")
              router.refresh()
            })
          }
        >
          {pending && <Spinner />} Save
        </Button>
      </CardFooter>
    </Card>
  )
}
