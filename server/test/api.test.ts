import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"
import { pool } from "../src/db.ts"
import { adminQuery, cleanupUsers, client, startServer } from "./helpers.ts"

const suffix = Date.now().toString(36)
const emails: string[] = []
const mail = (n: string) => {
  const e = `${n}-${suffix}@example.test`
  emails.push(e)
  return e
}
const PASSWORD = "correct horse battery staple"

let srv: Awaited<ReturnType<typeof startServer>>

before(async () => {
  srv = await startServer()
})
after(async () => {
  await srv.close()
  await cleanupUsers(emails)
  await pool.end()
})

describe("public endpoints", () => {
  it("health and sources", async () => {
    const c = client(srv.base)
    assert.equal((await c.get("/api/health")).status, 200)
    const s = await c.get("/api/sources")
    assert.equal(s.status, 200)
    assert.ok(s.json.sources.length >= 5)
    assert.ok(s.json.sources.every((x: any) => x.license && x.attribution))
  })

  it("looks up words accent- and case-insensitively", async () => {
    const c = client(srv.base)
    const r = await c.get("/api/words/" + encodeURIComponent("EFEMERO"))
    assert.equal(r.status, 200)
    assert.ok(r.json.entries.length >= 1)
    assert.ok(r.json.entries.some((e: any) => e.word.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "") === "efemero"))
    assert.equal((await c.get("/api/words/zzzznotaword")).status, 404)
  })

  it("autocompletes by prefix", async () => {
    const c = client(srv.base)
    const r = await c.get("/api/words/search?q=terren")
    assert.equal(r.status, 200)
    assert.ok(r.json.results.includes("terreno"))
    assert.equal((await c.get("/api/words/search")).status, 400)
  })

  it("returns Wikcionário and Dicionário Aberto entries with their licences", async () => {
    const r = await client(srv.base).get("/api/words/casa")
    assert.equal(r.status, 200)
    const slugs = r.json.entries.flatMap((e: any) => e.dictionaries.map((d: any) => d.slug))
    assert.ok(slugs.includes("wikcionario"), "Wikcionário tab")
    assert.ok(slugs.includes("dicionario-aberto"), "Dicionário Aberto tab")
    for (const e of r.json.entries) {
      for (const d of e.dictionaries) {
        assert.ok(d.license && d.attribution, `${d.slug} carries its licence`)
        assert.ok(d.entries.every((x: any) => x.senses.length > 0))
      }
    }
  })

  it("never suggests archaic spellings that exist only in Dicionário Aberto", async () => {
    const [onlyDa] = await adminQuery(
      `SELECT l.lemma FROM lemmas l
         JOIN lemma_sources ls ON ls.lemma_id = l.id
         JOIN sources s ON s.id = ls.source_id AND s.slug = 'dicionario-aberto'
        WHERE l.lemma REGEXP '^[a-z]{8,12}$'
          AND NOT EXISTS (SELECT 1 FROM lemma_sources o JOIN sources so ON so.id = o.source_id
                           WHERE o.lemma_id = l.id AND so.slug <> 'dicionario-aberto')
        LIMIT 1`,
    )
    assert.ok(onlyDa, "fixture: a word only Dicionário Aberto has")
    const r = await client(srv.base).get("/api/words/search?q=" + encodeURIComponent(onlyDa.lemma) + "&limit=20")
    assert.ok(!r.json.results.includes(onlyDa.lemma))
    assert.equal((await client(srv.base).get("/api/words/" + encodeURIComponent(onlyDa.lemma))).status, 200)
  })

  it("only suggests words we have content for (never bare word-list entries)", async () => {
    // A word that exists only in the spelling word list: no senses, no thesaurus links.
    const [bare] = await adminQuery(
      `SELECT l.lemma FROM lemmas l
        WHERE l.lemma REGEXP '^[a-z]{9,12}$'
          AND NOT EXISTS (SELECT 1 FROM senses s WHERE s.lemma_id = l.id)
          AND NOT EXISTS (SELECT 1 FROM lemma_relations r WHERE r.lemma_id = l.id OR r.related_lemma_id = l.id)
        LIMIT 1`,
    )
    assert.ok(bare, "fixture: a bare word-list entry")
    const c = client(srv.base)
    const r = await c.get("/api/words/search?q=" + encodeURIComponent(bare.lemma) + "&limit=20")
    assert.equal(r.status, 200)
    assert.ok(!r.json.results.includes(bare.lemma), `${bare.lemma} should not be suggested`)
    // ...but it is still reachable by typing it exactly.
    assert.equal((await c.get("/api/words/" + encodeURIComponent(bare.lemma))).status, 200)
  })

  it("dictionary answers are cacheable by browsers, personal ones never are", async () => {
    const c = client(srv.base)
    const pub = await c.get("/api/words/search?q=ter&limit=5")
    assert.match(pub.headers.get("cache-control") ?? "", /public, max-age=\d+/)
    assert.match((await c.get("/api/words/casa")).headers.get("cache-control") ?? "", /public/)
    // Repeats are served from memory and are identical.
    assert.deepEqual((await c.get("/api/words/search?q=ter&limit=5")).json, pub.json)
    assert.equal((await c.get("/api/me")).headers.get("cache-control"), "no-store")
    assert.equal((await c.get("/api/health")).headers.get("cache-control"), "no-store")
  })

  it("short prefixes return common words fast and put an exact short word first", async () => {
    const c = client(srv.base)
    const t0 = Date.now()
    const r = await c.get("/api/words/search?q=ma&limit=8")
    assert.equal(r.status, 200)
    assert.ok(r.json.results.length >= 5)
    assert.ok(r.json.results.every((w: string) => w.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().startsWith("ma")))
    assert.ok(Date.now() - t0 < 1500)
    const ir = await c.get("/api/words/search?q=ir&limit=8")
    assert.equal(ir.json.results[0], "ir")
  })

  it("API responses are never cacheable and carry security headers", async () => {
    const c = client(srv.base)
    const r = await c.get("/api/health")
    assert.equal(r.headers.get("cache-control"), "no-store")
    assert.equal(r.headers.get("x-powered-by"), null)
    assert.match(r.headers.get("content-security-policy") ?? "", /default-src 'none'/)
    assert.equal(r.headers.get("x-content-type-options"), "nosniff")
  })
})

