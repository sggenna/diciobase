// What a shared word says about itself, from the same entry the page shows.
import { stressOf, syllabify } from "../../../src/lib/syllables.ts"
import { type PageMeta, SITE_NAME, wordImagePath, wordPath } from "./head.ts"

/** The parts of an API entry a preview needs (see fromApi in src/lib/words.ts). */
export interface CardEntry {
  word: string
  tags: string[]
  senses: { pos: string; gloss: string | null; synonyms: string[] }[]
  dictionaries: {
    name: string
    license: string
    entries: { pos: string | null; senses: { text: string }[] }[]
  }[]
  sources: { slug: string; license: string }[]
}

export interface WordCard {
  word: string
  syllables: string[] | null
  stress?: number
  pos: string | null
  definition: string | null
  /** Who wrote the definition. The dictionaries' licences require the credit wherever the text appears. */
  source: { name: string; license: string } | null
}

const POS_NAME: Record<string, string> = { n: "substantivo", v: "verbo", a: "adjetivo", r: "advérbio" }

const clean = (s: string) => s.replace(/\s+/g, " ").trim()

/**
 * The definition a preview leads with. The page's head names the word's main
 * class, preferring nouns and the fullest entry, so the preview takes its
 * definition from there: "ação" has a one-line interjection entry first, and
 * it must not speak for the word. Dictionaries are tried in the page's own
 * order, modern first, so 1913 spellings only appear when nothing else has it.
 */
export function cardFromEntry(e: CardEntry): WordCard {
  const syllables = syllabify(e.word)
  const stress = syllables ? stressOf(syllables)?.index : undefined
  const base = { word: e.word, syllables, stress }

  const usable = e.dictionaries.flatMap((d) => d.entries.filter((x) => x.senses.length).map((x) => ({ d, x })))
  const main = usable
    .filter(({ x }) => x.pos && !x.pos.startsWith("forma"))
    .sort((a, b) => Number(b.x.pos!.startsWith("substantivo")) - Number(a.x.pos!.startsWith("substantivo")) || b.x.senses.length - a.x.senses.length)[0]
  const pick = main ? usable.find(({ x }) => x.pos === main.x.pos) : usable[0]
  if (pick) {
    return {
      ...base,
      pos: pick.x.pos,
      definition: clean(pick.x.senses[0]!.text),
      source: { name: pick.d.name, license: pick.d.license },
    }
  }

  const sense = e.senses.find((s) => s.gloss || s.synonyms.length)
  const wn = e.sources.find((s) => s.slug === "openwordnet-pt")
  if (sense) {
    return {
      ...base,
      pos: POS_NAME[sense.pos] ?? null,
      definition: clean(sense.gloss ?? `Sinônimos: ${sense.synonyms.slice(0, 6).join(", ")}.`),
      source: { name: "OpenWordnet-PT", license: wn?.license ?? "CC BY 4.0" },
    }
  }
  return { ...base, pos: e.tags[0] ?? null, definition: null, source: null }
}

const MAX_DESCRIPTION = 200

function shorten(s: string, max: number) {
  if (s.length <= max) return s
  const cut = s.slice(0, max - 1)
  const space = cut.lastIndexOf(" ")
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, "")}…`
}

export function metaFromCard(c: WordCard): PageMeta {
  const syllables = c.syllables?.join("·")
  const head = [syllables, c.pos].filter(Boolean).join(", ")
  const credit = c.source ? ` Fonte: ${c.source.name}.` : ""
  const definition = c.definition ?? "Palavra registrada nas listas do português, ainda sem definição nos dados abertos."
  const prefix = head ? `${head}. ` : ""
  const body = shorten(definition, MAX_DESCRIPTION - prefix.length - credit.length - 1)
  const description = `${prefix}${body}${/[.!?…]$/.test(body) ? "" : "."}${credit}`
  return {
    title: `${SITE_NAME} | ${c.word.charAt(0).toLocaleUpperCase("pt-BR")}${c.word.slice(1)}`,
    ogTitle: c.word,
    description,
    path: wordPath(c.word),
    image: wordImagePath(c.word),
    imageAlt: `${c.word}${syllables ? `, ${syllables}` : ""}: ${definition}`,
    labels: [
      ...(syllables ? ([["Sílabas", syllables]] as [string, string][]) : []),
      ...(c.pos ? ([["Classe", c.pos]] as [string, string][]) : []),
    ],
  }
}
