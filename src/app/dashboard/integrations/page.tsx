import { redirect } from "next/navigation"

export default function IntegrationsPage() {
  redirect("/dashboard/calendar?settings=1")
}