describe("accounts and sessions", () => {
  const email = mail("ana")
  it("registers, sets a hardened cookie, and never returns the hash", async () => {
    const c = client(srv.base)
    const r = await c.post("/api/auth/register", { email, password: PASSWORD, name: "Ana" })
    assert.equal(r.status, 201)
    assert.deepEqual(Object.keys(r.json.user).sort(), ["email", "id", "name"])
    const setCookie = r.headers.getSetCookie().join("\n")
    assert.match(setCookie, /HttpOnly/i)
    assert.match(setCookie, /SameSite=Lax/i)
    assert.doesNotMatch(r.text, /argon2|password/i)
    assert.equal((await c.get("/api/auth/me")).json.user.email, email)
  })

  it("stores only a hash of the session token and an argon2id password hash", async () => {
    const c = client(srv.base)
    await c.post("/api/auth/login", { email, password: PASSWORD })
    const token = c.cookie.split("=")[1]!
    const rows = await adminQuery("SELECT token_hash, HEX(token_hash) h FROM sessions s JOIN users u ON u.id = s.user_id WHERE u.email = ?", [email])
    assert.ok(rows.length >= 1)
    assert.ok(rows.every((r) => !String(r.token_hash).includes(token)))
    const [u] = await adminQuery("SELECT password_hash FROM users WHERE email = ?", [email])
    assert.match(u.password_hash, /^\$argon2id\$/)
    assert.ok(!u.password_hash.includes(PASSWORD))
  })

  it("rejects duplicates, weak or malformed input, and unknown fields", async () => {
    const c = client(srv.base)
    assert.equal((await c.post("/api/auth/register", { email, password: PASSWORD, name: "Dup" })).status, 409)
    assert.equal((await c.post("/api/auth/register", { email: mail("x"), password: "short", name: "X" })).status, 400)
    assert.equal((await c.post("/api/auth/register", { email: "not-an-email", password: PASSWORD, name: "X" })).status, 400)
    assert.equal((await c.post("/api/auth/register", { email: mail("y"), password: PASSWORD, name: "Y", isAdmin: true })).status, 400)
  })

  it("login failures are indistinguishable (no user enumeration)", async () => {
    const c = client(srv.base)
    const wrongPw = await c.post("/api/auth/login", { email, password: "wrong password here" })
    const noUser = await c.post("/api/auth/login", { email: `nobody-${suffix}@example.test`, password: "wrong password here" })
    assert.equal(wrongPw.status, 401)
    assert.equal(noUser.status, 401)
    assert.deepEqual(wrongPw.json, noUser.json)
  })

  it("locks the account after repeated failures, even for the right password", async () => {
    const lockEmail = mail("lock")
    const c = client(srv.base)
    await c.post("/api/auth/register", { email: lockEmail, password: PASSWORD, name: "Lock" })
    const other = client(srv.base)
    for (let i = 0; i < 6; i++) await other.post("/api/auth/login", { email: lockEmail, password: "definitely wrong" })
    const r = await other.post("/api/auth/login", { email: lockEmail, password: PASSWORD })
    assert.equal(r.status, 401)
  })

  it("logout invalidates the session server-side", async () => {
    const c = client(srv.base)
    await c.post("/api/auth/login", { email, password: PASSWORD })
    const stolen = c.cookie
    assert.equal((await c.get("/api/auth/me")).status, 200)
    await c.post("/api/auth/logout")
    const replay = client(srv.base)
    replay.cookie = stolen
    assert.equal((await replay.get("/api/auth/me")).status, 401)
  })

  it("a made-up or malformed session cookie gets nothing", async () => {
    const c = client(srv.base)
    c.cookie = "sid=" + "A".repeat(43)
    assert.equal((await c.get("/api/me")).status, 401)
    c.cookie = "sid=' OR 1=1 --"
    assert.equal((await c.get("/api/me")).status, 401)
  })

  it("changing the password signs out other devices", async () => {
    const e = mail("pw")
    const a = client(srv.base)
    await a.post("/api/auth/register", { email: e, password: PASSWORD, name: "Pw" })
    const b = client(srv.base)
    await b.post("/api/auth/login", { email: e, password: PASSWORD })
    assert.equal((await b.get("/api/auth/me")).status, 200)

    assert.equal((await a.post("/api/me/password", { current: "not the password", next: "a brand new passphrase" })).status, 403)
    assert.equal((await a.post("/api/me/password", { current: PASSWORD, next: "a brand new passphrase" })).status, 200)
    assert.equal((await b.get("/api/auth/me")).status, 401, "other session revoked")
    assert.equal((await a.get("/api/auth/me")).status, 200, "current session kept")
    assert.equal((await client(srv.base).post("/api/auth/login", { email: e, password: PASSWORD })).status, 401)
    assert.equal((await client(srv.base).post("/api/auth/login", { email: e, password: "a brand new passphrase" })).status, 200)
  })
})

