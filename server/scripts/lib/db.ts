import mysql from "mysql2/promise"
import { loadEnv } from "./env.ts"

loadEnv()

export const IDENT = /^[A-Za-z0-9_]{1,32}$/

export function need(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing ${name}. Run "pnpm db:setup" first (or fill server/.env).`)
  return v
}

export function ident(name: string): string {
  const v = need(name)
  if (!IDENT.test(v)) throw new Error(`${name} may only contain letters, digits and underscores`)
  return v
}

export const dbName = () => ident("DB_NAME")
export const userHost = () => process.env.DB_USER_HOST || "localhost"

export function sslOption() {
  return process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2" as const } : undefined
}

/** Owner connection used for migrations and dataset imports. */
export async function connectMigrator() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: ident("DB_MIGRATOR_USER"),
    password: need("DB_MIGRATOR_PASSWORD"),
    database: dbName(),
    charset: "utf8mb4",
    timezone: "Z",
    ssl: sslOption(),
    // Deliberately off: no stacked statements, ever.
    multipleStatements: false,
  })
  await conn.query("SET time_zone = '+00:00'")
  return conn
}
