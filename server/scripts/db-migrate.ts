import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import mysql from "mysql2/promise"
import { connectMigrator, dbName, ident, need, userHost } from "./lib/db.ts"
import { serverRoot } from "./lib/env.ts"

const dir = join(serverRoot, "db", "migrations")
const SEP = /^-- \/\/\s*$/m

const conn = await connectMigrator()
const db = dbName()
const q = (name: string) => mysql.escapeId(name)

await conn.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version    VARCHAR(100) NOT NULL PRIMARY KEY,
    checksum   CHAR(64)     NOT NULL,
    applied_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`)

const [applied] = await conn.query<mysql.RowDataPacket[]>(
  "SELECT version, checksum FROM schema_migrations",
)
const done = new Map(applied.map((r) => [r.version as string, r.checksum as string]))

for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
  const sql = await readFile(join(dir, file), "utf8")
  const checksum = createHash("sha256").update(sql).digest("hex")
  const have = done.get(file)
  if (have) {
    if (have !== checksum) throw new Error(`${file} changed after it was applied. Add a new migration instead.`)
    console.log(`skip    ${file}`)
    continue
  }
  console.log(`apply   ${file}`)
  for (const stmt of sql.split(SEP)) {
    const body = stmt.replace(/^\s*--.*$/gm, "").trim()
    if (body) await conn.query(stmt)
  }
  await conn.execute("INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)", [file, checksum])
}

// RLS verification key: same secret the API signs its contexts with.
const rls = need("RLS_SECRET")
if (!/^[0-9a-f]{64}$/.test(rls)) throw new Error("RLS_SECRET must be 64 hex characters")
await conn.execute(
  "INSERT INTO rls_keys (id, secret) VALUES (1, UNHEX(?)) ON DUPLICATE KEY UPDATE secret = VALUES(secret)",
  [rls],
)

// Least-privilege grants for the API account. Idempotent: rebuilt on every run.
const app = `${mysql.escape(ident("DB_APP_USER"))}@${mysql.escape(userHost())}`
const on = (obj: string) => `${q(db)}.${q(obj)}`
// Start from nothing: drop any previous object-level grants so removed
// privileges never linger. (Errors for "no such grant" are expected and ignored.)
const NO_SUCH_GRANT = new Set([1141, 1147, 1403])
const revoke = async (sql: string) => {
  try {
    await conn.query(sql)
  } catch (e) {
    if (!NO_SUCH_GRANT.has((e as { errno?: number }).errno ?? 0)) throw e
  }
}
await revoke(`REVOKE ALL PRIVILEGES ON ${q(db)}.* FROM ${app}`)
const [objects] = await conn.query<mysql.RowDataPacket[]>(
  "SELECT table_name AS n FROM information_schema.tables WHERE table_schema = ?",
  [db],
)
for (const o of objects) await revoke(`REVOKE ALL PRIVILEGES ON ${on(o.n as string)} FROM ${app}`)
const [allProcs] = await conn.query<mysql.RowDataPacket[]>(
  "SELECT routine_name AS n FROM information_schema.routines WHERE routine_schema = ? AND routine_type = 'PROCEDURE'",
  [db],
)
for (const p of allProcs) await revoke(`REVOKE ALL PRIVILEGES ON PROCEDURE ${on(p.n as string)} FROM ${app}`)

const readOnly = [
  "sources", "lemmas", "lemma_sources", "lemma_tags", "synsets", "synset_examples",
  "senses", "synset_relations", "lemma_relations", "stopwords",
  "dict_entries", "dict_senses", "dict_examples", "suggest_top",
]
for (const t of readOnly) await conn.query(`GRANT SELECT ON ${on(t)} TO ${app}`)

await conn.query(`GRANT SELECT, UPDATE (display_name) ON ${on("my_profile")} TO ${app}`)
await conn.query(`GRANT SELECT, UPDATE ON ${on("my_settings")} TO ${app}`)
await conn.query(`GRANT SELECT, INSERT, DELETE ON ${on("my_saved_words")} TO ${app}`)
await conn.query(`GRANT SELECT, INSERT, DELETE ON ${on("my_search_history")} TO ${app}`)
await conn.query(`GRANT SELECT, DELETE ON ${on("my_sessions")} TO ${app}`)

const [procs] = await conn.query<mysql.RowDataPacket[]>(
  "SELECT routine_name AS n FROM information_schema.routines WHERE routine_schema = ? AND routine_type = 'PROCEDURE' AND routine_name LIKE 'auth\\_%'",
  [db],
)
for (const p of procs) await conn.query(`GRANT EXECUTE ON PROCEDURE ${on(p.n as string)} TO ${app}`)
// app_user_id() is called from inside the views (which run as definer), so the
// API account does not need EXECUTE on it.

console.log("grants  applied for the API account")
await conn.end()