describe("user data and isolation", () => {
  const ea = mail("iso-a")
  const eb = mail("iso-b")
  let a: ReturnType<typeof client>
  let b: ReturnType<typeof client>

  before(async () => {
    a = client(srv.base)
    b = client(srv.base)
    assert.equal((await a.post("/api/auth/register", { email: ea, password: PASSWORD, name: "A" })).status, 201)
    assert.equal((await b.post("/api/auth/register", { email: eb, password: PASSWORD, name: "B" })).status, 201)
  })

  it("requires login for everything under /api/me", async () => {
    const anon = client(srv.base)
    for (const p of ["/api/me", "/api/me/saved", "/api/me/searches", "/api/me/sessions", "/api/me/export"]) {
      assert.equal((await anon.get(p)).status, 401, p)
    }
  })

  it("saves, lists and removes words; users cannot see or remove each other's", async () => {
    const saved = await a.post("/api/me/saved", { word: "terreno" })
    assert.equal(saved.status, 201)
    const id = saved.json.saved.id
    const listed = (await a.get("/api/me/saved")).json.saved
    assert.deepEqual(listed.map((s: any) => s.word), ["terreno"])
    assert.ok(listed[0].gloss && listed[0].source, "a saved definition always names its dictionary")
    assert.deepEqual((await b.get("/api/me/saved")).json.saved, [])
    assert.equal((await b.del(`/api/me/saved/${id}`)).json.removed, false)
    assert.equal((await a.get("/api/me/saved")).json.saved.length, 1)
    assert.equal((await a.post("/api/me/saved", { word: "terreno" })).status, 201, "saving twice is harmless")
    assert.equal((await a.get("/api/me/saved")).json.saved.length, 1)
    assert.equal((await a.del(`/api/me/saved/${id}`)).json.removed, true)
    assert.equal((await a.post("/api/me/saved", { word: "zzzznotaword" })).status, 404)
  })

  it("profile, settings and history are per user", async () => {
    assert.equal((await a.patch("/api/me", { name: "Alice Nova" })).status, 200)
    assert.equal((await b.get("/api/me")).json.user.name, "B")
    assert.equal((await a.patch("/api/me/settings", { tips: false, interests: ["Filosofia"], dicts: { wikcionario: true, "dicionario-aberto": false, wordnet: false } })).status, 200)
    const mine = (await a.get("/api/me")).json
    assert.equal(mine.settings.tips, false)
    assert.deepEqual(mine.settings.interests, ["Filosofia"])
    assert.equal((await b.get("/api/me")).json.settings.tips, true)
    assert.equal((await a.patch("/api/me/settings", { dicts: { wikcionario: false, "dicionario-aberto": false, wordnet: false } })).status, 400, "needs one dictionary")

    await a.post("/api/me/searches", { query: "casa" })
    assert.equal((await a.get("/api/me/searches")).json.searches.length, 1)
    assert.equal((await b.get("/api/me/searches")).json.searches.length, 0)
    assert.equal((await a.del("/api/me/searches")).json.removed, 1)
  })

  it("lists and revokes only your own sessions", async () => {
    const aSessions = (await a.get("/api/me/sessions")).json.sessions
    const bSessions = (await b.get("/api/me/sessions")).json.sessions
    assert.ok(aSessions.some((s: any) => s.current))
    assert.equal((await a.del(`/api/me/sessions/${bSessions[0].id}`)).json.revoked, false)
    assert.equal((await b.get("/api/auth/me")).status, 200)
  })

  it("exports the user's own data only", async () => {
    await a.post("/api/me/saved", { word: "casa" })
    const x = (await a.get("/api/me/export")).json
    assert.equal(x.profile.email, ea)
    assert.ok(x.saved.some((s: any) => s.word === "casa"))
    assert.doesNotMatch(JSON.stringify(x), new RegExp(eb))
    assert.doesNotMatch(JSON.stringify(x), /password_hash|token_hash/)
  })

  it("deleting the account removes everything", async () => {
    const e = mail("gone")
    const c = client(srv.base)
    await c.post("/api/auth/register", { email: e, password: PASSWORD, name: "Gone" })
    await c.post("/api/me/saved", { word: "casa" })
    await c.post("/api/me/searches", { query: "x" })
    const [{ id }] = await adminQuery("SELECT id FROM users WHERE email = ?", [e])
    assert.equal((await c.post("/api/me/delete-account", { password: "wrong password" })).status, 403)
    assert.equal((await c.post("/api/me/delete-account", { password: PASSWORD })).status, 204)
    assert.equal((await c.get("/api/auth/me")).status, 401)
    for (const t of ["users", "user_settings", "sessions", "saved_words", "search_history"]) {
      const col = t === "users" ? "id" : "user_id"
      const rows = await adminQuery(`SELECT 1 FROM ${t} WHERE ${col} = ?`, [id])
      assert.equal(rows.length, 0, t)
    }
  })
})

