"use client"

import { useTransition } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { setPageSuspended } from "@/lib/actions/admin"

export function SuspendButton({ pageId, handle, suspended }: { pageId: string; handle: string; suspended: boolean }) {
  const [pending, startTransition] = useTransition()

  function run(next: boolean) {
    startTransition(async () => {
      const res = await setPageSuspended(pageId, next)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(next ? `/${handle} is offline` : `/${handle} is back online`)
    })
  }

  if (suspended) {
    return (
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(false)}>
        {pending && <Spinner />}
        Restore
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={pending}>
          {pending && <Spinner />}
          Suspend
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend /{handle}?</AlertDialogTitle>
          <AlertDialogDescription>
            Visitors get a 404 and its tracked links stop redirecting. The owner keeps their account and data but cannot republish the page. You can restore it at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => run(true)}>
            Suspend page
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
