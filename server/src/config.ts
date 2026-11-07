import { existsSync } from "node:fs"
import { z } from "zod"

// Real environment variables win; server/.env fills in anything missing.
if (existsSync(".env")) process.loadEnvFile(".env")

const hex64 = z.string().regex(/^[0-9a-f]{64}$/, "must be 64 lowercase hex characters")
const ident = z.string().regex(/^[A-Za-z0-9_]{1,32}$/)

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  // Loopback by default; set HOST=0.0.0.0 only behind a reverse proxy / in a container.
  HOST: z.string().min(1).default("127.0.0.1"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),
  // The public address, for absolute URLs in link previews. Defaults to the first CORS origin in production.
  SITE_URL: z.url().optional().transform((u) => u?.replace(/\/+$/, "")),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean))
    .pipe(z.array(z.url()).max(20)),

  DB_HOST: z.string().min(1).default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: ident,
  DB_APP_USER: ident,
  DB_APP_PASSWORD: z.string().min(16, "DB_APP_PASSWORD is missing or too short; run `pnpm db:setup`"),
  DB_SSL: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),

  RLS_SECRET: hex64,
  PASSWORD_PEPPER: hex64,

  SESSION_COOKIE_NAME: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/).default("sid"),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  SESSION_IDLE_DAYS: z.coerce.number().int().min(1).max(30).default(7),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  // Names and reasons only. Values (which may be secrets) are never printed.
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(env)"}: ${i.message}`)
  console.error(`Invalid server configuration:\n${lines.join("\n")}`)
  process.exit(1)
}

export const config = parsed.data
export const isProd = config.NODE_ENV === "production"

// A platform's private network (mysql.railway.internal) never leaves its own encrypted mesh, so it counts as local.
const privateDbHost = ["127.0.0.1", "localhost", "::1"].includes(config.DB_HOST) || config.DB_HOST.endsWith(".internal")
if (isProd && !config.DB_SSL && !privateDbHost) {
  console.error("Refusing to start: DB_SSL=true is required when MySQL is on another host in production.")
  process.exit(1)
}
if (isProd && config.CORS_ORIGINS.length === 0) {
  console.error("Refusing to start: set CORS_ORIGINS in production.")
  process.exit(1)
}