describe("SQL injection", () => {
  const payloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "\" OR \"\"=\"",
    "' UNION SELECT password_hash FROM users -- ",
    "1; SELECT SLEEP(5)",
    "%",
    "_",
    "\\",
    "admin'--",
    "terreno' AND (SELECT COUNT(*) FROM users) > 0 -- ",
  ]
  const email = mail("sqli")

  it("nothing in the API treats input as SQL", async () => {
    const c = client(srv.base)
    await c.post("/api/auth/register", { email, password: PASSWORD, name: "Sqli" })
    const before = (await adminQuery("SELECT COUNT(*) n FROM users"))[0].n
    const t0 = Date.now()
    for (const p of payloads) {
      const enc = encodeURIComponent(p)
      for (const path of [`/api/words/${enc}`, `/api/words/search?q=${enc}`]) {
        const r = await c.get(path)
        assert.ok([200, 400, 404].includes(r.status), `${path} -> ${r.status}`)
        assert.doesNotMatch(r.text, /password_hash|argon2|syntax|mysql|SQL/i, path)
      }
      assert.ok([400, 401, 404].includes((await c.post("/api/auth/login", { email: p, password: p })).status))
      assert.ok([400, 401].includes((await client(srv.base).post("/api/auth/login", { email, password: p })).status))
      assert.ok([400, 404].includes((await c.post("/api/me/saved", { word: p })).status))
      assert.ok([201, 400].includes((await c.post("/api/me/searches", { query: p })).status))
      assert.ok([400, 200].includes((await c.patch("/api/me", { name: p })).status))
    }
    assert.ok(Date.now() - t0 < 15_000, "no payload made the database sleep")
    assert.equal((await adminQuery("SELECT COUNT(*) n FROM users"))[0].n, before, "users table untouched")
    // The stored value is exactly what was sent, i.e. it was treated as data.
    const hist = (await c.get("/api/me/searches")).json.searches.map((s: any) => s.query)
    assert.ok(hist.includes("'; DROP TABLE users; --"))
  })

  it("LIKE wildcards are matched literally in autocomplete", async () => {
    const r = await client(srv.base).get("/api/words/search?q=" + encodeURIComponent("%"))
    assert.deepEqual(r.json.results, [])
    const r2 = await client(srv.base).get("/api/words/search?q=" + encodeURIComponent("t_rren"))
    assert.deepEqual(r2.json.results, [])
  })
})

