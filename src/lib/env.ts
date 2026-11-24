export const APP_NAME = "LinkCliq"
export const GITHUB_URL = "https://github.com/ndesv21/linkcliq"
export const SOCIALCLAW_URL = "https://getsocialclaw.com"
export const SOCIALCLAW_API = process.env.SOCIALCLAW_API_URL ?? "https://getsocialclaw.com"

export function socialclawHref(campaign: string, path = "/") {
  const url = new URL(path, SOCIALCLAW_URL)
  url.searchParams.set("utm_source", "linkcliq")
  url.searchParams.set("utm_medium", "oss")
  url.searchParams.set("utm_campaign", campaign)
  return url.toString()
}

export function appUrl() {
  return (process.env.BETTER_AUTH_URL ?? process.env.PUBLIC_URL ?? "http://localhost:3000").replace(/\/$/, "")
}

export function authSecret() {
  const secret = process.env.BETTER_AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("BETTER_AUTH_SECRET is required in production. Generate one with: openssl rand -base64 32")
  }
  return "linkcliq-dev-secret-change-me-in-production"
}

export const SITE_URL = "https://linkcliq.com"

/** The official hosted service at linkcliq.com. Turns on the Terms and Privacy pages. */
export function isCloud() {
  return process.env.LINKCLIQ_CLOUD === "true"
}

/** Password reset emails need a Resend API key and a verified sender. */
export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

/** Where abuse reports and privacy requests go. Optional. */
export function contactEmail() {
  return process.env.CONTACT_EMAIL?.trim() || null
}

/** Accounts that can open /dashboard/admin to unpublish pages. */
export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  return admins.includes(email.toLowerCase())
}

/**
 * Headers the auth rate limiter trusts for the visitor's IP. Only list headers your proxy
 * overwrites, or visitors can fake them. Railway's edge replaces X-Real-IP, so it is the
 * default there; elsewhere Better Auth's own default (X-Forwarded-For) applies.
 */
export function ipAddressHeaders() {
  const custom = process.env.IP_ADDRESS_HEADERS?.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean)
  if (custom?.length) return custom
  if (process.env.RAILWAY_ENVIRONMENT_ID) return ["x-real-ip"]
  return undefined
}
