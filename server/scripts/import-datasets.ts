import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { createInterface } from "node:readline"
import { strFromU8, unzipSync } from "fflate"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { Connection, RowDataPacket } from "mysql2/promise"
import { SOURCES, type DatasetSource } from "./datasets.ts"
import { connectMigrator } from "./lib/db.ts"
import { serverRoot } from "./lib/env.ts"
import * as P from "./parsers.ts"

const raw = join(serverRoot, "data", "raw")
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"))

type Counts = Record<string, number>

async function sha256(path: string) {
  const h = createHash("sha256")
  for await (const chunk of createReadStream(path)) h.update(chunk as Buffer)
  return h.digest("hex")
}

// Refuse to import anything that does not match the pinned checksums.
async function verify(src: DatasetSource) {
  const lock = JSON.parse(await readFile(join(serverRoot, "datasets.lock.json"), "utf8")) as Record<string, { sha256: string }>
  for (const f of src.files) {
    const key = `${src.slug}/${f.as}`
    if (!lock[key]) throw new Error(`${key} is not in datasets.lock.json. Run "pnpm datasets:fetch".`)
    if ((await sha256(join(raw, src.slug, f.as))) !== lock[key].sha256) {
      throw new Error(`${key} does not match datasets.lock.json. Re-run "pnpm datasets:fetch".`)
    }
  }
}

const text = (slug: string, file: string, enc: BufferEncoding = "utf8") => readFile(join(raw, slug, file), enc)

async function insertBatches(conn: Connection, sql: string, rows: unknown[][], size = 4000) {
  for (let i = 0; i < rows.length; i += size) {
    await conn.query(sql, [rows.slice(i, i + size)])
  }
}

/** Makes sure every lemma exists and returns lemma -> id. */
async function ensureLemmas(conn: Connection, lemmas: Iterable<string>): Promise<Map<string, number>> {
  const list = [...new Set(lemmas)]
  await insertBatches(conn, "INSERT IGNORE INTO lemmas (lemma, norm) VALUES ?", list.map((l) => [l, l]), 5000)
  const ids = new Map<string, number>()
  for (let i = 0; i < list.length; i += 2000) {
    const [rows] = await conn.query<RowDataPacket[]>("SELECT id, lemma FROM lemmas WHERE lemma IN (?)", [list.slice(i, i + 2000)])
    for (const r of rows) ids.set(r.lemma as string, r.id as number)
  }
  const missing = list.filter((l) => !ids.has(l))
  if (missing.length) {
    // Strings MySQL's collation treats as equal to an existing lemma. Resolve one by one.
    for (const l of missing) {
      const [rows] = await conn.query<RowDataPacket[]>("SELECT id FROM lemmas WHERE lemma = ? LIMIT 1", [l])
      if (rows[0]) ids.set(l, rows[0].id as number)
    }
  }
  return ids
}

async function sourceId(conn: Connection, src: DatasetSource, kind: string): Promise<number> {
  await conn.query(
    `INSERT INTO sources (slug, name, kind, license, license_url, homepage, attribution, commit_sha)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), kind = VALUES(kind), license = VALUES(license),
       license_url = VALUES(license_url), homepage = VALUES(homepage),
       attribution = VALUES(attribution), commit_sha = VALUES(commit_sha)`,
    [src.slug, src.name, kind, src.license, src.licenseUrl, src.homepage, src.attribution, src.sha || null],
  )
  const [rows] = await conn.query<RowDataPacket[]>("SELECT id FROM sources WHERE slug = ?", [src.slug])
  return rows[0]!.id as number
}

async function clearSource(conn: Connection, id: number) {
  // Re-imports replace a source's rows. Lemmas themselves are kept so ids that
  // users have saved stay valid.
  for (const t of ["synsets", "lemma_relations", "lemma_sources", "lemma_tags", "stopwords", "dict_entries"]) {
    await conn.query(`DELETE FROM ${t} WHERE source_id = ?`, [id])
  }
}

async function finish(conn: Connection, id: number, counts: Counts) {
  await conn.query("UPDATE sources SET imported_at = UTC_TIMESTAMP(), row_counts = ? WHERE id = ?", [JSON.stringify(counts), id])
}


