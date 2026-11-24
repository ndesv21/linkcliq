export type FontKey = "geist" | "inter" | "dm-sans" | "space-grotesk" | "outfit" | "playfair" | "jetbrains"
export type ButtonStyle = "fill" | "outline" | "soft" | "shadow"
export type ButtonRadius = "none" | "md" | "lg" | "full"

export type PageTheme = {
  preset: string
  background: { type: "solid" | "gradient"; from: string; to: string; angle: number }
  text: string
  muted: string
  button: { style: ButtonStyle; radius: ButtonRadius; bg: string; fg: string }
  font: FontKey
}

export const FONTS: { key: FontKey; label: string; variable: string }[] = [
  { key: "geist", label: "Geist", variable: "var(--font-sans)" },
  { key: "inter", label: "Inter", variable: "var(--font-inter)" },
  { key: "dm-sans", label: "DM Sans", variable: "var(--font-dm-sans)" },
  { key: "space-grotesk", label: "Space Grotesk", variable: "var(--font-space-grotesk)" },
  { key: "outfit", label: "Outfit", variable: "var(--font-outfit)" },
  { key: "playfair", label: "Playfair Display", variable: "var(--font-playfair)" },
  { key: "jetbrains", label: "JetBrains Mono", variable: "var(--font-jetbrains)" },
]

export const PRESETS: (PageTheme & { name: string })[] = [
  {
    preset: "paper",
    name: "Paper",
    background: { type: "solid", from: "#fafaf9", to: "#fafaf9", angle: 180 },
    text: "#0c0a09",
    muted: "#57534e",
    button: { style: "fill", radius: "lg", bg: "#0c0a09", fg: "#fafaf9" },
    font: "geist",
  },
  {
    preset: "midnight",
    name: "Midnight",
    background: { type: "gradient", from: "#09090b", to: "#18181b", angle: 180 },
    text: "#fafafa",
    muted: "#a1a1aa",
    button: { style: "outline", radius: "lg", bg: "#fafafa", fg: "#fafafa" },
    font: "geist",
  },
  {
    preset: "sunset",
    name: "Sunset",
    background: { type: "gradient", from: "#f97316", to: "#db2777", angle: 160 },
    text: "#ffffff",
    muted: "#ffedd5",
    button: { style: "soft", radius: "full", bg: "#ffffff", fg: "#ffffff" },
    font: "outfit",
  },
  {
    preset: "ocean",
    name: "Ocean",
    background: { type: "gradient", from: "#0ea5e9", to: "#1e3a8a", angle: 200 },
    text: "#f0f9ff",
    muted: "#bae6fd",
    button: { style: "fill", radius: "full", bg: "#f0f9ff", fg: "#0c4a6e" },
    font: "dm-sans",
  },
  {
    preset: "forest",
    name: "Forest",
    background: { type: "solid", from: "#14532d", to: "#14532d", angle: 180 },
    text: "#fefce8",
    muted: "#bbf7d0",
    button: { style: "fill", radius: "md", bg: "#fefce8", fg: "#14532d" },
    font: "playfair",
  },
  {
    preset: "lilac",
    name: "Lilac",
    background: { type: "gradient", from: "#f5f3ff", to: "#e9d5ff", angle: 180 },
    text: "#3b0764",
    muted: "#6b21a8",
    button: { style: "shadow", radius: "lg", bg: "#ffffff", fg: "#3b0764" },
    font: "dm-sans",
  },
  {
    preset: "brutal",
    name: "Brutal",
    background: { type: "solid", from: "#fde047", to: "#fde047", angle: 180 },
    text: "#000000",
    muted: "#27272a",
    button: { style: "shadow", radius: "none", bg: "#ffffff", fg: "#000000" },
    font: "space-grotesk",
  },
  {
    preset: "terminal",
    name: "Terminal",
    background: { type: "solid", from: "#020617", to: "#020617", angle: 180 },
    text: "#4ade80",
    muted: "#86efac",
    button: { style: "outline", radius: "none", bg: "#4ade80", fg: "#4ade80" },
    font: "jetbrains",
  },
]

export const DEFAULT_THEME: PageTheme = (({ name: _name, ...t }) => t)(PRESETS[0])

export function backgroundCss(theme: PageTheme) {
  const { type, from, to, angle } = theme.background
  return type === "gradient" ? `linear-gradient(${angle}deg, ${from}, ${to})` : from
}

export function fontCss(theme: PageTheme) {
  return FONTS.find((f) => f.key === theme.font)?.variable ?? FONTS[0].variable
}

const RADIUS: Record<ButtonRadius, string> = { none: "0px", md: "10px", lg: "16px", full: "999px" }

export function buttonCss(theme: PageTheme): React.CSSProperties {
  const { style, radius, bg, fg } = theme.button
  const base: React.CSSProperties = { borderRadius: RADIUS[radius], borderWidth: 2, borderStyle: "solid" }
  switch (style) {
    case "fill":
      return { ...base, background: bg, color: fg, borderColor: bg }
    case "outline":
      return { ...base, background: "transparent", color: fg, borderColor: bg }
    case "soft":
      return { ...base, background: `color-mix(in oklab, ${bg} 18%, transparent)`, color: fg, borderColor: "transparent", backdropFilter: "blur(8px)" }
    case "shadow":
      return { ...base, background: bg, color: fg, borderColor: theme.text, boxShadow: `4px 4px 0 ${theme.text}` }
  }
}
