import { Router } from "express"
import type { RowDataPacket } from "mysql2/promise"
import { TtlCache } from "../cache.ts"
import { query } from "../db.ts"
import { PronunciationUnavailable, recordingFor } from "../pronunciation.ts"
import { parse } from "../http.ts"
import { wordsLimiter } from "../middleware/rateLimit.ts"
import { escapeLike, searchQuery, word as wordSchema } from "../schemas.ts"
import { cardFromEntry, type CardEntry, metaFromCard } from "../site/wordCard.ts"

export const words = Router()
words.use(wordsLimiter)

// Dictionary data only changes when `pnpm db:import` runs, and it is identical
// for every user, so it is safe to remember for a while and to let browsers keep.
const TEN_MIN = 10 * 60 * 1000
const searchCache = new TtlCache<string[]>(5000, TEN_MIN)
const entryCache = new TtlCache<unknown>(1000, TEN_MIN)
const publicCache = "public, max-age=300, stale-while-revalidate=600"

/**
 * Autocomplete: accent- and case-insensitive prefix match. A word is suggested
 * only when we have something to show for it (a sense, a thesaurus link or a
 * dictionary entry that is not just an inflected form) AND it appears in at
 * least one modern source. Dicionário Aberto alone does not count: it is a
 * 1913 dictionary, so its old spellings would otherwise flood the list.
 * Letters and two-letter fragments are skipped unless typed in full, and
 * lowercase words come before capitalised names and acronyms.
 * Anything can still be looked up by typing it exactly.
 */
words.get("/search", async (req, res) => {
  const { q, limit } = parse(searchQuery, req.query)
  const key = `${q.normalize("NFC").toLowerCase()}|${limit}`
  const cached = searchCache.get(key)
  if (cached) {
    res.setHeader("Cache-Control", publicCache)
    res.json({ results: cached })
    return
  }

  let results: string[] = []
  if (Array.from(q).length <= 3) {
    // 1-3 letters match far too many words to sort per keystroke: read the
    // precomputed best 20 (migration 008), plus the exact word if it is short.
    const [top, exact] = await Promise.all([
      query("SELECT lemma FROM suggest_top WHERE prefix = ? ORDER BY pos LIMIT ?", [q, String(limit)]),
      query("SELECT lemma FROM lemmas WHERE lemma = ? AND suggest_rank > 0 LIMIT 1", [q]),
    ])
    results = [...new Set([...exact, ...top].map((r) => r.lemma as string))].slice(0, limit)
  }
  if (!results.length) {
    // suggest_rank / suggest_score are precomputed (migrations 006, 007): rank 0
    // means "do not suggest"; a higher score means we know more about the word.
    const rows = await query(
      `SELECT l.lemma
         FROM lemmas l
        WHERE l.norm LIKE ? ESCAPE '|' AND l.suggest_rank > 0
          AND (CHAR_LENGTH(l.lemma) > 2 OR l.norm = ?)
        ORDER BY l.suggest_score DESC, (l.lemma = LOWER(l.lemma)) DESC, CHAR_LENGTH(l.lemma), l.lemma
        LIMIT ?`,
      [escapeLike(q) + "%", q, String(limit)],
    )
    results = rows.map((r) => r.lemma as string)
  }
  searchCache.set(key, results)
  res.setHeader("Cache-Control", publicCache)
  res.json({ results })
})

interface Row extends RowDataPacket {
  [k: string]: unknown
}

const group = <T>(rows: Row[], key: string, pick: (r: Row) => T) => {
  const m = new Map<number, T[]>()
  for (const r of rows) {
    const k = Number(r[key])
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(pick(r))
  }
  return m
}

