import { Router } from "express"
import { callProc } from "../db.ts"
import { HttpError, parse } from "../http.ts"
import { clearSessionCookie, createSession, readToken } from "../middleware/auth.ts"
import { loginAccountLimiter, loginIpLimiter, registerLimiter } from "../middleware/rateLimit.ts"
import { hashPassword, verifyDummy, verifyPassword } from "../security/password.ts"
import { hashToken } from "../security/tokens.ts"
import { loginBody, registerBody } from "../schemas.ts"

export const auth = Router()

const publicUser = (id: number, email: string, name: string) => ({ id, email, name })

auth.post("/register", registerLimiter, async (req, res) => {
  const body = parse(registerBody, req.body)
  const hash = await hashPassword(body.password)
  const rows = await callProc("auth_register", [body.email, hash, body.name])
  const id = rows[0]?.id
  if (id === null || id === undefined) throw new HttpError(409, "email_taken")
  await createSession(res, Number(id), req.get("user-agent"))
  res.status(201).json({ user: publicUser(Number(id), body.email, body.name) })
})

auth.post("/login", loginIpLimiter, loginAccountLimiter, async (req, res) => {
  const body = parse(loginBody, req.body)
  const invalid = new HttpError(401, "invalid_credentials")

  const rows = await callProc("auth_get_login", [body.email])
  const u = rows[0]
  // Unknown e-mail, locked account and wrong password are indistinguishable to
  // the caller: same status, same body, and the same amount of hashing work.
  if (!u || Number(u.locked) === 1) {
    await verifyDummy(body.password)
    throw invalid
  }
  if (!(await verifyPassword(String(u.password_hash), body.password))) {
    await callProc("auth_login_failed", [Number(u.id)])
    throw invalid
  }

  // A new token on every login, so a previously planted cookie never becomes valid.
  const old = readToken(req.cookies)
  if (old) await callProc("auth_session_revoke", [hashToken(old)])
  await callProc("auth_login_ok", [Number(u.id)])
  await createSession(res, Number(u.id), req.get("user-agent"))

  res.json({ user: publicUser(Number(u.id), body.email, String(u.display_name)) })
})

auth.post("/logout", async (req, res) => {
  const token = readToken(req.cookies)
  if (token) await callProc("auth_session_revoke", [hashToken(token)])
  clearSessionCookie(res)
  res.status(204).end()
})

auth.get("/me", (req, res) => {
  if (!req.auth) throw new HttpError(401, "unauthorized")
  res.json({ user: publicUser(req.auth.userId, req.auth.email, req.auth.name) })
})
