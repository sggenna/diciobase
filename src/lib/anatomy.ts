import { stressOf, syllabify, type StressKind } from "@/lib/syllables"
import type { WordData } from "@/lib/types"

export interface ResolvedAnatomy {
  syllables: string[]
  stress?: number
  stressKind?: StressKind
  /** No dictionary gives syllables, so they are derived from the spelling and shown as such. */
  computed: true
}

/**
 * The syllable line under the headword, the same for every word: syllables
 * and stress from Portuguese spelling rules. A word the rules can't split
 * (a loanword, a compound) gets no line rather than a wrong one.
 */
export function resolveAnatomy(w: WordData): ResolvedAnatomy | null {
  const syllables = syllabify(w.word)
  if (!syllables) return null
  const stress = stressOf(syllables)
  return { syllables, stress: stress?.index, stressKind: stress?.kind, computed: true }
}

export const STRESS_EXPLAIN: Record<string, string> = {
  oxítona: "Tônica na última sílaba.",
  paroxítona: "Tônica na penúltima sílaba.",
  proparoxítona: "Tônica na antepenúltima sílaba.",
  monossílaba: "Palavra de uma só sílaba.",
}
