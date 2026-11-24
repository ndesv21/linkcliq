import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { db, schema } from "@/lib/db"
import { resetPasswordEmail, sendEmail } from "@/lib/email"
import { authSecret, emailEnabled, ipAddressHeaders } from "@/lib/env"

const ipHeaders = ipAddressHeaders()

export const auth = betterAuth({
  appName: "LinkCliq",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.PUBLIC_URL,
  secret: authSecret(),
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean),
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    disableSignUp: process.env.DISABLE_SIGNUP === "true",
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: emailEnabled()
      ? async ({ user, url }) => {
          await sendEmail(resetPasswordEmail(user, url))
        }
      : undefined,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: { deleteUser: { enabled: true } },
  advanced: ipHeaders ? { ipAddress: { ipAddressHeaders: ipHeaders } } : undefined,
  telemetry: { enabled: false },
  logger: { level: process.env.NEXT_PHASE === "phase-production-build" ? "error" : "warn" },
  plugins: [nextCookies()],
})

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireUser() {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  return session.user
}
