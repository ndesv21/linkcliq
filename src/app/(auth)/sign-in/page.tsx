import { AuthForm } from "@/components/auth/auth-form"
import { emailEnabled } from "@/lib/env"

export const metadata = { title: "Sign in" }

export default function SignInPage() {
  return <AuthForm mode="sign-in" resetEnabled={emailEnabled()} />
}
