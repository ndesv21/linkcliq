import { readFileSync } from "node:fs"
import { isIP } from "node:net"
import { join } from "node:path"
import { Reader, type CountryResponse } from "maxmind"

// Country lookup for hosts without a CDN country header (Railway, a plain VPS).
// Data: DB-IP Lite, CC BY 4.0. The dashboard credits it as required.
const DB_FILE = join(process.cwd(), "node_modules/@ip-location-db/dbip-country-mmdb/dbip-country.mmdb")

// The DB-IP file stores a flat { country_code } record, not MaxMind's nested shape.
type DbIpRecord = { country_code?: string }

let reader: Reader<CountryResponse> | null | undefined

function getReader() {
  if (reader === undefined) {
    try {
      reader = new Reader<CountryResponse>(readFileSync(DB_FILE))
    } catch {
      reader = null
    }
  }
  return reader
}

export function countryFromIp(ip: string): string | null {
  if (!isIP(ip)) return null
  try {
    const code = (getReader()?.get(ip) as DbIpRecord | null | undefined)?.country_code
    return code && /^[A-Z]{2}$/.test(code) ? code : null
  } catch {
    return null
  }
}
