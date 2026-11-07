import type { DictEntry } from '@/lib/types'

// The real entry for a word OpenWordnet doesn't have, as src/lib/words.ts reads it, for the Não consta visual.
export const SERTAO_DICTS: DictEntry[] = [
  {"id":"wikcionario","name":"Wikcionário","shortName":"Wikcionário","tag":"","senses":[{"num":"1","text":"zona pouco habitada do interior do Brasil, sobretudo a região semi-árida do norte-ocidental","labels":[{"text":"Brasil"}],"examples":["“Então o sertão virará praia e a praia virará sertão.”"]},{"num":"2","text":"terreno coberto de mato, longe do litoral","examples":[]}]},
  {"id":"dicionario-aberto","name":"Dicionário Aberto","shortName":"Dicionário Aberto","tag":"","senses":[{"num":"1","text":"Lugar inculto, distante de povoações ou de terrenos cultivados.","examples":[]},{"num":"2","text":"Floresta, no interior de um continente, ou longe da costa.","examples":[]}]},
  { id: 'wordnet', name: 'OpenWordnet-PT', shortName: 'OpenWordnet', tag: '', senses: [], missing: true },
]
