// A private MySQL just for Diciobase development, for when you do not want to
// (or cannot) use the system MySQL. It lives in ~/.diciobase/mysql, listens on
// 127.0.0.1:3307 only, and has a random root password kept in a 0600 file.
//
//   pnpm db:local        start it (creates it on first run)
//   pnpm db:local stop   stop it
//   pnpm db:setup:local  create the database/accounts/secrets inside it
//
// Nothing here touches any other MySQL on the machine.
import { spawn, spawnSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import mysql from "mysql2/promise"

const PORT = 3307
const home = join(homedir(), ".diciobase")
const dataDir = join(home, "mysql", "data")
const pidFile = join(home, "mysql", "mysqld.pid")
const logFile = join(home, "mysql", "error.log")
const pwFile = join(home, "root.pw")
const socket = "/tmp/diciobase-mysql.sock" // keep short: unix sockets have a path limit

function findMysqld(): string {
  for (const p of ["/opt/homebrew/opt/mysql/bin/mysqld", "/usr/local/opt/mysql/bin/mysqld", "/usr/local/mysql/bin/mysqld"]) {
    if (existsSync(p)) return p
  }
  const w = spawnSync("which", ["mysqld"], { encoding: "utf8" })
  if (w.status === 0 && w.stdout.trim()) return w.stdout.trim()
  throw new Error("mysqld not found. Install MySQL first (for example: brew install mysql).")
}

const common = (extra: string[] = []) => [
  "--no-defaults",
  `--datadir=${dataDir}`,
  `--pid-file=${pidFile}`,
  `--log-error=${logFile}`,
  `--socket=${socket}`,
  "--mysqlx=OFF",
  "--skip-log-bin",
  ...extra,
]

async function ping(password: string | null): Promise<boolean> {
  try {
    const c = await mysql.createConnection({ host: "127.0.0.1", port: PORT, user: "root", password: password ?? "" })
    await c.end()
    return true
  } catch (e) {
    // "Access denied" still proves the server is up and answering.
    return (e as { errno?: number }).errno === 1045
  }
}

async function waitUp(ms = 60_000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    try {
      const c = await mysql.createConnection({ socketPath: socket, user: "root", password: existsSync(pwFile) ? readFileSync(pwFile, "utf8").trim() : "" })
      await c.end()
      return
    } catch (e) {
      if ((e as { errno?: number }).errno === 1045) return
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`MySQL did not come up in time. See ${logFile}`)
}

function launch(args: string[]) {
  const out = openSync(logFile, "a")
  const child = spawn(findMysqld(), args, { detached: true, stdio: ["ignore", out, out] })
  child.unref()
}

async function start() {
  mkdirSync(join(home, "mysql"), { recursive: true, mode: 0o700 })

  if (!existsSync(join(dataDir, "mysql.ibd"))) {
    console.log("Creating a new MySQL data directory in ~/.diciobase/mysql …")
    const init = spawnSync(findMysqld(), common(["--initialize-insecure"]), { stdio: "ignore" })
    if (init.status !== 0) throw new Error(`Initialisation failed. See ${logFile}`)

    // First boot is socket-only, so nobody can reach the passwordless root while it is set.
    launch(common(["--skip-networking"]))
    await waitUp()
    const root = randomBytes(24).toString("base64url")
    const c = await mysql.createConnection({ socketPath: socket, user: "root", password: "" })
    await c.query(`ALTER USER 'root'@'localhost' IDENTIFIED BY ${mysql.escape(root)}`)
    await c.query("SHUTDOWN")
    await c.end().catch(() => undefined)
    writeFileSync(pwFile, root + "\n", { mode: 0o600 })
    await new Promise((r) => setTimeout(r, 3000))
  }

  const pw = readFileSync(pwFile, "utf8").trim()
  if (await ping(pw)) {
    console.log(`Diciobase MySQL is already running on 127.0.0.1:${PORT}.`)
    return
  }
  launch(common([`--port=${PORT}`, "--bind-address=127.0.0.1"]))
  await waitUp()
  console.log(`Diciobase MySQL is running on 127.0.0.1:${PORT} (data: ${dataDir}).`)
  console.log("Next:  pnpm db:setup:local")
}

async function stop() {
  const pw = existsSync(pwFile) ? readFileSync(pwFile, "utf8").trim() : ""
  try {
    const c = await mysql.createConnection({ socketPath: socket, user: "root", password: pw })
    await c.query("SHUTDOWN")
    await c.end().catch(() => undefined)
    console.log("Stopped.")
  } catch {
    console.log("It was not running.")
  }
}

function setup() {
  if (!existsSync(pwFile)) throw new Error("Run `pnpm db:local` first.")
  // The root password goes to the child through its environment only; it is never printed.
  const r = spawnSync("npx", ["tsx", "scripts/db-setup.ts"], {
    stdio: "inherit",
    env: { ...process.env, DB_PORT: String(PORT), DB_HOST: "127.0.0.1", DB_SETUP_USER: "root", DB_SETUP_PASSWORD: readFileSync(pwFile, "utf8").trim() },
  })
  process.exit(r.status ?? 1)
}

const cmd = process.argv[2] ?? "start"
if (cmd === "start") await start()
else if (cmd === "stop") await stop()
else if (cmd === "setup") setup()
else throw new Error(`Unknown command: ${cmd}`)
