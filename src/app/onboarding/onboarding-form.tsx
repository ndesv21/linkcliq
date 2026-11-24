"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { checkHandle, createPage } from "@/lib/actions/pages"

export function OnboardingForm({ host, defaultName, isNew }: { host: string; defaultName: string; isNew: boolean }) {
  const router = useRouter()
  const [handle, setHandle] = useState("")
  const [name, setName] = useState(defaultName)
  const [checked, setChecked] = useState<{ handle: string; available: boolean; reason?: string } | null>(null)
  const status = checked && checked.handle === handle ? checked : null
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!handle) return
    const t = setTimeout(async () => {
      const res = await checkHandle(handle)
      if (res.ok) setChecked({ handle, ...res.data })
    }, 300)
    return () => clearTimeout(t)
  }, [handle])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">{isNew ? "Create another page" : "Claim your link"}</CardTitle>
        <CardDescription>Pick the address you will put in your bio. You can change it later.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            startTransition(async () => {
              const res = await createPage({ handle, displayName: name })
              if (!res.ok) return setError(res.error)
              router.push("/dashboard/links")
              router.refresh()
            })
          }}
        >
          <FieldGroup>
            <Field data-invalid={status && !status.available ? true : undefined}>
              <FieldLabel htmlFor="handle">Your link</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>{host}/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  placeholder="yourname"
                  autoFocus
                  required
                  aria-invalid={status && !status.available ? true : undefined}
                />
                <InputGroupAddon align="inline-end">
                  {status?.available && <CheckIcon className="text-chart-3" />}
                  {status && !status.available && <XIcon className="text-destructive" />}
                </InputGroupAddon>
              </InputGroup>
              {status && !status.available ? <FieldError>{status.reason}</FieldError> : <FieldDescription>Letters, numbers, dots, dashes and underscores.</FieldDescription>}
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Display name</FieldLabel>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <Button type="submit" disabled={pending || !status?.available || !name.trim()}>
              {pending && <Spinner />}
              Create page
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
