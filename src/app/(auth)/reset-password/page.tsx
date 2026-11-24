import { ResetPasswordForm } from "@/components/auth/password-reset"

export const metadata = { title: "Choose a new password" }

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token, error } = await searchParams
  const valid = typeof token === "string" && token.length > 0 && !error
  return <ResetPasswordForm token={valid ? token : null} />
}
