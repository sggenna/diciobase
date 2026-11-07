import type { RequestHandler, Response } from "express"
import { config, isProd } from "../config.ts"
import { callProc } from "../db.ts"
import { newSessionToken, hashToken, TOKEN_RE } from "../security/tokens.ts"

const cookieBase = {
  httpOnly: true, // not readable by page scripts, so XSS cannot steal it
  secure: isProd, // HTTPS only in production
  sameSite: "lax" as const,
  path: "/",
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(config.SESSION_COOKIE_NAME, token, {
    ...cookieBase,
    maxAge: config.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  })
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(config.SESSION_COOKIE_NAME, cookieBase)
}

export async function createSession(res: Response, userId: number, userAgent: string | undefined) {
  const { token, hash } = newSessionToken()
  await callProc("auth_session_create", [userId, hash, config.SESSION_TTL_DAYS, (userAgent ?? "").slice(0, 200) || null])
  setSessionCookie(res, token)
}

export const readToken = (cookies: Record<string, unknown> | undefined): string | null => {
  const v = cookies?.[config.SESSION_COOKIE_NAME]
  return typeof v === "string" && TOKEN_RE.test(v) ? v : null
}

/** Resolves the session cookie, if any, to req.auth. Never fails the request. */
export const loadSession: RequestHandler = async (req, _res, next) => {
  const token = readToken(req.cookies)
  if (!token) return next()
  const rows = await callProc("auth_session_lookup", [hashToken(token), config.SESSION_IDLE_DAYS])
  const r = rows[0]
  if (r) {
    req.auth = {
      userId: Number(r.user_id),
      sessionId: Number(r.session_id),
      name: String(r.display_name),
      email: String(r.email),
    }
  }
  next()
}

export const needAuth: RequestHandler = (req, res, next) => {
  if (!req.auth) {
    res.status(401).json({ error: "unauthorized" })
    return
  }
  next()
}
