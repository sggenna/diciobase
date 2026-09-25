export interface Sense {
  num: string
  text: string
  labels?: string[]
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
}

export interface WordData {
  word: string
  partOfSpeech: string
  phonetic: string
  gender?: string
  dicts: DictEntry[]
  synonyms: string[]
  facts: { label: string; value: string }[]
}

export type MobileTab = "pesquisar" | "salvos" | "perfil"

export type ProfilePanel = "main" | "edit-avatar" | "edit-name" | "change-password" | "notifications" | "terms" | "dicts"

// Dark profile palette tokens
