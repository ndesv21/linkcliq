import { join } from "node:path"
import { migrate } from "drizzle-orm/libsql/migrator"
import { db } from "./index"

export async function migrateDatabase() {
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") })
}
