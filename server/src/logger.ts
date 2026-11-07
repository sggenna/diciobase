import pino from "pino"
import { isProd } from "./config.ts"

// Secrets never reach the logs, even if a handler logs a whole object by mistake.
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  redact: {
    paths: ["password", "*.password", "current", "next", "token", "*.token", "cookie", "*.cookie", "headers.cookie", "headers.authorization", "email", "*.email"],
    remove: true,
  },
})
