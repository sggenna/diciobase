import { createApp } from "./app.ts"
import { config } from "./config.ts"
import { callProc, pool } from "./db.ts"
import { logger } from "./logger.ts"

const app = createApp()
const server = app.listen(config.PORT, config.HOST, () => {
  logger.info({ port: config.PORT, host: config.HOST, env: config.NODE_ENV }, "diciobase api listening")
})

// Hourly housekeeping: expired sessions, old security events.
const purge = setInterval(() => {
  callProc("auth_purge_expired").catch((e) => logger.warn({ code: (e as { code?: string }).code }, "purge failed"))
}, 60 * 60 * 1000)
purge.unref()

let closing = false
async function shutdown(signal: string) {
  if (closing) return
  closing = true
  logger.info({ signal }, "shutting down")
  server.close(async () => {
    await pool.end().catch(() => undefined)
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on("SIGTERM", () => void shutdown("SIGTERM"))
process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("unhandledRejection", (e) => logger.error({ code: (e as { code?: string })?.code }, "unhandled rejection"))
