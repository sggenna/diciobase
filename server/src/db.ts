import mysql from "mysql2/promise"
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise"
import { config } from "./config.ts"
import { mintContext } from "./security/rls.ts"

export type Param = string | number | boolean | null | Buffer

export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_APP_USER,
  password: config.DB_APP_PASSWORD,
  database: config.DB_NAME,
  charset: "utf8mb4",
  timezone: "Z",
  ssl: config.DB_SSL ? { minVersion: "TLSv1.2" } : undefined,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 200,
  connectTimeout: 10_000,
  enableKeepAlive: true,
  supportBigNumbers: true,
  // Never allow stacked statements: an injected "; DROP ..." cannot run.
  multipleStatements: false,
})

pool.pool.on("connection", (conn) => {
  conn.query(
    "SET time_zone = '+00:00', sql_mode = 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION,ONLY_FULL_GROUP_BY', @app_ctx = NULL",
  )
})

type Rows = RowDataPacket[]

/**
 * All runtime SQL goes through mysql2's execute(): server-side prepared
 * statements, so values are sent separately from the SQL text and can never be
 * parsed as SQL. Queries must be static strings; never build them from input.
 */
export async function query<T extends RowDataPacket = RowDataPacket>(sql: string, params: Param[] = []): Promise<T[]> {
  const [rows] = await pool.execute<Rows>(sql, params)
  return rows as T[]
}

export async function run(sql: string, params: Param[] = []): Promise<ResultSetHeader> {
  const [res] = await pool.execute<ResultSetHeader>(sql, params)
  return res
}

/** Calls one of the auth_* stored procedures and returns its first result set. */
export async function callProc<T extends RowDataPacket = RowDataPacket>(
  proc:
    | "auth_register" | "auth_get_login" | "auth_login_failed" | "auth_login_ok"
    | "auth_session_create" | "auth_session_lookup" | "auth_session_revoke"
    | "auth_purge_expired",
  params: Param[] = [],
): Promise<T[]> {
  const marks = params.map(() => "?").join(", ")
  // `proc` is a closed union of literals above, never user input.
  const [res] = await pool.execute<RowDataPacket[][]>(`CALL ${proc}(${marks})`, params)
  const first = Array.isArray(res[0]) ? (res[0] as T[]) : []
  return first
}

export interface UserDb {
  query<T extends RowDataPacket = RowDataPacket>(sql: string, params?: Param[]): Promise<T[]>
  run(sql: string, params?: Param[]): Promise<ResultSetHeader>
  call<T extends RowDataPacket = RowDataPacket>(
    proc: "auth_get_my_hash" | "auth_change_password" | "auth_delete_me",
    params?: Param[],
  ): Promise<T[]>
}

/**
 * Runs `fn` on a dedicated connection whose session carries a freshly signed
 * row-level-security context for `userId`. MySQL itself then refuses to show
 * or change any other user's rows, even if a query forgets its own WHERE.
 * The context is wiped before the connection returns to the pool.
 */
export async function withUser<T>(userId: number, fn: (db: UserDb) => Promise<T>): Promise<T> {
  const conn: PoolConnection = await pool.getConnection()
  try {
    await conn.execute("SET @app_ctx = ?", [mintContext(userId)])
    const db: UserDb = {
      query: async (sql, params = []) => ((await conn.execute<Rows>(sql, params))[0] as never),
      run: async (sql, params = []) => (await conn.execute<ResultSetHeader>(sql, params))[0],
      call: async (proc, params = []) => {
        const marks = params.map(() => "?").join(", ")
        const [res] = await conn.execute<RowDataPacket[][]>(`CALL ${proc}(${marks})`, params)
        return (Array.isArray(res[0]) ? res[0] : []) as never
      },
    }
    return await fn(db)
  } finally {
    try {
      await conn.query("SET @app_ctx = NULL")
      conn.release()
    } catch {
      conn.destroy() // never return a connection that might still hold a context
    }
  }
}

export async function ping(): Promise<boolean> {
  try {
    await pool.query("SELECT 1")
    return true
  } catch {
    return false
  }
}
