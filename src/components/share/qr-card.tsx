"use client"

import { useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"
import { DownloadIcon } from "lucide-react"
import { ColorField } from "@/components/appearance/color-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

export function QrCard({ pageUrl, handle }: { pageUrl: string; handle: string }) {
  const [fg, setFg] = useState("#0a0a0a")
  const [bg, setBg] = useState("#ffffff")
  const [tag, setTag] = useState(true)
  const [svg, setSvg] = useState("")
  const url = useMemo(() => (tag ? `${pageUrl}?utm_source=qr` : pageUrl), [pageUrl, tag])
  const valid = /^#[0-9a-f]{6}$/i.test(fg) && /^#[0-9a-f]{6}$/i.test(bg)

  useEffect(() => {
    if (!valid) return
    QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: fg, light: bg } }).then(setSvg)
  }, [url, fg, bg, valid])

  async function download(kind: "png" | "svg") {
    const a = document.createElement("a")
    a.download = `${handle}-qr.${kind}`
    a.href =
      kind === "png"
        ? await QRCode.toDataURL(url, { width: 1200, margin: 2, errorCorrectionLevel: "M", color: { dark: fg, light: bg } })
        : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR code</CardTitle>
        <CardDescription>For posters, packaging, business cards and slides.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 @2xl/main:grid-cols-[220px_1fr]">
        <div className="mx-auto size-[220px] overflow-hidden rounded-xl border p-2" style={{ background: bg }}>
          <div className="size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField id="qr-fg" label="Code" value={fg} onChange={setFg} />
            <ColorField id="qr-bg" label="Background" value={bg} onChange={setBg} />
          </div>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="qr-tag">Track scans separately</FieldLabel>
              <FieldDescription>Adds utm_source=qr so scans show up as &ldquo;QR code&rdquo; in Sources.</FieldDescription>
            </FieldContent>
            <Switch id="qr-tag" checked={tag} onCheckedChange={setTag} />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="gap-2 border-t">
        <Button onClick={() => download("png")} disabled={!svg}>
          <DownloadIcon /> PNG
        </Button>
        <Button variant="outline" onClick={() => download("svg")} disabled={!svg}>
          <DownloadIcon /> SVG
        </Button>
      </CardFooter>
    </Card>
  )
}
