// Pure parsers for the downloaded datasets. They only read text and return
// plain data: nothing in the files is ever executed or interpreted as code.

export const stats = { skipped: 0 }

/** Lemma cleanup shared by all sources. Returns null for anything unusable. */
export function cleanLemma(raw: string, opts: { strict?: boolean } = {}): string | null {
  let s = raw.normalize("NFC").replace(/_/g, " ").replace(/\s+/g, " ").trim()
  if (!s || s.length > 100) return null
  if (/[\p{Cc}\p{Cf}\u2028\u2029]/u.test(s)) return null
  if (!/\p{L}/u.test(s)) return null
  // Wordlists and thesauri: plain words only (letters, marks, hyphen, apostrophe, space).
  if (opts.strict && !/^\p{L}[\p{L}\p{M}'’ -]*$/u.test(s)) return null
  return s
}

/* ----------------------------- OpenWordnet-PT ----------------------------- */

const STRING_RE = /"((?:[^"\\]|\\.)*)"/g

function unescapeTurtle(s: string): string {
  return s.replace(/\\(u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|[tbnrf"'\\])/g, (_, e: string) => {
    if (e[0] === "u" || e[0] === "U") return String.fromCodePoint(parseInt(e.slice(1), 16))
    return { t: "\t", b: "\b", n: "\n", r: "\r", f: "\f", '"': '"', "'": "'", "\\": "\\" }[e] ?? e
  })
}

function strings(text: string | undefined): string[] {
  if (!text) return []
  return [...text.matchAll(STRING_RE)].map((m) => unescapeTurtle(m[1]!).trim()).filter(Boolean)
}

/** Splits one Turtle block (as printed by rdflib) into predicate -> raw object text. */
function predicates(block: string): Map<string, string> {
  const out = new Map<string, string>()
  let current: string | null = null
  for (const line of block.split("\n").slice(1)) {
    const m = /^ {4}([A-Za-z-]+:[A-Za-z]+)\s+(.*)$/.exec(line)
    if (m) {
      current = m[1]!
      out.set(current, (out.get(current) ?? "") + " " + m[2]!)
    } else if (current && /^\s{8}/.test(line)) {
      out.set(current, out.get(current)! + " " + line.trim())
    }
  }
  return out
}

export interface Synset {
  wnId: string
  /** Satellite adjectives ("-s" ids) are stored as adjectives. */
  pos: "n" | "v" | "a" | "r"
  gloss: string | null
  examples: string[]
}

export function parseSynsets(text: string): Synset[] {
  const out: Synset[] = []
  for (const block of text.split(/\n\n+/)) {
    if (!block.startsWith("own-pt:synset-")) continue
    const preds = predicates(block)
    const id = strings(preds.get("owns:synsetId"))[0]
    if (!id || !/^\d{8}-[nvars]$/.test(id)) {
      stats.skipped++
      continue
    }
    out.push({
      wnId: id,
      pos: (id.endsWith("-s") ? "a" : id.slice(-1)) as Synset["pos"],
      gloss: strings(preds.get("owns:gloss"))[0] ?? null,
      examples: strings(preds.get("owns:example")),
    })
  }
  return out
}

export interface WordSense {
  wnId: string
  no: number
  lemma: string
}

export function parseWordSenses(text: string): WordSense[] {
  const out: WordSense[] = []
  for (const block of text.split(/\n\n+/)) {
    const head = /^own-pt:wordsense-(\d{8}-[nvars])-(\d+) a owns:WordSense/.exec(block)
    if (!head) continue
    const label = strings(predicates(block).get("rdfs:label"))[0]
    const lemma = label ? cleanLemma(label) : null
    if (!lemma) {
      stats.skipped++
      continue
    }
    out.push({ wnId: head[1]!, no: Number(head[2]), lemma })
  }
  return out
}

export interface Triple {
  subject: string // "synset:00001740-n" | "wordsense:00001740-n-1"
  predicate: string
  object: string
}

export function parseRelations(text: string): Triple[] {
  const out: Triple[] = []
  const node = /^own-pt:(synset|wordsense)-([0-9]{8}-[nvars](?:-\d+)?)$/
  for (const stmt of text.split(/\s\.\s*\n/)) {
    const tokens = stmt.match(/[^\s,;]+|[,;]/g)
    if (!tokens || tokens.length < 3) continue
    const s = node.exec(tokens[0]!)
    if (!s) continue
    let pred: string | null = null
    for (let i = 1; i < tokens.length; i++) {
      const t = tokens[i]!
      if (t === ";" || t === ",") continue
      const prev = tokens[i - 1]!
      if (i === 1 || prev === ";") {
        pred = t.replace(/^owns:/, "")
        continue
      }
      const o = node.exec(t)
      if (pred && o) out.push({ subject: `${s[1]}:${s[2]}`, predicate: pred, object: `${o[1]}:${o[2]}` })
    }
  }
  return out
}

/* --------------------------------- DicSin --------------------------------- */

export interface ThesaurusEntry {
  head: string
  relation: "synonym" | "antonym"
  related: string[]
}

/**
 * MyThes format: "<headword>|<n>" followed by n lines "(Label)w1|w2|...". In this
 * dataset some headwords have a corrupted first character (e.g. "&rente");
 * those are repaired when the clean form also appears in the list, otherwise
 * dropped, and the count is reported.
 */
export function parseDicSin(text: string) {
  const entries: ThesaurusEntry[] = []
  let dropped = 0
  let repaired = 0
  const lines = text.split(/\r?\n/)
  let i = lines[0] === "UTF-8" ? 1 : 0
  while (i < lines.length) {
    const line = lines[i++]!
    if (!line || line.startsWith("(")) continue
    const sep = line.lastIndexOf("|")
    if (sep < 1) continue
    const rawHead = line.slice(0, sep)
    const groups: { relation: "synonym" | "antonym"; tokens: string[] }[] = []
    while (i < lines.length && lines[i]!.startsWith("(")) {
      const m = /^\(([^)]*)\)(.*)$/.exec(lines[i++]!)
      if (!m) continue
      groups.push({
        relation: /^ant/i.test(m[1]!) ? "antonym" : "synonym",
        tokens: m[2]!.split("|"),
      })
    }
    let head = cleanLemma(rawHead, { strict: true })
    if (!head) {
      const stripped = cleanLemma(rawHead.replace(/^[^\p{L}]+/u, ""), { strict: true })
      const inList = stripped && groups.some((g) => g.tokens.some((t) => cleanLemma(t, { strict: true }) === stripped))
      if (stripped && inList) {
        head = stripped
        repaired++
      } else {
        dropped++
        continue
      }
    }
    for (const g of groups) {
      const related = [...new Set(g.tokens.map((t) => cleanLemma(t, { strict: true })).filter((t): t is string => !!t && t !== head))]
      if (related.length) entries.push({ head, relation: g.relation, related })
    }
  }
  return { entries, dropped, repaired }
}

