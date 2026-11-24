export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  if (process.env.SKIP_MIGRATIONS === "true") return
  const { migrateDatabase } = await import("./lib/db/migrate")
  await migrateDatabase()
}
