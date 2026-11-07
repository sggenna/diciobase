// One-time (and re-runnable) bootstrap, run with a privileged MySQL account:
//   - creates the database
//   - creates two accounts: an owner (migrations/imports) and a locked-down
//     runtime account for the API
//   - generates all secrets and writes them to server/.env (mode 0600)
//
// Nothing secret is ever printed. The privileged password is taken from the
// DB_SETUP_PASSWORD environment variable or prompted for (hidden), and is not
// stored anywhere.
import { randomBytes } from "node:crypto"
import { join } from "node:path"
import { createInterface } from "node:readline"
import mysql from "mysql2/promise"
import { IDENT, sslOption } from "./lib/db.ts"
import { readEnvFile, serverRoot, writeEnvValues } from "./lib/env.ts"

const existing = readEnvFile()
const pick = (k: string, d: string) => process.env[k] || existing.get(k) || d

const host = pick("DB_HOST", "127.0.0.1")
const port = Number(pick("DB_PORT", "3306"))
const dbName = pick("DB_NAME", "diciobase")
const appUser = pick("DB_APP_USER", "diciobase_app")
const migUser = pick("DB_MIGRATOR_USER", "diciobase_migrator")
const userHost = pick("DB_USER_HOST", "localhost")
for (const [k, v] of Object.entries({ DB_NAME: dbName, DB_APP_USER: appUser, DB_MIGRATOR_USER: migUser })) {
  if (!IDENT.test(v)) throw new Error(`${k} may only contain letters, digits and underscores`)
}
if (!/^[A-Za-z0-9_.%:-]{1,60}$/.test(userHost)) throw new Error("DB_USER_HOST looks invalid")
if (appUser === migUser) throw new Error("The API and owner accounts must be different")

async function askHidden(question: string): Promise<string> {
  if (!process.stdin.isTTY) throw new Error("Set DB_SETUP_PASSWORD, or run this in an interactive terminal.")
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  // Mute echo while the password is typed.
  const out = (rl as unknown as { output: { write: (s: string) => void } }).output
  const write = out.write.bind(out)
  let muted = false
  out.write = (s: string) => (muted ? true : write(s))
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      muted = false
      out.write = write
      write("\n")
      rl.close()
      resolve(answer)
    })
    muted = true
  })
}

const setupUser = process.env.DB_SETUP_USER || "root"
const setupPassword =
  "DB_SETUP_PASSWORD" in process.env
    ? process.env.DB_SETUP_PASSWORD!
    : await askHidden(`MySQL password for ${setupUser}@${host}:${port}: `)

const admin = await mysql.createConnection({
  host, port, user: setupUser, password: setupPassword, ssl: sslOption(), multipleStatements: false,
})

const secret = () => randomBytes(32).toString("hex")
const password = () => randomBytes(33).toString("base64url")
const values = {
  DB_HOST: host,
  DB_PORT: String(port),
  DB_NAME: dbName,
  DB_APP_USER: appUser,
  DB_MIGRATOR_USER: migUser,
  DB_USER_HOST: userHost,
  DB_APP_PASSWORD: existing.get("DB_APP_PASSWORD") || password(),
  DB_MIGRATOR_PASSWORD: existing.get("DB_MIGRATOR_PASSWORD") || password(),
  RLS_SECRET: existing.get("RLS_SECRET") || secret(),
  PASSWORD_PEPPER: existing.get("PASSWORD_PEPPER") || secret(),
}

const E = mysql.escapeId
const S = mysql.escape
const requireSsl = process.env.DB_SSL === "true" ? " REQUIRE SSL" : ""

await admin.query(`CREATE DATABASE IF NOT EXISTS ${E(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`)
for (const [user, pw] of [
  [migUser, values.DB_MIGRATOR_PASSWORD],
  [appUser, values.DB_APP_PASSWORD],
] as const) {
  const who = `${S(user)}@${S(userHost)}`
  await admin.query(`CREATE USER IF NOT EXISTS ${who} IDENTIFIED BY ${S(pw)}${requireSsl}`)
  await admin.query(`ALTER USER ${who} IDENTIFIED BY ${S(pw)}`) // keep MySQL in sync with .env
}
// Owner: full control of this one database only. The API account is granted
// its narrow privileges by `pnpm db:migrate`.
await admin.query(
  `GRANT ALL PRIVILEGES ON ${E(dbName)}.* TO ${S(migUser)}@${S(userHost)} WITH GRANT OPTION`,
)
await admin.end()

writeEnvValues(values, join(serverRoot, ".env.example"))
console.log(`Database "${dbName}" and accounts "${migUser}" / "${appUser}" are ready.`)
console.log("Secrets were written to server/.env (owner-only permissions). They were not printed.")
console.log("Next:  pnpm db:migrate  &&  pnpm datasets:fetch  &&  pnpm db:import")
