import type { Label } from "@/lib/labels"

export interface Sense {
  num: string
  text: string
  labels?: Label[]
  subsenses?: { num: string; text: string }[]
  examples?: string[]
}

export interface DictEntry {
  id: string
  name: string
  shortName: string
  tag: string
  etymology?: string
  senses: Sense[]
  notes?: string[]
  synonyms?: string[]
  related?: string[]
  /** This dictionary doesn't have the word. Its tab stays, because a source not having something is information too. */
  missing?: boolean
}

export interface WordData {
  word: string
  partOfSpeech: string
  phonetic: string
  /** Where `phonetic` was recorded: the dictionary, and the region when it gives one. */
  phoneticSource?: string
  gender?: string
  dicts: DictEntry[]
  synonyms: string[]
  /** Each fact names where it came from: a source's name, or "calculado" for a value derived from the spelling. */
  facts: { label: string; value: string; source?: string }[]
}

export type MobileTab = "pesquisar" | "salvos" | "perfil"

export type ProfilePanel = "main" | "edit-avatar" | "edit-name" | "change-password" | "notifications" | "terms" | "dicts" | "delete-account"

// Dark profile palette tokens
