"use client"

import { useMemo, useState } from "react"
import { EyeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { planEscape } from "@/lib/escape"
import type { InAppApp } from "@/lib/in-app"
import { EscapeScreen, type EscapeBrand } from "./escape-screen"

const APPS: InAppApp[] = ["TikTok", "Instagram", "Facebook", "Threads", "LinkedIn"]

export function EscapePreview({ brand, pageUrl }: { brand: EscapeBrand; pageUrl: string }) {
  const [app, setApp] = useState<InAppApp>("TikTok")
  const [os, setOs] = useState<"ios" | "android">("ios")
  const plan = useMemo(() => planEscape(app, os, (m) => `${pageUrl}?lc_x=1&lc_m=${m}`), [app, os, pageUrl])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon /> Preview the escape screen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What in-app visitors see</DialogTitle>
          <DialogDescription>The guide visitors get when an app blocks the automatic hop.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <ToggleGroup type="single" size="sm" variant="outline" value={app} onValueChange={(v) => v && setApp(v as InAppApp)}>
            {APPS.map((a) => (
              <ToggleGroupItem key={a} value={a} className="px-2.5">
                {a}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup type="single" size="sm" variant="outline" value={os} onValueChange={(v) => v && setOs(v as "ios" | "android")}>
            <ToggleGroupItem value="ios" className="px-2.5">iPhone</ToggleGroupItem>
            <ToggleGroupItem value="android" className="px-2.5">Android</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="h-[560px] overflow-hidden rounded-2xl border" style={{ zoom: 0.85 }}>
          {plan ? (
            <div className="pointer-events-none h-full [&>div]:min-h-full">
              <EscapeScreen mode="guide" plan={plan} copyUrl={`${pageUrl}?lc_x=1&lc_m=copy`} stayHref="#" brand={brand} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {app} opens links in a Chrome Custom Tab on Android, which already has the visitor&apos;s logins and saved cards. No escape needed.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
