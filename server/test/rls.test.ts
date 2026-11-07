import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"
import { createHmac } from "node:crypto"
import { callProc, pool, query, run, withUser } from "../src/db.ts"
import { connectMigrator } from "../scripts/lib/db.ts"
import { mintContext } from "../src/security/rls.ts"

const suffix = Date.now().toString(36)
let alice = 0
let bob = 0
let lemma1 = 0
let lemma2 = 0

async function register(email: string, name: string) {
  const rows = await callProc("auth_register", [email, "$argon2id$not-a-real-hash", name])
  return Number(rows[0]?.id)
}

before(async () => {
  alice = await register(`alice-${suffix}@example.test`, "Alice")
  bob = await register(`bob-${suffix}@example.test`, "Bob")
  const admin = await connectMigrator()
  await admin.execute("INSERT INTO lemmas (lemma, norm) VALUES (?, ?), (?, ?)", [
    `zz-teste-${suffix}-a`, `zz-teste-${suffix}-a`, `zz-teste-${suffix}-b`, `zz-teste-${suffix}-b`,
  ])
  await admin.end()
  const l = await query("SELECT id FROM lemmas WHERE lemma LIKE ? ORDER BY id", [`zz-teste-${suffix}-%`])
  lemma1 = Number(l[0]?.id)
  lemma2 = Number(l[1]?.id)
  assert.ok(alice > 0 && bob > 0 && lemma1 && lemma2, "fixtures")
})

after(async () => {
  const admin = await connectMigrator()
  await admin.execute("DELETE FROM users WHERE email IN (?, ?)", [
    `alice-${suffix}@example.test`,
    `bob-${suffix}@example.test`,
  ])
  await admin.execute("DELETE FROM lemmas WHERE lemma LIKE ?", [`zz-teste-${suffix}-%`])
  await admin.end()
  await pool.end()
})

describe("row-level security", () => {
  it("MySQL's HMAC check matches Node's (context is verifiable inside the database)", async () => {
    await withUser(alice, async (db) => {
      const rows = await db.query("SELECT id FROM my_profile")
      assert.deepEqual(rows.map((r) => Number(r.id)), [alice])
    })
  })

  it("a user only ever sees their own rows, even when the query has no WHERE", async () => {
    await withUser(alice, (db) => db.run("INSERT INTO my_saved_words (user_id, lemma_id) VALUES (?, ?)", [alice, lemma1]))
    await withUser(bob, (db) => db.run("INSERT INTO my_saved_words (user_id, lemma_id) VALUES (?, ?)", [bob, lemma2]))

    const aliceRows = await withUser(alice, (db) => db.query("SELECT user_id, lemma_id FROM my_saved_words"))
    assert.deepEqual(aliceRows.map((r) => [Number(r.user_id), Number(r.lemma_id)]), [[alice, lemma1]])
    const bobRows = await withUser(bob, (db) => db.query("SELECT user_id, lemma_id FROM my_saved_words"))
    assert.deepEqual(bobRows.map((r) => [Number(r.user_id), Number(r.lemma_id)]), [[bob, lemma2]])
  })

  it("cannot read another user's profile by id", async () => {
    const rows = await withUser(alice, (db) => db.query("SELECT id FROM my_profile WHERE id = ?", [bob]))
    assert.equal(rows.length, 0)
  })

  it("cannot insert a row for someone else (WITH CHECK OPTION)", async () => {
    await assert.rejects(
      withUser(alice, (db) => db.run("INSERT INTO my_saved_words (user_id, lemma_id) VALUES (?, ?)", [bob, lemma1])),
      /CHECK OPTION/i,
    )
  })

  it("cannot update or delete someone else's rows", async () => {
    const upd = await withUser(alice, (db) => db.run("UPDATE my_profile SET display_name = 'pwned' WHERE id = ?", [bob]))
    assert.equal(upd.affectedRows, 0)
    const del = await withUser(alice, (db) => db.run("DELETE FROM my_saved_words WHERE user_id = ?", [bob]))
    assert.equal(del.affectedRows, 0)
    const still = await withUser(bob, (db) => db.query("SELECT lemma_id FROM my_saved_words"))
    assert.equal(still.length, 1)
  })

  it("with no context, the views return nothing", async () => {
    const rows = await query("SELECT * FROM my_saved_words")
    assert.equal(rows.length, 0)
  })

  it("a forged, tampered or expired context is rejected inside MySQL", async () => {
    const real = mintContext(alice)
    const [uid, exp, sig] = real.split(".") as [string, string, string]
    const forged = [
      `${bob}.${exp}.${sig}`, // signature for alice, claiming to be bob
      `${bob}.${exp}.${"0".repeat(64)}`,
      `${bob}.${Math.floor(Date.now() / 1000) + 60}.${createHmac("sha256", "wrong-key").update(`${bob}.x`).digest("hex")}`,
      mintContext(alice, Date.now() - 120_000), // expired
      `${uid}.${exp}.${sig.toUpperCase()}`,
      "1.9999999999.deadbeef",
      "' OR 1=1 -- ",
    ]
    for (const ctx of forged) {
      const conn = await pool.getConnection()
      try {
        await conn.execute("SET @app_ctx = ?", [ctx])
        const [rows] = await conn.execute<import("mysql2").RowDataPacket[]>("SELECT id FROM my_profile")
        if (rows.length !== 0) assert.fail(`context was accepted: ${ctx.slice(0, 40)}`)
      } finally {
        await conn.query("SET @app_ctx = NULL")
        conn.release()
      }
    }
  })

  it("the API account cannot touch user tables or the key table directly", async () => {
    for (const sql of [
      "SELECT * FROM users",
      "SELECT * FROM sessions",
      "SELECT * FROM saved_words",
      "SELECT * FROM rls_keys",
      "SELECT * FROM audit_log",
      "DELETE FROM users",
      "UPDATE users SET password_hash = 'x'",
      "INSERT INTO users (email, password_hash, display_name) VALUES ('a@b.c', 'x', 'x')",
      "DROP TABLE saved_words",
      "CREATE TABLE evil (id INT)",
    ]) {
      await assert.rejects(pool.query(sql), (e: { errno?: number }) => e.errno === 1142 || e.errno === 1044 || e.errno === 1143, sql)
    }
  })

  it("the API account cannot write dictionary data, set variables to forge identity, or call internals", async () => {
    await assert.rejects(pool.query("DELETE FROM lemmas"), (e: { errno?: number }) => e.errno === 1142)
    await assert.rejects(pool.query("SELECT app_user_id()"), (e: { errno?: number }) => e.errno === 1370 || e.errno === 1142)
    await assert.rejects(pool.query("CALL auth_change_password('x', 0)"), /no_context/)
  })

  it("stacked statements are refused", async () => {
    await assert.rejects(pool.query("SELECT 1; SELECT 2"), (e: { errno?: number }) => e.errno === 1064)
  })

  it("auth_change_password and auth_delete_me need a valid context", async () => {
    await run("SET @app_ctx = NULL")
    await assert.rejects(
      withUser(alice, async (db) => {
        await db.run("SET @app_ctx = NULL")
        await db.call("auth_delete_me")
      }),
      /no_context/,
    )
    const stillThere = await withUser(alice, (db) => db.query("SELECT id FROM my_profile"))
    assert.equal(stillThere.length, 1)
  })
})