/** Writes prose-dictionary entries (senses, examples, relations) with ids assigned here. */
async function writeDictEntries(
  conn: Connection,
  sourceId: number,
  entries: P.DictEntryData[],
  state: { entry: number; sense: number },
): Promise<Counts> {
  const names = new Set<string>()
  for (const e of entries) {
    names.add(e.lemma)
    for (const w of [...e.synonyms, ...e.antonyms]) names.add(w)
  }
  const ids = await ensureLemmas(conn, names)

  const entryRows: unknown[][] = []
  const senseRows: unknown[][] = []
  const exampleRows: unknown[][] = []
  const relRows: unknown[][] = []
  const seenRel = new Set<string>()
  for (const e of entries) {
    const lemmaId = ids.get(e.lemma)
    if (!lemmaId) continue
    const entryId = state.entry++
    entryRows.push([entryId, sourceId, lemmaId, e.pos, e.etymology, e.pronunciations.length ? JSON.stringify(e.pronunciations) : null])
    e.senses.forEach((s, i) => {
      const senseId = state.sense++
      senseRows.push([senseId, entryId, i + 1, s.text, s.labels.length ? s.labels.join("|") : null])
      for (const ex of s.examples) exampleRows.push([senseId, ex])
    })
    for (const [list, relation] of [[e.synonyms, "synonym"], [e.antonyms, "antonym"]] as const) {
      for (const w of list) {
        const other = ids.get(w)
        if (!other || other === lemmaId) continue
        const k = `${lemmaId}|${relation}|${other}`
        if (seenRel.has(k) || seenRel.has(`${other}|${relation}|${lemmaId}`)) continue
        seenRel.add(k)
        relRows.push([lemmaId, relation, other, sourceId])
      }
    }
  }
  await insertBatches(conn, "INSERT INTO dict_entries (id, source_id, lemma_id, pos, etymology, pronunciations) VALUES ?", entryRows)
  await insertBatches(conn, "INSERT INTO dict_senses (id, entry_id, sense_no, gloss, labels) VALUES ?", senseRows)
  await insertBatches(conn, "INSERT INTO dict_examples (sense_id, example) VALUES ?", exampleRows)
  await insertBatches(conn, "INSERT IGNORE INTO lemma_relations (lemma_id, relation, related_lemma_id, source_id) VALUES ?", relRows)
  await insertBatches(conn, "INSERT IGNORE INTO lemma_sources (lemma_id, source_id) VALUES ?", entryRows.map((r) => [r[2], sourceId]))
  return { entries: entryRows.length, senses: senseRows.length, examples: exampleRows.length, relations: relRows.length }
}

async function nextIds(conn: Connection) {
  const [[e], [s]] = await Promise.all([
    conn.query<RowDataPacket[]>("SELECT COALESCE(MAX(id), 0) + 1 AS n FROM dict_entries"),
    conn.query<RowDataPacket[]>("SELECT COALESCE(MAX(id), 0) + 1 AS n FROM dict_senses"),
  ])
  return { entry: Number(e[0]!.n), sense: Number(s[0]!.n) }
}

const add = (a: Counts, b: Counts) => {
  for (const [k, v] of Object.entries(b)) a[k] = (a[k] ?? 0) + v
  return a
}

