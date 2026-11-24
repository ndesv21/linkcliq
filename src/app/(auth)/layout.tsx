import Link from "next/link"
import { redirect } from "next/navigation"
import { ActivityIcon } from "lucide-react"
import { getSession } from "@/lib/auth"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getSession()) redirect("/dashboard")
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ActivityIcon className="size-4" />
          </span>
          LinkCliq
        </Link>
        {children}
      </div>
    </div>
  )
}
