// Publishes the dictionary as static files, so the site can run with no server or database:
//   public/data/v1/e/<shard>.json.gz   { normalised word: entries as the API returns them }
//   public/data/v1/s/<prefix>.json.gz  autocomplete words, best first
// Dictionary data only changes on import, so run this after `pnpm db:import`:  pnpm export:static
// Words with nothing to show (only in the word lists) are left out.
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { DATA_ROOT, entryFile, normKey, suggestFile } from "../../src/lib/staticKeys.ts"
import { pool, query } from "../src/db.ts"
import { loadEntry } from "../src/routes/words.ts"
import { serverRoot } from "./lib/env.ts"

interface Entry {
  word: string
  senses: unknown[]
  synonyms: unknown[]
  dictionaries: { entries: { senses: unknown[] }[] }[]
  sources: { slug: string }[]
}

const publicDir = process.env.STATIC_OUT ?? join(serverRoot, "..", "public")
const out = join(publicDir, DATA_ROOT)
rmSync(out, { recursive: true, force: true })
mkdirSync(join(out, "e"), { recursive: true })
mkdirSync(join(out, "s"), { recursive: true })

const gz = (value: unknown) => gzipSync(JSON.stringify(value), { level: 9 })
const hasContent = (e: Entry) => e.senses.length > 0 || e.synonyms.length > 0 || e.dictionaries.some((d) => d.entries.some((x) => x.senses.length > 0))

// One lookup per spelling family: the database already groups "acao" and "ação".
const rows = await query("SELECT lemma FROM lemmas ORDER BY id")
const keys = new Map<string, string>()
for (const r of rows) {
  const lemma = String(r.lemma)
  const key = normKey(lemma)
  if (key && !keys.has(key)) keys.set(key, lemma)
}
console.log(`${rows.length} headwords, ${keys.size} spellings`)

const shards = new Map<string, Buffer[]>()
const queue = [...keys]
let done = 0
let kept = 0
async function worker() {
  for (let next = queue.pop(); next; next = queue.pop()) {
    const [key, lemma] = next
    const body = (await loadEntry(lemma)) as { entries: Entry[] } | null
    const entries = (body?.entries ?? []).filter(hasContent).map((e) => ({
      ...e,
      // Only OpenWordnet's licence is read from here; the prose dictionaries carry their own.
      sources: e.sources.filter((s) => s.slug === "openwordnet-pt"),
    }))
    if (entries.length) {
      kept++
      const file = entryFile(key)
      if (!shards.has(file)) shards.set(file, [])
      // Kept as buffers: outside the JS heap, and joined into one object at the end.
      shards.get(file)!.push(Buffer.from(`${JSON.stringify(key)}:${JSON.stringify(entries)}`))
    }
    if (++done % 50000 === 0) console.log(`${done}/${keys.size}, ${kept} with content`)
  }
}
await Promise.all(Array.from({ length: 8 }, worker))

let entryBytes = 0
for (const [file, parts] of shards) {
  const json = Buffer.concat([Buffer.from("{"), ...parts.flatMap((p, i) => (i ? [Buffer.from(","), p] : [p])), Buffer.from("}")])
  const data = gzipSync(json, { level: 9 })
  entryBytes += data.length
  writeFileSync(join(publicDir, file), data)
}

// Autocomplete, in the order the API suggests: known words first, plain lowercase before names.
const words = await query(
  `SELECT lemma FROM lemmas WHERE suggest_rank > 0
    ORDER BY suggest_score DESC, (lemma = LOWER(lemma)) DESC, CHAR_LENGTH(lemma), lemma`,
)
const lists = new Map<string, string[]>()
const firstLetter = new Map<string, string[]>()
for (const r of words) {
  const lemma = String(r.lemma)
  const key = normKey(lemma)
  if (Array.from(key).length < 2) continue
  const file = suggestFile(key)
  if (!lists.has(file)) lists.set(file, [])
  lists.get(file)!.push(lemma)
  const c = Array.from(key)[0]!
  const top = firstLetter.get(c) ?? []
  if (top.length < 20) firstLetter.set(c, [...top, lemma])
}
let suggestBytes = 0
for (const [file, list] of lists) {
  const data = gz(list)
  suggestBytes += data.length
  writeFileSync(join(publicDir, file), data)
}
const top = gz(Object.fromEntries(firstLetter))
suggestBytes += top.length
writeFileSync(join(publicDir, suggestFile("a")), top)

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)}MB`
console.log(`${kept} words: entries ${mb(entryBytes)} in ${shards.size} files, autocomplete ${mb(suggestBytes)} in ${lists.size + 1} files`)
await pool.end()
