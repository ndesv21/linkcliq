"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MailCheckIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get("email"))
    setError(null)
    startTransition(async () => {
      const res = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
      if (res.error) {
        setError(res.error.message ?? "Could not send the email. Try again in a minute.")
        return
      }
      setSentTo(email)
    })
  }

  if (sentTo) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
            <MailCheckIcon className="size-5" />
          </div>
          <CardTitle className="text-xl">Check your inbox</CardTitle>
          <CardDescription>
            If an account exists for {sentTo}, we sent it a link to choose a new password. The link works for one hour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>Enter your account email and we will send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-invalid={error ? true : undefined} />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner />}
                Send reset link
              </Button>
              <FieldDescription className="text-center">
                Remembered it? <Link href="/sign-in">Sign in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">This link has expired</CardTitle>
          <CardDescription>Reset links work once and only for one hour. Ask for a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/forgot-password">Send a new link</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password"))
    if (password !== String(form.get("confirm"))) {
      setError("The passwords do not match")
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await authClient.resetPassword({ newPassword: password, token: token! })
      if (res.error) {
        setError(res.error.message ?? "Could not reset the password. Ask for a new link.")
        return
      }
      toast.success("Password updated. Sign in with your new password.")
      router.push("/sign-in")
    })
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Choose a new password</CardTitle>
        <CardDescription>You will be signed out on every other device.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
              <FieldDescription>At least 8 characters.</FieldDescription>
            </Field>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="confirm">Repeat it</FieldLabel>
              <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required aria-invalid={error ? true : undefined} />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner />}
                Save new password
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