describe("browser-facing protections", () => {
  it("rejects state-changing requests from other origins and non-JSON bodies", async () => {
    const evil = client(srv.base, "https://evil.example")
    const r = await evil.post("/api/auth/login", { email: "a@b.co", password: "x" })
    assert.equal(r.status, 403)
    const plain = await client(srv.base).raw("POST", "/api/auth/login", undefined, {
      "Content-Type": "text/plain",
      "Content-Length": "5",
    })
    assert.ok([415, 400].includes(plain.status))
    const crossSite = await client(srv.base, "").raw("POST", "/api/auth/logout", {}, { "Sec-Fetch-Site": "cross-site" })
    assert.equal(crossSite.status, 403)
  })

  it("CORS only echoes allow-listed origins and allows credentials for them", async () => {
    const ok = await fetch(srv.base + "/api/health", { headers: { Origin: "http://localhost:8443" } })
    assert.equal(ok.headers.get("access-control-allow-origin"), "http://localhost:8443")
    assert.equal(ok.headers.get("access-control-allow-credentials"), "true")
    const evil = await fetch(srv.base + "/api/health", { headers: { Origin: "https://evil.example" } })
    assert.equal(evil.headers.get("access-control-allow-origin"), null)
  })

  it("oversized and malformed JSON bodies are refused without leaking internals", async () => {
    const c = client(srv.base)
    const big = await c.raw("POST", "/api/auth/login", { email: "a@b.co", password: "x".repeat(40_000) })
    assert.equal(big.status, 413)
    const broken = await fetch(srv.base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:8443" },
      body: "{not json",
    })
    assert.equal(broken.status, 400)
    assert.doesNotMatch(await broken.text(), /SyntaxError|at \w+/)
  })
})

describe("rate limiting", () => {
  it("throttles repeated login attempts for one account", async () => {
    process.env.RATE_LIMIT_TEST = "on"
    try {
      const e = `ratelimit-${suffix}@example.test`
      const c = client(srv.base)
      const statuses: number[] = []
      for (let i = 0; i < 14; i++) statuses.push((await c.post("/api/auth/login", { email: e, password: "wrong password" })).status)
      assert.ok(statuses.includes(429), `expected a 429 in ${statuses.join(",")}`)
    } finally {
      delete process.env.RATE_LIMIT_TEST
    }
  })
})
