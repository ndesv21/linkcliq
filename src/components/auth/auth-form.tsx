"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { signIn, signUp } from "@/lib/auth-client"

export function AuthForm({
  mode,
  signupDisabled = false,
  resetEnabled = false,
  legal = false,
}: {
  mode: "sign-in" | "sign-up"
  signupDisabled?: boolean
  resetEnabled?: boolean
  legal?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const isSignUp = mode === "sign-up"

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email"))
    const password = String(form.get("password"))
    const name = String(form.get("name") ?? "")
    setError(null)
    startTransition(async () => {
      const res = isSignUp ? await signUp.email({ email, password, name }) : await signIn.email({ email, password })
      if (res.error) {
        setError(res.error.message ?? "Something went wrong")
        return
      }
      router.push(isSignUp ? "/onboarding" : "/dashboard")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{isSignUp ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignUp ? "Your link in bio, click analytics and browser escape. Free and open source." : "Sign in to your LinkCliq dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSignUp && signupDisabled ? (
          <FieldDescription className="text-center">
            Sign-ups are closed on this instance. Ask the owner for an account or{" "}
            <Link href="/sign-in" className="underline">
              sign in
            </Link>
            .
          </FieldDescription>
        ) : (
          <form onSubmit={onSubmit}>
            <FieldGroup>
              {isSignUp && (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" name="name" autoComplete="name" placeholder="Maya Chen" required />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              </Field>
              <Field data-invalid={error ? true : undefined}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  {!isSignUp && resetEnabled && (
                    <Link href="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  minLength={8}
                  required
                  aria-invalid={error ? true : undefined}
                />
                {isSignUp && !error && <FieldDescription>At least 8 characters.</FieldDescription>}
                {error && <FieldError>{error}</FieldError>}
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending && <Spinner />}
                  {isSignUp ? "Create account" : "Sign in"}
                </Button>
                <FieldDescription className="text-center">
                  {isSignUp ? (
                    <>
                      Already have an account? <Link href="/sign-in">Sign in</Link>
                    </>
                  ) : (
                    <>
                      New here? <Link href="/sign-up">Create an account</Link>
                    </>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
      {isSignUp && legal && !signupDisabled && (
        <CardFooter className="justify-center text-center text-xs text-muted-foreground">
          <p>
            By creating an account you agree to the{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      )}
    </Card>
  )
}
