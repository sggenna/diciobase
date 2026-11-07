import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { config } from "./config.ts"
import { errorHandler, notFound } from "./http.ts"
import { loadSession } from "./middleware/auth.ts"
import { globalLimiter } from "./middleware/rateLimit.ts"
import { accessLog, csrfGuard, noStore, requestId } from "./middleware/security.ts"
import { auth } from "./routes/auth.ts"
import { me } from "./routes/me.ts"
import { meta } from "./routes/meta.ts"
import { site, siteAssets } from "./routes/site.ts"
import { words } from "./routes/words.ts"

export function createApp() {
  const app = express()
  app.disable("x-powered-by")
  app.disable("etag")
  app.set("trust proxy", config.TRUST_PROXY)

  app.use(requestId)
  app.use(accessLog)
  app.use(
    helmet({
      // JSON by default: nothing the API returns should ever be rendered or framed. Pages set their own policy (routes/site.ts).
      contentSecurityPolicy: { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: "same-site" },
      referrerPolicy: { policy: "no-referrer" },
    }),
  )
  const origins = new Set(config.CORS_ORIGINS)
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || origins.has(origin)),
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type"],
      maxAge: 600,
    }),
  )
  app.use(siteAssets)
  app.use(noStore)
  app.use(globalLimiter)
  app.use(express.json({ limit: "16kb", strict: true }))
  app.use(cookieParser())

  app.use("/api", csrfGuard)
  app.use("/api", loadSession)
  app.use("/api/auth", auth)
  app.use("/api/me", me)
  app.use("/api/words", words)
  app.use("/api", meta)
  app.use(site)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