/** Everything the dictionaries hold for a word, or null when none of them has it. Also behind the link previews. */
export async function loadEntry(w: string): Promise<unknown> {
  const cacheKey = w.normalize("NFC").toLowerCase()
  const hit = entryCache.get(cacheKey)
  if (hit) return hit

  // Accent/case-insensitive, with the exact spelling ranked first.
  const lemmas = await query<Row>(
    `SELECT l.id, l.lemma
       FROM lemmas l
      WHERE l.norm = ?
      ORDER BY (l.lemma = ?) DESC,
               EXISTS (SELECT 1 FROM senses s WHERE s.lemma_id = l.id) DESC,
               l.id
      LIMIT 3`,
    [w, w],
  )
  if (!lemmas.length) return null

  const entries = []
  for (const l of lemmas) {
    const id = Number(l.id)
    const [senses, examples, mates, broader, thesaurus, tags, sources, stop, dEntries, dSenses, dExamples] = await Promise.all([
      query<Row>(
        `SELECT s.id, s.pos, s.gloss
           FROM senses se JOIN synsets s ON s.id = se.synset_id
          WHERE se.lemma_id = ?
          ORDER BY FIELD(s.pos, 'n', 'v', 'a', 'r'), s.wn_id
          LIMIT 40`,
        [id],
      ),
      query<Row>(
        `SELECT e.synset_id, e.example
           FROM senses se JOIN synset_examples e ON e.synset_id = se.synset_id
          WHERE se.lemma_id = ?`,
        [id],
      ),
      query<Row>(
        `SELECT se2.synset_id, l2.lemma
           FROM senses se
           JOIN senses se2 ON se2.synset_id = se.synset_id AND se2.lemma_id <> se.lemma_id
           JOIN lemmas l2 ON l2.id = se2.lemma_id
          WHERE se.lemma_id = ?`,
        [id],
      ),
      query<Row>(
        `SELECT r.synset_id, l3.lemma
           FROM senses se
           JOIN synset_relations r ON r.synset_id = se.synset_id AND r.relation = 'hypernym'
           JOIN senses se3 ON se3.synset_id = r.target_synset_id
           JOIN lemmas l3 ON l3.id = se3.lemma_id
          WHERE se.lemma_id = ?`,
        [id],
      ),
      query<Row>(
        `SELECT r.relation, l2.lemma, src.slug
           FROM lemma_relations r
           JOIN lemmas l2 ON l2.id = r.related_lemma_id
           JOIN sources src ON src.id = r.source_id
          WHERE r.lemma_id = ?
         UNION ALL
         SELECT r.relation, l2.lemma, src.slug
           FROM lemma_relations r
           JOIN lemmas l2 ON l2.id = r.lemma_id
           JOIN sources src ON src.id = r.source_id
          WHERE r.related_lemma_id = ?`,
        [id, id],
      ),
      query<Row>("SELECT DISTINCT tag FROM lemma_tags WHERE lemma_id = ?", [id]),
      query<Row>(
        `SELECT src.slug, src.name, src.license, src.license_url, src.attribution
           FROM lemma_sources ls JOIN sources src ON src.id = ls.source_id
          WHERE ls.lemma_id = ?
         UNION
         SELECT src.slug, src.name, src.license, src.license_url, src.attribution
           FROM lemma_relations r JOIN sources src ON src.id = r.source_id
          WHERE r.lemma_id = ? OR r.related_lemma_id = ?`,
        [id, id, id],
      ),
      query<Row>("SELECT 1 AS x FROM stopwords WHERE word = ? LIMIT 1", [String(l.lemma)]),
      query<Row>(
        `SELECT e.id, e.pos, e.etymology, e.pronunciations, src.slug, src.name, src.license, src.license_url, src.attribution
           FROM dict_entries e JOIN sources src ON src.id = e.source_id
          WHERE e.lemma_id = ?
          ORDER BY e.source_id, e.id
          LIMIT 30`,
        [id],
      ),
      query<Row>(
        `SELECT s.id, s.entry_id, s.gloss, s.labels
           FROM dict_senses s JOIN dict_entries e ON e.id = s.entry_id
          WHERE e.lemma_id = ?
          ORDER BY s.entry_id, s.sense_no
          LIMIT 300`,
        [id],
      ),
      query<Row>(
        `SELECT x.sense_id, x.example
           FROM dict_examples x
           JOIN dict_senses s ON s.id = x.sense_id
           JOIN dict_entries e ON e.id = s.entry_id
          WHERE e.lemma_id = ?`,
        [id],
      ),
    ])

    const ex = group(examples, "synset_id", (r) => String(r.example))
    const mt = group(mates, "synset_id", (r) => String(r.lemma))
    const br = group(broader, "synset_id", (r) => String(r.lemma))
    const uniq = (a: string[] | undefined, n: number) => [...new Set(a ?? [])].slice(0, n)

    // Prose dictionaries (Wikcionário, Dicionário Aberto), grouped by source.
    const dEx = group(dExamples, "sense_id", (r) => String(r.example))
    const dSen = group(dSenses, "entry_id", (r) => ({
      text: String(r.gloss),
      labels: r.labels ? String(r.labels).split("|") : [],
      examples: dEx.get(Number(r.id)) ?? [],
    }))
    const dictionaries: {
      slug: string; name: string; license: string; licenseUrl: string | null; attribution: string
      entries: { pos: string | null; etymology: string | null; pronunciations: { ipa: string; region: string | null }[]; senses: { text: string; labels: string[]; examples: string[] }[] }[]
    }[] = []
    for (const e of dEntries) {
      const slug = String(e.slug)
      let d = dictionaries.find((x) => x.slug === slug)
      if (!d) {
        d = { slug, name: String(e.name), license: String(e.license), licenseUrl: e.license_url === null ? null : String(e.license_url), attribution: String(e.attribution), entries: [] }
        dictionaries.push(d)
      }
      d.entries.push({
        pos: e.pos === null ? null : String(e.pos),
        etymology: e.etymology === null ? null : String(e.etymology),
        pronunciations: Array.isArray(e.pronunciations) ? (e.pronunciations as { ipa: string; region: string | null }[]) : [],
        senses: dSen.get(Number(e.id)) ?? [],
      })
    }

    const synonyms = new Set<string>()
    const antonyms = new Set<string>()
    const antonymSlugs = new Set<string>()
    for (const r of thesaurus) {
      if (r.relation === "antonym") {
        antonyms.add(String(r.lemma))
        antonymSlugs.add(String(r.slug))
      } else synonyms.add(String(r.lemma))
    }
    for (const list of mt.values()) for (const s of list) synonyms.add(s)

    entries.push({
      word: String(l.lemma),
      isStopword: stop.length > 0,
      tags: tags.map((t) => String(t.tag)),
      senses: senses.map((s) => ({
        pos: String(s.pos),
        gloss: s.gloss === null ? null : String(s.gloss),
        examples: uniq(ex.get(Number(s.id)), 5),
        synonyms: uniq(mt.get(Number(s.id)), 15),
        broader: uniq(br.get(Number(s.id)), 8),
      })),
      dictionaries,
      synonyms: [...synonyms].slice(0, 60),
      antonyms: [...antonyms].slice(0, 30),
      antonymSources: sources.filter((s) => antonymSlugs.has(String(s.slug))).map((s) => String(s.name)),
      sources: sources.map((s) => ({
        slug: String(s.slug),
        name: String(s.name),
        license: String(s.license),
        licenseUrl: s.license_url === null ? null : String(s.license_url),
        attribution: String(s.attribution),
      })),
    })
  }
  const body = { query: w, entries }
  entryCache.set(cacheKey, body)
  return body
}

