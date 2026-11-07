import type { NextFunction, Request, RequestHandler, Response } from "express"
import { randomUUID } from "node:crypto"
import { config } from "../config.ts"
import { HttpError } from "../http.ts"
import { logger } from "../logger.ts"

const allowed = new Set(config.CORS_ORIGINS)

export const requestId: RequestHandler = (req, res, next) => {
  req.id = randomUUID()
  res.setHeader("X-Request-Id", req.id)
  next()
}

export const accessLog: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint()
  res.on("finish", () => {
    logger.info({
      reqId: req.id,
      method: req.method,
      path: req.originalUrl.split("?")[0], // never the query string
      status: res.statusCode,
      ms: Number((process.hrtime.bigint() - start) / 1_000_000n),
    })
  })
  next()
}

// API responses can contain personal data: never let a browser or proxy keep them.
export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store")
  res.setHeader("Pragma", "no-cache")
  next()
}

/**
 * CSRF defence for cookie sessions, on top of SameSite=Lax:
 *   - a browser Origin, when sent, must be on the allow-list;
 *   - without Origin, the request must not be flagged cross-site;
 *   - bodies must be JSON, which a cross-site <form> cannot send.
 */
export const csrfGuard: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next()
  const origin = req.get("origin")
  if (origin) {
    if (!allowed.has(origin)) return next(new HttpError(403, "forbidden_origin"))
  } else if (req.get("sec-fetch-site") === "cross-site") {
    return next(new HttpError(403, "forbidden_origin"))
  }
  if (req.headers["content-length"] !== "0" && req.headers["content-length"] !== undefined && !req.is("application/json")) {
    return next(new HttpError(415, "json_required"))
  }
  next()
}