const importers: Record<string, (conn: Connection, src: DatasetSource, id: number) => Promise<Counts>> = {
  async "openwordnet-pt"(conn, _src, id) {
    const synsets = P.parseSynsets((await text("openwordnet-pt", "synsets.ttl")) as string)
    const senses = P.parseWordSenses((await text("openwordnet-pt", "wordsenses.ttl")) as string)
    const triples = P.parseRelations((await text("openwordnet-pt", "relations.ttl")) as string)

    const lemmaIds = await ensureLemmas(conn, senses.map((s) => s.lemma))
    await insertBatches(conn, "INSERT INTO synsets (wn_id, pos, gloss, source_id) VALUES ?", synsets.map((s) => [s.wnId, s.pos, s.gloss, id]))
    const [rows] = await conn.query<RowDataPacket[]>("SELECT id, wn_id FROM synsets WHERE source_id = ?", [id])
    const synsetIds = new Map(rows.map((r) => [r.wn_id as string, r.id as number]))

    const examples = synsets.flatMap((s) => s.examples.map((e) => [synsetIds.get(s.wnId)!, e]))
    await insertBatches(conn, "INSERT INTO synset_examples (synset_id, example) VALUES ?", examples)

    const senseRows: number[][] = []
    const senseLemma = new Map<string, number>()
    for (const s of senses) {
      const sid = synsetIds.get(s.wnId)
      const lid = lemmaIds.get(s.lemma)
      if (!sid || !lid) continue
      senseRows.push([sid, s.no, lid])
      senseLemma.set(`${s.wnId}-${s.no}`, lid)
    }
    await insertBatches(conn, "INSERT IGNORE INTO senses (synset_id, sense_no, lemma_id) VALUES ?", senseRows)

    // Synset relations. Hyponym/hypernym are stored once, as "X has hypernym Y".
    const rel = new Set<string>()
    const relRows: (string | number)[][] = []
    const antonyms: (string | number)[][] = []
    for (const t of triples) {
      const [sk, sv] = t.subject.split(":") as [string, string]
      const [ok, ov] = t.object.split(":") as [string, string]
      if (sk === "wordsense" && ok === "wordsense" && t.predicate === "antonymOf") {
        const a = senseLemma.get(sv)
        const b = senseLemma.get(ov)
        if (a && b && a !== b) antonyms.push([a, "antonym", b, id], [b, "antonym", a, id])
        continue
      }
      if (sk !== "synset" || ok !== "synset") continue
      let from = synsetIds.get(sv)
      let to = synsetIds.get(ov)
      let name = t.predicate
      if (name === "hypernymOf") [from, to, name] = [to, from, "hypernym"]
      else if (name === "hyponymOf") name = "hypernym"
      if (!from || !to) continue
      const key = `${from}|${name}|${to}`
      if (rel.has(key)) continue
      rel.add(key)
      relRows.push([from, name, to])
    }
    await insertBatches(conn, "INSERT INTO synset_relations (synset_id, relation, target_synset_id) VALUES ?", relRows)
    await insertBatches(conn, "INSERT IGNORE INTO lemma_relations (lemma_id, relation, related_lemma_id, source_id) VALUES ?", antonyms)
    await insertBatches(conn, "INSERT IGNORE INTO lemma_sources (lemma_id, source_id) VALUES ?", [...new Set(lemmaIds.values())].map((l) => [l, id]))

    return {
      synsets: synsets.length,
      glosses: synsets.filter((s) => s.gloss).length,
      examples: examples.length,
      senses: senseRows.length,
      lemmas: new Set(lemmaIds.values()).size,
      synset_relations: relRows.length,
      antonym_links: antonyms.length,
    }
  },

  async dicsin(conn, _src, id) {
    const { entries, dropped, repaired } = P.parseDicSin((await text("dicsin", "th_pt_BR.dat")) as string)
    const lemmaIds = await ensureLemmas(conn, entries.flatMap((e) => [e.head, ...e.related]))
    const seen = new Set<string>()
    const rows: (string | number)[][] = []
    for (const e of entries) {
      const a = lemmaIds.get(e.head)
      if (!a) continue
      for (const r of e.related) {
        const b = lemmaIds.get(r)
        if (!b || a === b) continue
        const key = `${a}|${e.relation}|${b}`
        const rev = `${b}|${e.relation}|${a}`
        // Synonymy and antonymy are symmetric: keep one row per pair.
        if (seen.has(key) || seen.has(rev)) continue
        seen.add(key)
        rows.push([a, e.relation, b, id])
      }
    }
    await insertBatches(conn, "INSERT IGNORE INTO lemma_relations (lemma_id, relation, related_lemma_id, source_id) VALUES ?", rows)
    await insertBatches(conn, "INSERT IGNORE INTO lemma_sources (lemma_id, source_id) VALUES ?", [...new Set(lemmaIds.values())].map((l) => [l, id]))
    return {
      entries: entries.length,
      relations: rows.length,
      lemmas: new Set(lemmaIds.values()).size,
      headwords_dropped_corrupted: dropped,
      headwords_repaired: repaired,
    }
  },

  async vero(conn, _src, id) {
    // The upstream files are ISO-8859-1.
    const words = P.parseHunspellDic((await text("vero", "pt_BR.dic", "latin1")) as string)
    const lemmaIds = await ensureLemmas(conn, words)
    await insertBatches(conn, "INSERT IGNORE INTO lemma_sources (lemma_id, source_id) VALUES ?", [...lemmaIds.values()].map((l) => [l, id]))
    return { lemmas: lemmaIds.size }
  },

  async "br-ispell"(conn, _src, id) {
    const items = P.parseIspell((await text("br-ispell", "E-2.5", "latin1")) as string)
    const lemmaIds = await ensureLemmas(conn, items.map((i) => i.word))
    await insertBatches(conn, "INSERT IGNORE INTO lemma_sources (lemma_id, source_id) VALUES ?", [...lemmaIds.values()].map((l) => [l, id]))
    const tags = items.filter((i) => i.tag && lemmaIds.has(i.word)).map((i) => [lemmaIds.get(i.word)!, id, i.tag])
    await insertBatches(conn, "INSERT IGNORE INTO lemma_tags (lemma_id, source_id, tag) VALUES ?", tags)
    return { lemmas: lemmaIds.size, tagged: tags.length }
  },

  async "stopwords-pt"(conn, _src, id) {
    const words = P.parseStopwords((await text("stopwords-pt", "stopwords-pt.txt")) as string)
    await insertBatches(conn, "INSERT IGNORE INTO stopwords (word, source_id) VALUES ?", words.map((w) => [w, id]))
    return { stopwords: words.length }
  },

  async wikcionario(conn, _src, id) {
    // ~340 MB: streamed line by line and written in chunks, never held in memory at once.
    const state = await nextIds(conn)
    const total: Counts = {}
    let chunk: P.DictEntryData[] = []
    const flush = async () => {
      if (chunk.length) add(total, await writeDictEntries(conn, id, chunk, state))
      chunk = []
    }
    const rl = createInterface({ input: createReadStream(join(raw, "wikcionario", "pt.jsonl"), "utf8"), crlfDelay: Infinity })
    for await (const line of rl) {
      const e = P.parseWiktionaryLine(line)
      if (e) chunk.push(e)
      if (chunk.length >= 4000) await flush()
    }
    await flush()
    return total
  },

  async "dicionario-aberto"(conn, _src, id) {
    const files = unzipSync(new Uint8Array(await readFile(join(raw, "dicionario-aberto", "xmls.zip"))), {
      // Read only the XML files; the archive is third-party data and nothing is written to disk.
      filter: (f) => /^xmls\/[A-Za-z0-9_-]+\.xml$/.test(f.name) && f.originalSize < 50_000_000,
    })
    const entries: P.DictEntryData[] = []
    for (const name of Object.keys(files).sort()) entries.push(...P.parseDicionarioAberto(strFromU8(files[name]!)))
    const state = await nextIds(conn)
    const total: Counts = {}
    for (let i = 0; i < entries.length; i += 4000) add(total, await writeDictEntries(conn, id, entries.slice(i, i + 4000), state))
    return total
  },
}