/* ------------------------------ word lists --------------------------------- */

/** Hunspell .dic (VERO): "<word>/<flags>"; the first line is a count. Flags are ignored. */
export function parseHunspellDic(text: string): string[] {
  const out = new Set<string>()
  const lines = text.split(/\r?\n/)
  for (let i = /^\d+$/.test(lines[0] ?? "") ? 1 : 0; i < lines.length; i++) {
    const word = cleanLemma(lines[i]!.split("/")[0]!, { strict: true })
    if (word) out.add(word)
    else if (lines[i]) stats.skipped++
  }
  return [...out]
}

/** br.ispell source: "<word>[:flags] [# s.m.]". Comment-only lines are headings. */
export function parseIspell(text: string): { word: string; tag: string | null }[] {
  const out = new Map<string, string | null>()
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const [left = "", ...rest] = line.split("#")
    const word = cleanLemma(left.split(/[:/]/)[0]!, { strict: true })
    if (!word) {
      stats.skipped++
      continue
    }
    const tag = rest.join("#").trim().slice(0, 40) || null
    if (!out.has(word) || (!out.get(word) && tag)) out.set(word, tag)
  }
  return [...out].map(([word, tag]) => ({ word, tag }))
}

export function parseStopwords(text: string): string[] {
  return [...new Set(text.split(/\r?\n/).map((w) => w.normalize("NFC").trim()).filter((w) => w && w.length <= 60))]
}

/* ------------------------- prose dictionaries (shared) ---------------------- */

export interface DictSense {
  text: string
  labels: string[]
  examples: string[]
}

export interface DictEntryData {
  lemma: string
  pos: string | null
  etymology: string | null
  pronunciations: { ipa: string; region: string | null }[]
  senses: DictSense[]
  synonyms: string[]
  antonyms: string[]
}

