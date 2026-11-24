const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat("en")
let regionNames: Intl.DisplayNames | null = null

export function fmtNumber(n: number) {
  return n >= 10_000 ? compact.format(n) : whole.format(n)
}

export function fmtPercent(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`
}

export function delta(current: number, previous: number) {
  if (!previous) return current ? 1 : 0
  return (current - previous) / previous
}

export function countryName(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return code
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" })
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

export function countryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐"
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)))
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