const kinds: Record<string, string> = {
  "openwordnet-pt": "wordnet",
  dicsin: "thesaurus",
  vero: "wordlist",
  "br-ispell": "wordlist",
  "stopwords-pt": "stopwords",
  wikcionario: "dictionary",
  "dicionario-aberto": "dictionary",
}

const conn = await connectMigrator()
for (const src of SOURCES) {
  if (only.length && !only.includes(src.slug)) continue
  const run = importers[src.slug]
  if (!run) throw new Error(`No importer for ${src.slug}`)
  await verify(src)
  const started = Date.now()
  await conn.query("START TRANSACTION")
  try {
    const id = await sourceId(conn, src, kinds[src.slug]!)
    await clearSource(conn, id)
    const counts = await run(conn, src, id)
    await finish(conn, id, counts)
    await conn.query("COMMIT")
    console.log(`${src.slug.padEnd(15)} ${((Date.now() - started) / 1000).toFixed(1)}s  ${JSON.stringify(counts)}`)
  } catch (e) {
    await conn.query("ROLLBACK")
    throw e
  }
}
// Recompute which words autocomplete may suggest (see migration 006).
if (!only.length || only.some((o) => o !== "stopwords-pt")) {
  const t = Date.now()
  await conn.query("CALL refresh_suggest_ranks()")
  await conn.query("CALL refresh_suggest_top()")
  console.log(`suggestions     ${((Date.now() - t) / 1000).toFixed(1)}s  ranks and short-prefix tops refreshed`)
}
console.log(`skipped (unusable) records while parsing: ${P.stats.skipped}`)
await conn.end()
