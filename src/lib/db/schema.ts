import { sql } from "drizzle-orm"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date()),
}

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  ...timestamps,
})

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_idx").on(t.userId)]
)

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_idx").on(t.userId)]
)

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  ...timestamps,
})

export type EscapeMode = "off" | "auto" | "guide"

export const pages = sqliteTable(
  "pages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    handle: text("handle").notNull().unique(),
    displayName: text("display_name").notNull(),
    bio: text("bio").notNull().default(""),
    avatar: text("avatar"),
    theme: text("theme", { mode: "json" }).$type<import("@/lib/themes").PageTheme>().notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    sensitive: integer("sensitive", { mode: "boolean" }).notNull().default(false),
    showBranding: integer("show_branding", { mode: "boolean" }).notNull().default(true),
    escapeMode: text("escape_mode").$type<EscapeMode>().notNull().default("off"),
    escapeSkipAds: integer("escape_skip_ads", { mode: "boolean" }).notNull().default(true),
    gaMeasurementId: text("ga_measurement_id"),
    metaPixelId: text("meta_pixel_id"),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    /** Set by an admin to take a page down. Owners cannot undo it. */
    suspendedAt: integer("suspended_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (t) => [index("pages_user_idx").on(t.userId)]
)

export type LinkKind = "link" | "header" | "social"
export type LinkHighlight = "none" | "pulse" | "wobble" | "glow"

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    kind: text("kind").$type<LinkKind>().notNull().default("link"),
    title: text("title").notNull().default(""),
    url: text("url").notNull().default(""),
    platform: text("platform"),
    thumbnail: text("thumbnail"),
    position: integer("position").notNull().default(0),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    highlight: text("highlight").$type<LinkHighlight>().notNull().default("none"),
    escapeMode: text("escape_mode").$type<EscapeMode | "inherit">().notNull().default("inherit"),
    appendUtm: integer("append_utm", { mode: "boolean" }).notNull().default(false),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (t) => [index("links_page_idx").on(t.pageId, t.position)]
)

export type EventType = "view" | "click" | "escape"

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    linkId: text("link_id"),
    type: text("type").$type<EventType>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    visitorId: text("visitor_id").notNull(),
    source: text("source").notNull().default("Direct"),
    referrer: text("referrer"),
    inApp: text("in_app"),
    escapeMethod: text("escape_method"),
    country: text("country"),
    device: text("device"),
    browser: text("browser"),
    os: text("os"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
  },
  (t) => [
    index("events_page_time_idx").on(t.pageId, t.createdAt),
    index("events_link_time_idx").on(t.linkId, t.createdAt),
  ]
)

export const integrations = sqliteTable("integrations", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  socialclawKey: text("socialclaw_key"),
  socialclawWorkspace: text("socialclaw_workspace"),
  ...timestamps,
})

export type Page = typeof pages.$inferSelect
export type Link = typeof links.$inferSelect
export type Event = typeof events.$inferSelect