const MAX_SENSES = 30
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s)
const uniq = <T>(a: T[]) => [...new Set(a)]

/* ------------------------------- Wikcionário -------------------------------- */

// Tags in the extract are English codes; show Portuguese labels, and ignore grammar bookkeeping.
const WIKT_LABELS: Record<string, string> = {
  Brazil: "Brasil", Brazilian: "Brasil", Portugal: "Portugal", Lusitanian: "Portugal",
  figuratively: "Figurado", popular: "Popular", informal: "Informal", archaic: "Arcaico",
  pejorative: "Pejorativo", colloquial: "Coloquial", vulgar: "Vulgar", obsolete: "Obsoleto",
  familiar: "Familiar", slang: "Gíria", rare: "Raro", dated: "Antiquado", regional: "Regional",
  "Northeast-Brazil": "Nordeste", "Southern-Brazil": "Sul do Brasil", Angola: "Angola",
  Galicia: "Galiza", demonym: "Gentílico", transitive: "Transitivo", intransitive: "Intransitivo",
  reflexive: "Reflexivo", "Rio Grande do Sul": "Rio Grande do Sul", "Minas Gerais": "Minas Gerais",
}
const WIKT_GENDER: Record<string, string> = { masculine: "masculino", feminine: "feminino", plural: "plural" }

const cleanEtymology = (t: string[] | undefined) => {
  const text = uniq((t ?? []).map((x) => x.replace(/⁽[^⁾]*⁾/g, "").replace(/^[:\s]+/, "").trim()).filter(Boolean)).join(" ")
  return text ? clip(text.normalize("NFC"), 1000) : null
}

export function parseWiktionaryLine(line: string): DictEntryData | null {
  let d: Record<string, any>
  try {
    d = JSON.parse(line)
  } catch {
    stats.skipped++
    return null
  }
  if (d.lang_code !== "pt" || typeof d.word !== "string") return null
  const lemma = cleanLemma(d.word)
  if (!lemma) {
    stats.skipped++
    return null
  }

  const senses: DictSense[] = []
  for (const s of d.senses ?? []) {
    if ((s.tags ?? []).includes("no-gloss")) continue
    const glosses: string[] = (s.glosses ?? []).filter((g: unknown) => typeof g === "string" && g.trim())
    if (!glosses.length) continue
    const labels = uniq<string>([
      ...(s.raw_tags ?? []).filter((t: unknown) => typeof t === "string"),
      ...(s.tags ?? []).map((t: string) => WIKT_LABELS[t]).filter(Boolean),
    ]).map((l) => clip(l, 40)).slice(0, 4)
    const examples = (s.examples ?? [])
      .map((e: { text?: string }) => (typeof e?.text === "string" ? e.text.trim() : ""))
      .filter(Boolean)
      .slice(0, 3)
      .map((e: string) => clip(e, 400))
    senses.push({ text: clip(glosses[glosses.length - 1]!.normalize("NFC"), 1000), labels, examples })
    if (senses.length >= MAX_SENSES) break
  }
  if (!senses.length) return null

  const gender = uniq<string>((d.tags ?? []).map((t: string) => WIKT_GENDER[t]).filter(Boolean))
  const posTitle = typeof d.pos_title === "string" ? d.pos_title.toLowerCase() : null
  const pos = posTitle ? clip(gender.length && /^substantivo|^adjetivo/.test(posTitle) ? `${posTitle} ${gender.join(" e ")}` : posTitle, 80) : null

  const pron = new Map<string, string | null>()
  for (const snd of d.sounds ?? []) {
    const ipa = typeof snd?.ipa === "string" ? snd.ipa.trim() : ""
    const isSampa = /SAMPA/i.test(`${(snd.tags ?? []).join(" ")} ${(snd.raw_tags ?? []).join(" ")}`)
    if (!ipa || isSampa || ipa.length > 80 || pron.has(ipa)) continue
    const tags: string[] = snd.tags ?? []
    pron.set(ipa, tags.includes("Brazil") ? "Brasil" : tags.includes("Portugal") ? "Portugal" : null)
  }

  const rel = (list: unknown) =>
    uniq(((Array.isArray(list) ? list : []) as { word?: string }[]).map((x) => (x?.word ? cleanLemma(x.word) : null)).filter((w): w is string => !!w && w !== lemma))

  return {
    lemma,
    pos,
    etymology: cleanEtymology(d.etymology_texts),
    pronunciations: [...pron].slice(0, 4).map(([ipa, region]) => ({ ipa, region })),
    senses,
    synonyms: rel(d.synonyms),
    antonyms: rel(d.antonyms),
  }
}

