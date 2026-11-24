import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { getPublicOrigin } from "@/lib/dashboard"
import { getUserPages } from "@/lib/pages"
import { OnboardingForm } from "./onboarding-form"

export const metadata = { title: "Claim your link" }

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser()
  const [pages, sp, origin] = await Promise.all([getUserPages(user.id), searchParams, getPublicOrigin()])
  const isNew = sp.new === "1"
  if (pages.length > 0 && !isNew) redirect("/dashboard")
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <OnboardingForm host={new URL(origin).host} defaultName={user.name} isNew={isNew} />
    </div>
  )
}
