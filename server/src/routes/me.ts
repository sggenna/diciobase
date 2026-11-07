import { Router } from "express"
import { withUser } from "../db.ts"
import { HttpError, parse, requireAuth } from "../http.ts"
import { clearSessionCookie, needAuth } from "../middleware/auth.ts"
import { userLimiter } from "../middleware/rateLimit.ts"
import { hashPassword, verifyDummy, verifyPassword } from "../security/password.ts"
import {
  changePasswordBody, deleteAccountBody, idParam, page, profilePatch, saveBody, searchBody, settingsPatch,
} from "../schemas.ts"

export const me = Router()
me.use(needAuth)

// Every query below is a static string with ? placeholders and runs inside
// withUser(), so MySQL additionally confines it to the signed-in user's rows.
// Each one also names user_id explicitly, so it can use the table indexes.

const asJson = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v)

me.get("/", async (req, res) => {
  const { userId } = requireAuth(req)
  const out = await withUser(userId, async (db) => {
    const [profile] = await db.query("SELECT id, email, display_name, created_at, last_login_at FROM my_profile WHERE id = ?", [userId])
    const [settings] = await db.query(
      "SELECT notifications_enabled, tips_enabled, interests, active_dicts FROM my_settings WHERE user_id = ?",
      [userId],
    )
    const [counts] = await db.query(
      `SELECT (SELECT COUNT(*) FROM my_saved_words WHERE user_id = ?) AS saved,
              (SELECT COUNT(*) FROM my_search_history WHERE user_id = ?) AS searches`,
      [userId, userId],
    )
    return { profile, settings, counts }
  })
  if (!out.profile) throw new HttpError(401, "unauthorized")
  res.json({
    user: { id: Number(out.profile.id), email: out.profile.email, name: out.profile.display_name, createdAt: out.profile.created_at, lastLoginAt: out.profile.last_login_at },
    settings: out.settings && {
      notifications: !!out.settings.notifications_enabled,
      tips: !!out.settings.tips_enabled,
      interests: asJson(out.settings.interests),
      dicts: asJson(out.settings.active_dicts),
    },
    stats: { saved: Number(out.counts?.saved ?? 0), searches: Number(out.counts?.searches ?? 0) },
  })
})

me.patch("/", async (req, res) => {
  const { userId } = requireAuth(req)
  const body = parse(profilePatch, req.body)
  await withUser(userId, (db) => db.run("UPDATE my_profile SET display_name = ? WHERE id = ?", [body.name, userId]))
  res.json({ ok: true })
})

me.patch("/settings", async (req, res) => {
  const { userId } = requireAuth(req)
  const b = parse(settingsPatch, req.body)
  await withUser(userId, (db) =>
    db.run(
      `UPDATE my_settings
          SET notifications_enabled = COALESCE(?, notifications_enabled),
              tips_enabled          = COALESCE(?, tips_enabled),
              interests             = COALESCE(CAST(? AS JSON), interests),
              active_dicts          = COALESCE(CAST(? AS JSON), active_dicts)
        WHERE user_id = ?`,
      [
        b.notifications === undefined ? null : Number(b.notifications),
        b.tips === undefined ? null : Number(b.tips),
        b.interests === undefined ? null : JSON.stringify(b.interests),
        b.dicts === undefined ? null : JSON.stringify(b.dicts),
        userId,
      ],
    ),
  )
  res.json({ ok: true })
})

/* ------------------------------- saved words ------------------------------- */

