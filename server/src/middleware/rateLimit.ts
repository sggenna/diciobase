import { createHash } from "node:crypto"
import { ipKeyGenerator, rateLimit } from "express-rate-limit"
import type { Request } from "express"

const make = (windowMs: number, limit: number, key?: (req: Request) => string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // Tests flip RATE_LIMIT_TEST=on to exercise the limiters; otherwise they are bypassed under NODE_ENV=test.
    skip: () => process.env.NODE_ENV === "test" && process.env.RATE_LIMIT_TEST !== "on",
    keyGenerator: key ?? ((req) => ipKeyGenerator(req.ip ?? "")),
    handler: (_req, res) => {
      res.status(429).json({ error: "too_many_requests" })
    },
  })

const min = 60_000
const hour = 60 * min

// In-memory counters: correct for a single process. Behind several instances,
// back these with a shared store (e.g. Redis).
export const globalLimiter = make(min, 300)
export const wordsLimiter = make(min, 300)
// Each new preview image costs real CPU; a crawler only ever asks for a few.
export const imageLimiter = make(min, 60)
export const registerLimiter = make(hour, 8)
export const loginIpLimiter = make(15 * min, 30)
export const userLimiter = make(15 * min, 10, (req) => `u${req.auth?.userId ?? ipKeyGenerator(req.ip ?? "")}`)

// Per-account limiter: slows password guessing against one address even when the
// attacker rotates IPs. Keyed by a hash so addresses are not kept in memory.
export const loginAccountLimiter = make(15 * min, 10, (req) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
  return "e" + createHash("sha256").update(email).digest("hex")
})
