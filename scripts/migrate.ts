import { migrateDatabase } from "../src/lib/db/migrate"

migrateDatabase()
  .then(() => {
    console.log("Database is up to date")
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
