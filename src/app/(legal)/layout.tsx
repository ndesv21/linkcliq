import Link from "next/link"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import { ActivityIcon } from "lucide-react"
import { isCloud } from "@/lib/env"

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  // Read the env at request time: the Docker build does not know whether this is linkcliq.com.
  await connection()
  if (!isCloud()) notFound()
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ActivityIcon className="size-4" />
            </span>
            LinkCliq
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </nav>
        </div>
      </header>
      <article className="mx-auto max-w-2xl px-4 py-12 text-[15px] leading-7 [&_a]:underline [&_a]:underline-offset-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:text-muted-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted-foreground">
        {children}
      </article>
    </div>
  )
}
