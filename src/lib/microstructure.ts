import type { DictEntry } from "@/lib/types"

// The microstructure of a dictionary entry: the parts a lexicographer writes
// for one headword, and the order a given dictionary puts them in.

export type PartKind =
  | "cabeca"
  | "classe"
  | "etimologia"
  | "acepcoes"
  | "exemplos"
  | "rubricas"
  | "remissoes"
  | "notas"

interface PartMeta {
  /** Full name: legend and hover label. */
  label: string
  /** Shown on the strip when the part has no count. */
  chip: string
  /** One-line explanation, used as the part's accessible description. */
  hint: string
}

export const PART_META: Record<PartKind, PartMeta> = {
  cabeca: { label: "Cabeça", chip: "Cabeça", hint: "A palavra-entrada (lema) e sua pronúncia." },
  classe: { label: "Classe gramatical", chip: "Classe", hint: "Se a palavra é substantivo, verbo, adjetivo…" },
  etimologia: { label: "Etimologia", chip: "Etimologia", hint: "A origem da palavra." },
  acepcoes: { label: "Acepções", chip: "Acepções", hint: "Cada sentido da palavra, numerado." },
  exemplos: { label: "Exemplos", chip: "Exemplos", hint: "A palavra em uso, numa frase." },
  rubricas: { label: "Rubricas", chip: "Rubricas", hint: "A marca de uso ou de área: figurado, geologia…" },
  remissoes: { label: "Remissões", chip: "Remissões", hint: "Outras entradas relacionadas, para consultar." },
  notas: { label: "Observações", chip: "Observações", hint: "Notas do dicionário sobre uso ou grafia." },
}

export interface EntryPart {
  kind: PartKind
  count?: number
}

type BodyKind = "etimologia" | "acepcoes" | "remissoes" | "notas"

// Where each dictionary puts the blocks that come after the head. This is an
// editorial claim about the dictionaries, so it lives here, in one place, to
// be checked against the printed sources.
// Wikcionário puts its Etimologia section after the senses; Figueiredo closes
// each entry with the origin in brackets, "(Lat. terra)"; OpenWordnet-PT has none.
const BODY_ORDER: Record<string, BodyKind[]> = {
  wikcionario: ["acepcoes", "etimologia", "remissoes", "notas"],
  "dicionario-aberto": ["acepcoes", "etimologia", "remissoes", "notas"],
  wordnet: ["acepcoes", "remissoes", "notas"],
}
const DEFAULT_BODY: BodyKind[] = ["etimologia", "acepcoes", "notas", "remissoes"]

export const bodyOrder = (entry: DictEntry): BodyKind[] => BODY_ORDER[entry.id] ?? DEFAULT_BODY

/** What this entry actually contains, counted. Missing parts are absent. */
export function entryCounts(entry: DictEntry) {
  let exemplos = 0
  let rubricas = 0
  for (const s of entry.senses) {
    exemplos += s.examples?.length ?? 0
    rubricas += s.labels?.length ?? 0
  }
  return {
    acepcoes: entry.senses.length,
    exemplos,
    rubricas,
    remissoes: (entry.related?.length ?? 0) + (entry.synonyms?.length ?? 0),
    notas: entry.notes?.length ?? 0,
    etimologia: entry.etymology ? 1 : 0,
  }
}

/**
 * The strip: the entry's parts in the order a reader meets them on the page.
 * The head comes first (headword, then class). The body follows the dictionary's
 * own block order, and inside the acepções the order is the order of first
 * appearance when reading sense by sense: the number, then its rubrica, then
 * its exemplo. The page renders in exactly this order.
 */
export function entryParts(entry: DictEntry): EntryPart[] {
  const n = entryCounts(entry)
  const parts: EntryPart[] = [{ kind: "cabeca" }, { kind: "classe" }]
  for (const kind of bodyOrder(entry)) {
    if (kind === "etimologia") {
      if (n.etimologia) parts.push({ kind })
    } else if (kind === "acepcoes") {
      if (!n.acepcoes) continue
      parts.push({ kind, count: n.acepcoes })
      const seen = new Set<PartKind>(["acepcoes"])
      for (const s of entry.senses) {
        if (s.labels?.length && !seen.has("rubricas")) {
          seen.add("rubricas")
          parts.push({ kind: "rubricas", count: n.rubricas })
        }
        if (s.examples?.length && !seen.has("exemplos")) {
          seen.add("exemplos")
          parts.push({ kind: "exemplos", count: n.exemplos })
        }
      }
    } else if (n[kind] > 0) {
      parts.push({ kind, count: n[kind] })
    }
  }
  return parts
}
