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
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"

export function DeleteAccount() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <Card className="max-w-3xl ring-destructive/30">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Removes your account, every page you own, their links and analytics, and your SocialClaw key. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="border-t">
        <AlertDialog onOpenChange={() => setPassword("")}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account for good?</AlertDialogTitle>
              <AlertDialogDescription>Enter your password to confirm. All of your pages go offline right away.</AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!password || pending}
                onClick={(e) => {
                  e.preventDefault()
                  startTransition(async () => {
                    const res = await authClient.deleteUser({ password })
                    if (res.error) {
                      toast.error(res.error.message ?? "Could not delete the account")
                      return
                    }
                    toast.success("Your account is deleted")
                    router.push("/")
                    router.refresh()
                  })
                }}
              >
                {pending && <Spinner />} Delete account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