/* ----------------------------- Dicionário Aberto ---------------------------- */

const decode = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, (_, e: string) => {
    if (e[0] === "#") return String.fromCodePoint(e[1]?.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e.toLowerCase() as "amp"] ?? ""
  })
const plain = (s: string) => decode(s.replace(/<[^>]*>/g, "")).replace(/_/g, "").replace(/\s+/g, " ").trim()

const DA_POS: Record<string, string> = {
  "m.": "substantivo masculino", "f.": "substantivo feminino", "adj.": "adjetivo", "adv.": "advérbio",
  "v. t.": "verbo transitivo", "v. i.": "verbo intransitivo", "v. p.": "verbo pronominal",
  "m. pl.": "substantivo masculino plural", "f. pl.": "substantivo feminino plural", "pl.": "plural",
  "interj.": "interjeição", "pref.": "prefixo", "loc.": "locução", "loc. adv.": "locução adverbial",
  "m. e adj.": "substantivo masculino e adjetivo", "m. e f.": "substantivo masculino e feminino",
  "adj. f.": "adjetivo feminino", "v. t. e i.": "verbo transitivo e intransitivo", "prep.": "preposição",
  "conj.": "conjunção", "pron.": "pronome", "suf.": "sufixo", "num.": "numeral",
}
const DA_USG: Record<string, string> = {
  "Ant.": "Antigo", "Bras": "Brasil", "Fig.": "Figurado", "Pop.": "Popular", "Des.": "Desusado",
  "Fam.": "Familiar", "Neol.": "Neologismo", "Gír.": "Gíria", "Prov.": "Provincialismo",
  "Bot.": "Botânica", "Zool.": "Zoologia", "Med.": "Medicina", "Chul.": "Chulo", "Pleb.": "Plebeísmo",
}
const daPos = (g: string) => {
  const k = g.replace(/\s+/g, " ").trim().toLowerCase()
  return clip(DA_POS[k] ?? k, 80)
}

export function parseDicionarioAberto(xml: string): DictEntryData[] {
  const out: DictEntryData[] = []
  for (const m of xml.matchAll(/<entry id="([^"]*)"[^>]*>([\s\S]*?)<\/entry>/g)) {
    const lemma = cleanLemma(decode(m[1]!).replace(/:\d+$/, ""))
    if (!lemma) {
      stats.skipped++
      continue
    }
    const body = m[2]!
    let pos: string | null = null
    const senses: DictSense[] = []
    for (const sm of body.matchAll(/<sense\b[^>]*>([\s\S]*?)<\/sense>/g)) {
      const sb = sm[1]!
      const g = /<gramGrp>([\s\S]*?)<\/gramGrp>/.exec(sb)
      if (g && !pos) pos = daPos(plain(g[1]!))
      const labels = [...sb.matchAll(/<usg[^>]*>([\s\S]*?)<\/usg>/g)]
        .map((u) => plain(u[1]!))
        .map((u) => DA_USG[u] ?? u.replace(/\.$/, ""))
        .filter(Boolean)
        .slice(0, 3)
      const def = /<def>([\s\S]*?)<\/def>/.exec(sb)
      if (!def) continue
      // Each line of <def> is a separate meaning; "meaning: _example_." carries its example.
      for (const rawLine of def[1]!.split("\n")) {
        const line = decode(rawLine.replace(/<[^>]*>/g, "")).trim()
        if (!line) continue
        const ex = /^(.*?):\s*_([^_]+)_\.?$/.exec(line)
        const text = plain(ex ? `${ex[1]}.` : line)
        if (!text) continue
        senses.push({ text: clip(text, 1000), labels, examples: ex ? [clip(plain(ex[2]!), 400)] : [] })
        if (senses.length >= MAX_SENSES) break
      }
      if (senses.length >= MAX_SENSES) break
    }
    if (!senses.length) continue
    const et = /<etym[^>]*>([\s\S]*?)<\/etym>/.exec(body)
    out.push({
      lemma,
      pos,
      etymology: et ? clip(plain(et[1]!).normalize("NFC"), 500) || null : null,
      pronunciations: [],
      senses,
      synonyms: [],
      antonyms: [],
    })
  }
  return out
}
