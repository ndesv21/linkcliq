export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

export function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: typeof error === "string" ? error : "Something went wrong" }
}
