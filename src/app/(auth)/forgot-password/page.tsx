import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/password-reset"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { emailEnabled } from "@/lib/env"

export const metadata = { title: "Reset your password" }

export default function ForgotPasswordPage() {
  if (emailEnabled()) return <ForgotPasswordForm />
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Password reset is off</CardTitle>
        <CardDescription>
          This instance has no email sender set up. Ask whoever runs it to reset your password, or{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            go back to sign in
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
