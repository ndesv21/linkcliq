import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

export async function GET() {
  try {
    await db.run(sql`select 1`)
    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } })
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "cache-control": "no-store" } })
  }
}
