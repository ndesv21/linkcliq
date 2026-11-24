import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { count, desc, eq, like, or, sql } from "drizzle-orm"
import { SearchIcon } from "lucide-react"
import { SuspendButton } from "@/components/admin/suspend-button"
import { SiteHeader } from "@/components/dashboard/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPublicOrigin } from "@/lib/dashboard"
import { db } from "@/lib/db"
import { events, links, pages, user } from "@/lib/db/schema"
import { isAdminEmail } from "@/lib/env"
import { fmtNumber } from "@/lib/format"
import { requirePage } from "@/lib/pages"

export const metadata = { title: "Admin" }

const WEEK = 7 * 24 * 60 * 60 * 1000

async function getAdminData(q: string) {
  const since = Date.now() - WEEK
  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: pages.id,
        handle: pages.handle,
        displayName: pages.displayName,
        published: pages.published,
        suspendedAt: pages.suspendedAt,
        createdAt: pages.createdAt,
        email: user.email,
        views: sql<number>`(select count(*) from ${events} where ${events.pageId} = ${pages.id} and ${events.type} = 'view' and ${events.createdAt} >= ${since})`,
        links: sql<number>`(select count(*) from ${links} where ${links.pageId} = ${pages.id} and ${links.kind} = 'link')`,
      })
      .from(pages)
      .innerJoin(user, eq(user.id, pages.userId))
      .where(q ? or(like(pages.handle, `%${q}%`), like(user.email, `%${q}%`), like(pages.displayName, `%${q}%`)) : undefined)
      .orderBy(desc(pages.createdAt))
      .limit(200),
    db
      .select({
        users: sql<number>`(select count(*) from ${user})`,
        pages: count(),
        suspended: sql<number>`sum(case when ${pages.suspendedAt} is not null then 1 else 0 end)`,
      })
      .from(pages),
  ])
  return { rows, totals }
}

export default async function AdminPage({ searchParams }: PageProps<"/dashboard/admin">) {
  const { user: me, page } = await requirePage()
  if (!isAdminEmail(me.email)) notFound()

  const { q: rawQ } = await searchParams
  const q = typeof rawQ === "string" ? rawQ.trim().toLowerCase() : ""
  const [{ rows, totals }, origin] = await Promise.all([getAdminData(q), getPublicOrigin()])

  const stats = [
    { label: "Accounts", value: totals?.users ?? 0 },
    { label: "Pages", value: totals?.pages ?? 0 },
    { label: "Suspended", value: totals?.suspended ?? 0 },
  ]

  return (
    <>
      <SiteHeader title="Admin" pageUrl={`${origin}/${page.handle}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">{fmtNumber(Number(s.value))}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-1.5">
              <CardTitle>Pages on this instance</CardTitle>
              <CardDescription>Suspending a page takes it offline for visitors. Its owner cannot republish it.</CardDescription>
            </div>
            <form action="/dashboard/admin" className="w-full sm:w-72">
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput name="q" defaultValue={q} placeholder="Handle, name or email" aria-label="Search pages" />
              </InputGroup>
            </form>
          </CardHeader>
          <CardContent className="px-0">
            {rows.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No pages found</EmptyTitle>
                  <EmptyDescription>{q ? `Nothing matches "${q}".` : "Nobody has created a page yet."}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Page</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Views 7d</TableHead>
                    <TableHead className="text-right">Links</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="pl-6">
                        <Link href={`/${r.handle}`} target="_blank" className="font-medium hover:underline">
                          /{r.handle}
                        </Link>
                        <div className="text-xs text-muted-foreground">{r.displayName}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{format(r.createdAt, "d MMM yyyy")}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNumber(Number(r.views))}</TableCell>
                      <TableCell className="text-right tabular-nums">{Number(r.links)}</TableCell>
                      <TableCell>
                        {r.suspendedAt ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : r.published ? (
                          <Badge variant="secondary">Live</Badge>
                        ) : (
                          <Badge variant="outline">Unpublished</Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <SuspendButton pageId={r.id} handle={r.handle} suspended={Boolean(r.suspendedAt)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
