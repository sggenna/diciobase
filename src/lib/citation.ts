// A ready-to-paste ABNT reference for one dictionary's entry, naming the source and the day it was read.
const MONTHS = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."]
const accessed = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
const enc = encodeURIComponent

const SOURCES: Record<string, (word: string, year: number) => string> = {
  wikcionario: (w, year) => `In: WIKCIONÁRIO: o dicionário livre. [S. l.]: Wikimedia Foundation, [${year}]. Disponível em: https://pt.wiktionary.org/wiki/${enc(w)}.`,
  "dicionario-aberto": (w) => `In: FIGUEIREDO, Cândido de. Novo Diccionário da Língua Portuguesa. 1913. Disponível em: https://dicionario-aberto.net/search/${enc(w)}.`,
  wordnet: () => "In: OPENWORDNET-PT: rede semântica do português. Disponível em: https://github.com/own-pt/openWordnet-PT.",
}

export function citationFor(word: string, dictId: string, today = new Date()): string | null {
  const source = SOURCES[dictId]
  if (!source) return null
  return `${word.toLocaleUpperCase("pt-BR")}. ${source(word, today.getFullYear())} Acesso em: ${accessed(today)}. Consultado via Diciobase.`
}
