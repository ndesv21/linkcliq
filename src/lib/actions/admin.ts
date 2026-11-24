"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { fail, ok, type ActionResult } from "@/lib/action-result"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { pages } from "@/lib/db/schema"
import { isAdminEmail } from "@/lib/env"

export async function setPageSuspended(pageId: string, suspended: boolean): Promise<ActionResult> {
  try {
    const user = await requireUser()
    if (!isAdminEmail(user.email)) throw new Error("Not allowed")
    const [page] = await db
      .update(pages)
      .set({ suspendedAt: suspended ? new Date() : null, updatedAt: new Date() })
      .where(eq(pages.id, pageId))
      .returning({ handle: pages.handle })
    if (!page) throw new Error("Page not found")
    revalidatePath("/dashboard/admin")
    revalidatePath(`/${page.handle}`)
    return ok(undefined)
  } catch (e) {
    return fail(e)
  }
}