me.get("/saved", async (req, res) => {
  const { userId } = requireAuth(req)
  const { limit, offset } = parse(page, req.query)
  const rows = await withUser(userId, (db) =>
    db.query(
      `SELECT s.lemma_id, l.lemma, s.saved_at,
              (SELECT sy.pos FROM senses se JOIN synsets sy ON sy.id = se.synset_id
                WHERE se.lemma_id = l.id ORDER BY FIELD(sy.pos, 'n', 'v', 'a', 'r'), sy.wn_id LIMIT 1) AS pos,
              (SELECT JSON_ARRAY(ds.gloss, src.name)
                 FROM dict_entries de
                 JOIN dict_senses ds ON ds.entry_id = de.id
                 JOIN sources src ON src.id = de.source_id
                WHERE de.lemma_id = l.id
                ORDER BY de.source_id, de.id, ds.sense_no LIMIT 1) AS prose,
              (SELECT sy.gloss FROM senses se JOIN synsets sy ON sy.id = se.synset_id
                WHERE se.lemma_id = l.id AND sy.gloss IS NOT NULL
                ORDER BY FIELD(sy.pos, 'n', 'v', 'a', 'r'), sy.wn_id LIMIT 1) AS gloss
         FROM my_saved_words s JOIN lemmas l ON l.id = s.lemma_id
        WHERE s.user_id = ?
        ORDER BY s.saved_at DESC, s.lemma_id DESC
        LIMIT ? OFFSET ?`,
      [userId, String(limit), String(offset)],
    ),
  )
  res.json({
    // The card shows the definition the word's page opens on: the first sense of the first dictionary, in the
    // page's tab order, else the OpenWordnet-PT gloss. It always says which source it is from.
    saved: rows.map((r) => {
      const prose = asJson(r.prose) as [string, string] | null
      const [gloss, source] = prose ?? (r.gloss ? [r.gloss, "OpenWordnet-PT"] : [null, null])
      return { id: Number(r.lemma_id), word: r.lemma, pos: r.pos, gloss, source, savedAt: r.saved_at }
    }),
  })
})

me.post("/saved", async (req, res) => {
  const { userId } = requireAuth(req)
  const { word } = parse(saveBody, req.body)
  const result = await withUser(userId, async (db) => {
    // Exact spelling first, then the accent/case-insensitive match that has entries.
    const [lemma] = await db.query(
      `SELECT l.id, l.lemma FROM lemmas l
        WHERE l.norm = ?
        ORDER BY (l.lemma = ?) DESC, EXISTS (SELECT 1 FROM senses s WHERE s.lemma_id = l.id) DESC, l.id
        LIMIT 1`,
      [word, word],
    )
    if (!lemma) return null
    try {
      await db.run("INSERT INTO my_saved_words (user_id, lemma_id) VALUES (?, ?)", [userId, Number(lemma.id)])
    } catch (e) {
      // Already saved: that is the state the caller asked for, not an error.
      if ((e as { errno?: number }).errno !== 1062) throw e
    }
    return { id: Number(lemma.id), word: String(lemma.lemma) }
  })
  if (!result) throw new HttpError(404, "word_not_found")
  res.status(201).json({ saved: result })
})

me.delete("/saved/:id", async (req, res) => {
  const { userId } = requireAuth(req)
  const id = parse(idParam, req.params.id)
  const r = await withUser(userId, (db) => db.run("DELETE FROM my_saved_words WHERE user_id = ? AND lemma_id = ?", [userId, id]))
  res.json({ removed: r.affectedRows > 0 })
})

/* ---------------------------- search history ------------------------------- */

const KEEP_SEARCHES = 500

me.get("/searches", async (req, res) => {
  const { userId } = requireAuth(req)
  const { limit } = parse(page, req.query)
  const rows = await withUser(userId, (db) =>
    db.query(
      `SELECT query, MAX(searched_at) AS last_at
         FROM my_search_history WHERE user_id = ?
        GROUP BY query ORDER BY last_at DESC LIMIT ?`,
      [userId, String(limit)],
    ),
  )
  res.json({ searches: rows.map((r) => ({ query: r.query, at: r.last_at })) })
})

me.post("/searches", async (req, res) => {
  const { userId } = requireAuth(req)
  const { query } = parse(searchBody, req.body)
  await withUser(userId, async (db) => {
    await db.run("INSERT INTO my_search_history (user_id, query) VALUES (?, ?)", [userId, query])
    // Bounded history: drop everything older than the newest KEEP_SEARCHES entries.
    await db.run(
      `DELETE FROM my_search_history
        WHERE user_id = ?
          AND id < (SELECT cutoff FROM (SELECT id AS cutoff FROM my_search_history
                     WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET ?) AS t)`,
      [userId, userId, String(KEEP_SEARCHES - 1)],
    )
  })
  res.status(201).json({ ok: true })
})

