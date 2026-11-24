import { AuthForm } from "@/components/auth/auth-form"
import { isCloud } from "@/lib/env"

export const metadata = { title: "Create account" }

export default function SignUpPage() {
  return <AuthForm mode="sign-up" signupDisabled={process.env.DISABLE_SIGNUP === "true"} legal={isCloud()} />
}