words.get("/:word", async (req, res) => {
  const body = await loadEntry(parse(wordSchema, req.params.word))
  if (!body) {
    res.status(404).json({ error: "not_found" })
    return
  }
  res.setHeader("Cache-Control", publicCache)
  res.json(body)
})

/** A real recording of the word, if Wikimedia Commons has one. Only words we hold are ever looked up there. */
words.get("/:word/audio", async (req, res) => {
  const body = (await loadEntry(parse(wordSchema, req.params.word))) as { entries: { word: string }[] } | null
  const lemma = body?.entries[0]?.word
  if (!lemma) {
    res.status(404).json({ error: "not_found" })
    return
  }
  try {
    const recording = await recordingFor(lemma)
    res.setHeader("Cache-Control", publicCache)
    res.json({ recording })
  } catch (e) {
    if (!(e instanceof PronunciationUnavailable)) throw e
    res.status(503).json({ error: "pronunciation_unavailable" })
  }
})

/** A word page's preview tags as data, for the Vite dev server, which has no database of its own. */
words.get("/:word/preview", async (req, res) => {
  const body = (await loadEntry(parse(wordSchema, req.params.word))) as { entries: CardEntry[] } | null
  const entry = body?.entries[0]
  res.json({ found: !!entry, meta: entry ? metaFromCard(cardFromEntry(entry)) : null })
})
