import type { AddressInfo } from "node:net"
import { createApp } from "../src/app.ts"
import { connectMigrator } from "../scripts/lib/db.ts"

export async function startServer() {
  const server = createApp().listen(0, "127.0.0.1")
  await new Promise((r) => server.once("listening", r))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  return { base, close: () => new Promise<void>((r) => server.close(() => r())) }
}

/** A tiny fetch wrapper that behaves like a browser: keeps cookies, sends JSON. */
export function client(base: string, origin = "http://localhost:8443") {
  let cookie = ""
  const call = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(origin ? { Origin: origin } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
    })
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";")
      if (/=;?$/.test(pair!) || /Expires=Thu, 01 Jan 1970/i.test(c)) cookie = ""
      else cookie = pair!
    }
    const text = await res.text()
    let json: any = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      /* not json */
    }
    return { status: res.status, json, headers: res.headers, text }
  }
  return {
    get: (p: string) => call("GET", p),
    post: (p: string, b?: unknown, h?: Record<string, string>) => call("POST", p, b ?? {}, h),
    patch: (p: string, b: unknown) => call("PATCH", p, b),
    del: (p: string) => call("DELETE", p),
    raw: call,
    get cookie() {
      return cookie
    },
    set cookie(v: string) {
      cookie = v
    },
  }
}

export async function cleanupUsers(emails: string[]) {
  if (!emails.length) return
  const admin = await connectMigrator()
  await admin.query("DELETE FROM users WHERE email IN (?)", [emails])
  await admin.end()
}

export async function adminQuery<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const admin = await connectMigrator()
  try {
    const [rows] = await admin.query(sql, params)
    return rows as T[]
  } finally {
    await admin.end()
  }
}
