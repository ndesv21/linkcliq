import { z } from "zod"

export const RESERVED_HANDLES = new Set([
  "api", "go", "o", "escape", "dashboard", "sign-in", "sign-up", "signin", "signup", "login", "logout",
  "onboarding", "settings", "admin", "about", "pricing", "docs", "blog", "help", "support", "terms",
  "privacy", "static", "assets", "public", "_next", "favicon.ico", "robots.txt", "sitemap.xml", "linkcliq",
  "www", "app", "new", "edit", "qr", "s", "forgot-password", "reset-password", "report", "icon.svg",
])

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "At least 2 characters")
  .max(30, "At most 30 characters")
  .regex(/^[a-z0-9][a-z0-9_.-]*$/, "Letters, numbers, dots, dashes and underscores only")
  .refine((h) => !RESERVED_HANDLES.has(h), "That handle is reserved")
