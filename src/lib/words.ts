import { useEffect, useState } from "react"
import { api, ApiError, type ApiDictionary, type ApiEntry } from "@/lib/api"
import { DICT_META } from "@/lib/data"
import { expandLabel } from "@/lib/labels"
import { pluralOf, syllabify } from "@/lib/syllables"
import type { DictEntry, WordData } from "@/lib/types"

export const POS_NAME = { n: "substantivo", v: "verbo", a: "adjetivo", r: "advérbio" } as const
const POS_LABEL = { n: "Substantivo", v: "Verbo", a: "Adjetivo", r: "Advérbio" } as const

const q = (s: string) => `“${s}”`
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const SHORT_NAME: Record<string, string> = { wikcionario: "Wikcionário", "dicionario-aberto": "Dicionário Aberto" }
const MAX_SENSES = 25

/** The line under the source's name: which edition, under which licence. */
const tagFor = (slug: string, license: string) => [DICT_META[slug]?.edition, license].filter(Boolean).join(" · ")

/** One tab per prose dictionary: its entries' senses flattened and numbered, licence in the tag. */
function proseTab(d: ApiDictionary): DictEntry {
  const senses: DictEntry["senses"] = []
  let closingOrigin: string | undefined
  for (const e of d.entries) {
    e.senses.forEach((s, i) => {
      // Figueiredo (1913) closes an entry with the origin in brackets; the dataset hands it over as a last "sense".
      if (d.slug === "dicionario-aberto" && i === e.senses.length - 1 && i > 0 && /^\(.*\)\.?$/.test(s.text.trim())) {
        closingOrigin ??= s.text.trim()
        return
      }
      if (senses.length >= MAX_SENSES) return
      const labels = [...(i === 0 && e.pos ? [{ text: cap(e.pos), classe: true as const }] : []), ...s.labels.map((l) => expandLabel(d.slug, l))]
      senses.push({ num: String(senses.length + 1), text: s.text, labels: labels.length ? labels : undefined, examples: s.examples.map(q) })
    })
  }
  return {
    id: d.slug,
    name: d.name,
    shortName: SHORT_NAME[d.slug] ?? d.name,
    tag: tagFor(d.slug, d.license),
    etymology: d.entries.find((e) => e.etymology)?.etymology ?? closingOrigin,
    senses,
  }
}

/** OpenWordnet-PT: senses grouped by synonym set, mostly without a written definition. */
function wordnetTab(e: ApiEntry): DictEntry {
  const senses = e.senses
    .map((s) => {
      const text = s.gloss ?? (s.synonyms.length ? `Sinônimos: ${s.synonyms.slice(0, 6).join(", ")}.` : null)
      return text ? { text, labels: [{ text: POS_LABEL[s.pos], classe: true as const }], examples: s.examples.map(q) } : null
    })
    .filter((s): s is NonNullable<typeof s> => !!s)
    .slice(0, 12)
    .map((s, i) => ({ num: String(i + 1), ...s }))

  const related = [...new Set(e.senses.flatMap((s) => s.broader))].slice(0, 12)
  const wn = e.sources.find((s) => s.slug === "openwordnet-pt")
  return {
    id: "wordnet",
    name: "OpenWordnet-PT",
    shortName: "OpenWordnet",
    tag: tagFor("wordnet", wn?.license ?? "CC BY 4.0"),
    senses,
    notes: senses.length
      ? undefined
      : ["Esta palavra consta nas listas de palavras do português, mas ainda não tem definição nos dados abertos."],
    synonyms: e.synonyms.slice(0, 20),
    related: related.length ? related : undefined,
  }
}

const ALL_TABS = [
  { id: "wikcionario", name: "Wikcionário", shortName: SHORT_NAME.wikcionario! },
  { id: "dicionario-aberto", name: "Dicionário Aberto", shortName: SHORT_NAME["dicionario-aberto"]! },
  { id: "wordnet", name: "OpenWordnet-PT", shortName: "OpenWordnet" },
]

/** Every open-data tab we have for a word, best first. */
function openTabs(e: ApiEntry): DictEntry[] {
  const tabs = e.dictionaries.filter((d) => d.entries.some((x) => x.senses.length)).map(proseTab)
  if (e.senses.length || e.synonyms.length || !tabs.length) tabs.push(wordnetTab(e))
  // Every dictionary keeps its tab: when one doesn't have the word, saying so is part of the answer.
  const absent = ALL_TABS.filter((d) => !tabs.some((t) => t.id === d.id)).map((d) => ({ ...d, tag: "", senses: [], missing: true }))
  return [...tabs, ...absent]
}

/**
 * "Sobre a palavra": the same slots for every word, in the same order, each
 * with where it came from. Computed values say so; a slot with nothing
 * behind it is left out rather than filled with a guess.
 */
