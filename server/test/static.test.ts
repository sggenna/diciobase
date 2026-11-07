import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, it } from "node:test"

const root = join(import.meta.dirname, "..")
const repo = join(root, "..")

function files(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) files(p, out)
    else if (p.endsWith(".ts")) out.push(p)
  }
  return out
}

describe("guard rails", () => {
  it("no SQL is built with string interpolation in the API code", () => {
    const offenders: string[] = []
    for (const f of files(join(root, "src"))) {
      const src = readFileSync(f, "utf8")
      for (const m of src.matchAll(/`([^`]*)`/g)) {
        const t = m[1]!
        if (/\b(SELECT|INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM|CALL\s)/i.test(t) && t.includes("${")) {
          // db.ts builds "CALL <proc>(?, ?)" from a closed union of procedure names and a count of "?".
          if (relative(root, f) === "src/db.ts" && /CALL \$\{proc\}\(\$\{marks\}\)/.test(t)) continue
          offenders.push(`${relative(root, f)}: ${t.slice(0, 60).replace(/\s+/g, " ")}`)
        }
      }
    }
    assert.deepEqual(offenders, [])
  })

  it("the API never enables stacked statements or client-side escaping of values", () => {
    for (const f of files(join(root, "src"))) {
      const src = readFileSync(f, "utf8")
      assert.doesNotMatch(src, /multipleStatements:\s*true/, f)
      assert.doesNotMatch(src, /\.escape\(|\.format\(|namedPlaceholders/, f)
    }
  })

  it("runtime queries use prepared statements (execute), never query() with values", () => {
    const db = readFileSync(join(root, "src/db.ts"), "utf8")
    // The only pool.query/conn.query calls are the fixed session-reset statements and ping().
    const calls = [...db.matchAll(/\b(?:pool|conn|conn\.)\.query\(\s*([^)]*)\)/g)].map((m) => m[1]!.trim())
    for (const c of calls) assert.match(c, /^("SET |"SELECT 1"|\s*$)/, c)
  })

  it("server/.env and other secrets are git-ignored, the template is not", () => {
    const ignored = (p: string) => {
      try {
        execFileSync("git", ["check-ignore", "-q", p], { cwd: repo })
        return true
      } catch {
        return false
      }
    }
    assert.ok(ignored("server/.env"))
    assert.ok(ignored(".env"))
    assert.ok(ignored("server/.env.production"))
    assert.ok(ignored("server/data/raw/anything"))
    assert.ok(!ignored("server/.env.example"))
  })

  it("no secret is tracked by git and .env.example holds no real values", () => {
    const tracked = execFileSync("git", ["ls-files", "server"], { cwd: repo, encoding: "utf8" }).split("\n")
    assert.ok(!tracked.some((f) => /(^|\/)\.env($|\.(?!example))/.test(f)), "a real .env file is tracked")
    const tpl = readFileSync(join(root, ".env.example"), "utf8")
    assert.doesNotMatch(tpl, /^(DB_APP_PASSWORD|DB_MIGRATOR_PASSWORD|RLS_SECRET|PASSWORD_PEPPER)=.+$/m)
  })
})
