// How the published dictionary files are addressed, shared by the exporter, the site and the preview function.

/** Accent- and case-insensitive, like the database's own lookup: "Ação" and "acao" find the same entry. */
export const normKey = (word: string) =>
  word.trim().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC").toLowerCase()

export const DATA_ROOT = "/data/v1"
const SHARDS = 1024

function fnv1a(s: string) {
  let h = 0x811c9dc5
  for (const c of s) {
    h ^= c.codePointAt(0)!
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** The file holding a word's entries. Spread evenly, so each is a small download. */
export const entryFile = (key: string) => `${DATA_ROOT}/e/${(fnv1a(key) % SHARDS).toString(16)}.json.gz`

/** The autocomplete file for a search: by its first two letters, or the single-letter list for one. */
export function suggestFile(key: string) {
  const prefix = Array.from(key).slice(0, 2)
  const id = prefix.length < 2 ? "top" : prefix.map((c) => c.codePointAt(0)!.toString(16)).join("-")
  return `${DATA_ROOT}/s/${id}.json.gz`
}
