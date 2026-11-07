import type { NextFunction, Request, RequestHandler, Response } from "express"
import { z, ZodError } from "zod"
import { logger } from "./logger.ts"

export interface AuthInfo {
  userId: number
  sessionId: number
  name: string
  email: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthInfo
      id?: string
    }
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code)
  }
}

export const bad = (code = "invalid_request") => new HttpError(400, code)

/** Validates input with zod. The error carries field names only, never values. */
export function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  return schema.parse(input)
}

export function requireAuth(req: Request): AuthInfo {
  if (!req.auth) throw new HttpError(401, "unauthorized")
  return req.auth
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "not_found" })
}

// Express 5 forwards rejected promises from async handlers to this handler.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "invalid_request",
      fields: [...new Set(err.issues.map((i) => i.path.join(".") || "(body)"))],
    })
    return
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code })
    return
  }
  const e = err as { type?: string; status?: number }
  if (e?.type === "entity.parse.failed" || e?.type === "entity.too.large" || e?.type === "encoding.unsupported") {
    res.status(e.status && e.status < 500 ? e.status : 400).json({ error: e.type === "entity.too.large" ? "payload_too_large" : "invalid_request" })
    return
  }
  // Anything else is a bug or an outage. Log it with the request id, tell the
  // client nothing about the internals.
  // Database errors can quote row values (e.g. a duplicate e-mail), so for those
  // only the codes are logged, never the message.
  const x = err as { name?: string; message?: string; code?: string; errno?: number; sqlState?: string }
  logger.error(
    { err: x.errno ? { name: x.name, code: x.code, errno: x.errno, sqlState: x.sqlState } : { name: x.name, message: x.message, code: x.code }, reqId: req.id },
    "unhandled error",
  )
  res.status(500).json({ error: "internal_error", requestId: req.id })
}

export const asyncRoute = (fn: RequestHandler): RequestHandler => fn