function factsFor(e: ApiEntry, pos: string): WordData["facts"] {
  const facts: WordData["facts"] = []
  // Syllables, stress and pronunciation are in the head already; this panel holds only what the head doesn't say.
  const syl = syllabify(e.word)
  if (/^(substantivo|adjetivo)/.test(pos)) {
    const plural = pluralOf(e.word, syl)
    if (plural) facts.push({ label: "Plural", value: plural, source: "calculado" })
  }
  if (e.antonyms.length) facts.push({ label: "Antônimos", value: e.antonyms.slice(0, 5).join(", "), source: e.antonymSources.join(", ") || undefined })
  return facts
}

/** The first recorded pronunciation, Brazilian when there is one, with the dictionary it came from. */
function pronunciation(e: ApiEntry) {
  const all = e.dictionaries.flatMap((d) => d.entries.flatMap((x) => x.pronunciations.map((p) => ({ ...p, source: d.name }))))
  return all.find((p) => p.region === "Brasil") ?? all[0] ?? null
}

/**
 * A sense's class chip repeats the head when it names the head's class
 * ("Substantivo feminino" under a "substantivo feminino" head); only a
 * different class ("Forma verbal") is news, so only that one stays.
 */
function withoutHeadClass(d: DictEntry, partOfSpeech: string): DictEntry {
  const head = partOfSpeech.toLowerCase()
  return {
    ...d,
    senses: d.senses.map((s) => {
      const labels = s.labels?.filter((l) => !(l.classe && head.startsWith(l.text.toLowerCase())))
      return { ...s, labels: labels?.length ? labels : undefined }
    }),
  }
}

function fromApi(e: ApiEntry): WordData {
  // The headline part of speech comes from the fullest entry, preferring nouns:
  // "ação" also has a one-line interjection entry that must not name the word.
  const prose = e.dictionaries
    .flatMap((d) => d.entries)
    .filter((x) => x.pos && x.senses.length && !x.pos.startsWith("forma"))
    .sort((a, b) => Number(b.pos!.startsWith("substantivo")) - Number(a.pos!.startsWith("substantivo")) || b.senses.length - a.senses.length)[0]
  const first = e.senses[0]
  const partOfSpeech = prose?.pos ?? (first ? POS_NAME[first.pos] : e.tags[0] ?? "palavra")
  const pron = pronunciation(e)
  return {
    word: e.word,
    partOfSpeech,
    phonetic: pron?.ipa ?? "",
    phoneticSource: pron ? [pron.source, pron.region].filter(Boolean).join(", ") : undefined,
    dicts: openTabs(e).map((d) => withoutHeadClass(d, partOfSpeech)),
    synonyms: e.synonyms.slice(0, 14),
    facts: factsFor(e, partOfSpeech),
  }
}

export type Lookup =
  | { status: "loading"; data: WordData | null }
  | { status: "ready"; data: WordData }
  | { status: "missing"; data: null }
  | { status: "error"; data: null }

const cache = new Map<string, WordData | null>()

async function resolve(key: string, signal: AbortSignal): Promise<WordData | null> {
  try {
    const entry = (await api.words.lookup(key, signal)).entries[0]
    return entry ? fromApi(entry) : null
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

const inflight = new Set<string>()

/**
 * Starts loading a word before it is opened (for example while its suggestion
 * is hovered), so the page is usually ready the moment it is clicked.
 */
export function prefetchWord(key: string) {
  const k = key.normalize("NFC").toLowerCase()
  if (cache.has(k) || inflight.has(k)) return
  inflight.add(k)
  resolve(k, new AbortController().signal)
    .then((data) => cache.set(k, data))
    .catch(() => undefined)
    .finally(() => inflight.delete(k))
}

/** A word's data for a preview: from the cache if it's been read, otherwise looked up and kept. Null if it can't be had. */
export async function peekWord(key: string): Promise<WordData | null> {
  const k = key.normalize("NFC").toLowerCase()
  const cached = cache.get(k)
  if (cached !== undefined) return cached
  try {
    const data = await resolve(k, new AbortController().signal)
    cache.set(k, data)
    return data
  } catch {
    return null
  }
}

/** Looks a word up in the API; every word comes from the open dictionaries. Bump `attempt` to try a failed lookup again. */
export function useWordData(key: string | null, attempt = 0): Lookup {
  const [state, setState] = useState<Lookup>({ status: "loading", data: null })

  useEffect(() => {
    if (!key) return
    const k = key.normalize("NFC").toLowerCase()
    const cached = cache.get(k)
    if (cached !== undefined) {
      setState(cached ? { status: "ready", data: cached } : { status: "missing", data: null })
      return
    }
    setState({ status: "loading", data: null })

    const ctl = new AbortController()
    resolve(k, ctl.signal).then(
      (data) => {
        cache.set(k, data)
        setState(data ? { status: "ready", data } : { status: "missing", data: null })
      },
      (e) => {
        if ((e as Error).name !== "AbortError") setState({ status: "error", data: null })
      },
    )
    return () => ctl.abort()
  }, [key, attempt])

  return state
}
