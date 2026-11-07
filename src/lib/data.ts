// Every dictionary shown is open data loaded from the API (server/), with its
// licence; none of it is commercial, licensed content.
export const DICT_COLOR: Record<string, string> = {
  wikcionario: "#6B4F9E",
  "dicionario-aberto": "#2F7F7A",
  wordnet: "#7a6a58",
}

/**
 * Each dictionary's dot colour, deepened a touch so it carries white text
 * (>= 4.5:1) and reads as text on white and on the light-gray surfaces. It
 * drives the active-tab accent: underline, acepção numbers, strip highlight.
 */
export const DICT_ACCENT: Record<string, string> = {
  wikcionario: "#5E4592",
  "dicionario-aberto": "#296C67",
  wordnet: "#7A6A58",
}

/**
 * What a reader needs to judge a source: a letter that marks it wherever its
 * colour does (tabs, "Também em"), so colour is never the only cue, and the
 * edition the text comes from, so old spellings read as faithful, not as bugs.
 */
export const DICT_META: Record<string, { mark: string; edition: string; historic?: boolean }> = {
  wikcionario: { mark: "W", edition: "Versão de 1 out. 2026" },
  "dicionario-aberto": {
    mark: "A",
    edition: "Novo Diccionário da Língua Portuguesa, Cândido de Figueiredo, 1913",
    historic: true,
  },
  wordnet: { mark: "O", edition: "Rede semântica do português" },
}

// "saudade" first: three dictionaries that agree on one sense and part ways on the rest, the case the
// "Também em" marks are for.
export const SUGGESTIONS = ["saudade", "terra", "casa"]

export const PREF_OPTIONS = [
  "Vocabulário cotidiano",
  "Literatura & Poesia",
  "Termos científicos",
  "Filosofia",
  "Linguagem formal",
  "Curiosidades etimológicas",
  "Expressões idiomáticas",
  "Arcaísmos",
]

export const FAV_FILTERS = [
  "Todas",
  "Substantivos",
  "Adjetivos",
  "Verbos",
] as const

export type FavFilter = typeof FAV_FILTERS[number]

export const FAV_SORTS = ["Mais recentes", "A-Z"] as const

export type FavSort = typeof FAV_SORTS[number]
