"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRightIcon, KeyRoundIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { connectSocialClaw, disconnectSocialClaw } from "@/lib/actions/socialclaw"
import { socialclawHref } from "@/lib/env"

export function ConnectForm({ onConnected }: { onConnected?: () => void } = {}) {
  const router = useRouter()
  const [key, setKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
          const res = await connectSocialClaw(key)
          if (!res.ok) {
            setError(res.error)
            return
          }
          toast.success(res.data.workspace ? `Connected to ${res.data.workspace}` : "SocialClaw connected")
          setKey("")
          onConnected?.()
          router.refresh()
        })
      }}
    >
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="sc-key">SocialClaw API key</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <KeyRoundIcon />
          </InputGroupAddon>
          <InputGroupInput id="sc-key" type="password" autoComplete="off" placeholder="sc_live_…" value={key} onChange={(e) => setKey(e.target.value)} aria-invalid={error ? true : undefined} />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="default" size="sm" disabled={pending || key.trim().length < 10}>
              {pending && <Spinner />} Connect
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <FieldDescription>
            Create one in SocialClaw under API keys. It is encrypted at rest and only ever sent to SocialClaw.{" "}
            <a href={socialclawHref("integrations_get_key")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5">
              Get a key <ArrowUpRightIcon className="size-3" />
            </a>
          </FieldDescription>
        )}
      </Field>
    </form>
  )
}

export function DisconnectButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await disconnectSocialClaw()
          if (!res.ok) {
            toast.error(res.error)
            return
          }
          toast.success("SocialClaw disconnected")
          router.refresh()
        })
      }
    >
      {pending && <Spinner />} Disconnect
    </Button>
  )
}