me.delete("/searches", async (req, res) => {
  const { userId } = requireAuth(req)
  const r = await withUser(userId, (db) => db.run("DELETE FROM my_search_history WHERE user_id = ?", [userId]))
  res.json({ removed: r.affectedRows })
})

/* -------------------------------- sessions --------------------------------- */

me.get("/sessions", async (req, res) => {
  const { userId, sessionId } = requireAuth(req)
  const rows = await withUser(userId, (db) =>
    db.query("SELECT id, user_agent, created_at, last_used_at, expires_at FROM my_sessions WHERE user_id = ? ORDER BY last_used_at DESC", [userId]),
  )
  res.json({
    sessions: rows.map((r) => ({
      id: Number(r.id), current: Number(r.id) === sessionId, userAgent: r.user_agent, createdAt: r.created_at, lastUsedAt: r.last_used_at, expiresAt: r.expires_at,
    })),
  })
})

me.delete("/sessions/:id", async (req, res) => {
  const { userId } = requireAuth(req)
  const id = parse(idParam, req.params.id)
  const r = await withUser(userId, (db) => db.run("DELETE FROM my_sessions WHERE user_id = ? AND id = ?", [userId, id]))
  res.json({ revoked: r.affectedRows > 0 })
})

// "Sign out everywhere else".
me.delete("/sessions", async (req, res) => {
  const { userId, sessionId } = requireAuth(req)
  const r = await withUser(userId, (db) => db.run("DELETE FROM my_sessions WHERE user_id = ? AND id <> ?", [userId, sessionId]))
  res.json({ revoked: r.affectedRows })
})

/* ------------------------- password, export, delete ------------------------ */

async function checkPassword(userId: number, password: string): Promise<void> {
  const rows = await withUser(userId, (db) => db.call("auth_get_my_hash"))
  const hash = rows[0]?.password_hash
  const ok = typeof hash === "string" ? await verifyPassword(hash, password) : (await verifyDummy(password), false)
  if (!ok) throw new HttpError(403, "wrong_password")
}

me.post("/password", userLimiter, async (req, res) => {
  const { userId, sessionId } = requireAuth(req)
  const body = parse(changePasswordBody, req.body)
  await checkPassword(userId, body.current)
  const hash = await hashPassword(body.next)
  await withUser(userId, (db) => db.call("auth_change_password", [hash, sessionId]))
  res.json({ ok: true }) // every other session was signed out
})

// LGPD/GDPR: everything we hold about the user, as one JSON document.
me.get("/export", async (req, res) => {
  const { userId } = requireAuth(req)
  const data = await withUser(userId, async (db) => ({
    profile: (await db.query("SELECT id, email, display_name, created_at, last_login_at FROM my_profile WHERE id = ?", [userId]))[0],
    settings: (await db.query("SELECT notifications_enabled, tips_enabled, interests, active_dicts FROM my_settings WHERE user_id = ?", [userId]))[0],
    saved: await db.query("SELECT l.lemma AS word, s.saved_at FROM my_saved_words s JOIN lemmas l ON l.id = s.lemma_id WHERE s.user_id = ? ORDER BY s.saved_at", [userId]),
    searches: await db.query("SELECT query, searched_at FROM my_search_history WHERE user_id = ? ORDER BY id", [userId]),
    sessions: await db.query("SELECT user_agent, created_at, last_used_at FROM my_sessions WHERE user_id = ?", [userId]),
  }))
  res.setHeader("Content-Disposition", 'attachment; filename="diciobase-meus-dados.json"')
  res.json(data)
})

me.post("/delete-account", userLimiter, async (req, res) => {
  const { userId } = requireAuth(req)
  const body = parse(deleteAccountBody, req.body)
  await checkPassword(userId, body.password)
  await withUser(userId, (db) => db.call("auth_delete_me"))
  clearSessionCookie(res)
  res.status(204).end()
})

