// Portuguese syllables, stress and plural, derived from spelling rules. None
// of the open dictionaries carry them, so they are computed here and always
// shown as "calculado". Each function returns null rather than guess where
// the rules are ambiguous: an empty slot is better than a wrong one.

const VOWELS = "aeiouáéíóúâêôãõàü"
const ACUTE_CIRC = "áéíóúâêô"
const NASAL = "ãõ"
const isVowel = (c: string | undefined) => !!c && VOWELS.includes(c)

/** Onsets that never split: "pr", "bl", "ch", "lh", "nh"… (pe-dra, a-blu-ção, fi-lho). */
const CLUSTERS = new Set([
  "pr", "br", "tr", "dr", "cr", "gr", "fr", "vr",
  "pl", "bl", "cl", "gl", "fl",
  "ch", "lh", "nh",
])

/**
 * Two vowels that make one syllable: a vowel followed by an unstressed i/u,
 * and the nasal pairs. The i/u stands alone when "nh" follows (ra-i-nha) or
 * when r, l, z, m or n closes its syllable (a-in-da, ju-iz, ru-im, pa-ul).
 */
function isDiphthong(a: string, b: string, n1: string | undefined, n2: string | undefined): boolean {
  if (a + b === "ão" || a + b === "õe" || a + b === "ãe") return true
  if (b !== "i" && b !== "u") return false
  if (!isVowel(a) || a === b) return false
  if (n1 === "n" && n2 === "h") return false
  if (n1 && "rlzmn".includes(n1) && !isVowel(n2)) return false
  return true
}

/**
 * Splits a word into syllables, e.g. "terreno" → ["ter", "re", "no"].
 * Hyphenated compounds and anything outside Portuguese spelling return null.
 */
export function syllabify(word: string): string[] | null {
  const w = word.normalize("NFC").toLowerCase()
  if (!/^[a-zçáéíóúâêôãõàü]+$/.test(w)) return null
  // Loanwords (k, w, y) and endings Portuguese spelling never has (-ok, -tic) follow other rules.
  if (/[kwy]/.test(w) || !/(?:[aeiouáéíóúâêôãõàü]|[aeiouáéíóúâêôãõàü](?:[rlszmnx]|ns|rs))$/.test(w)) return null
  const ch = Array.from(w)

  // The vowel nuclei, each as [start, end). "qu"/"gu" before e/i (and before a/o with ü) keep their u in the onset.
  const nuclei: [number, number][] = []
  let i = 0
  while (i < ch.length) {
    const c = ch[i]!
    const prev = ch[i - 1]
    if (c === "u" && (prev === "q" || prev === "g") && isVowel(ch[i + 1])) {
      i++
      continue
    }
    if (c === "ü") {
      i++
      continue
    }
    if (!isVowel(c)) {
      i++
      continue
    }
    let end = i + 1
    if (isVowel(ch[end]) && isDiphthong(c, ch[end]!, ch[end + 1], ch[end + 2])) end++
    nuclei.push([i, end])
    i = end
  }
  if (!nuclei.length) return null

  // Consonants between two nuclei: one goes right; a cluster goes right whole; otherwise only the last goes right.
  const cuts: number[] = []
  for (let n = 1; n < nuclei.length; n++) {
    const from = nuclei[n - 1]![1]
    const to = nuclei[n]![0]
    const between = ch.slice(from, to).join("")
    // The u of a "qu"/"gu" onset belongs with its consonant (quei-jo, á-gua).
    const onsetU = (ch[to - 1] === "u" || ch[to - 1] === "ü") && (ch[to - 2] === "q" || ch[to - 2] === "g")
    const cons = onsetU ? between.slice(0, -1) : between
    let right: number
    if (cons.length === 0) right = 0
    else if (cons.length === 1) right = 1
    else if (CLUSTERS.has(cons.slice(-2))) right = 2
    else right = 1
    cuts.push(to - right - (onsetU ? 1 : 0))
  }

  const out: string[] = []
  let start = 0
  for (const cut of cuts) {
    out.push(ch.slice(start, cut).join(""))
    start = cut
  }
  out.push(ch.slice(start).join(""))
  return out.every((s) => Array.from(s).some(isVowel)) ? out : null
}

export type StressKind = "oxítona" | "paroxítona" | "proparoxítona" | "monossílaba"

/** The stressed syllable, from the accent if there is one, else from the word's ending. */
export function stressOf(syllables: string[]): { index: number; kind: StressKind } | null {
  const n = syllables.length
  if (!n) return null
  const kind = (index: number): StressKind =>
    n === 1 ? "monossílaba" : index === n - 1 ? "oxítona" : index === n - 2 ? "paroxítona" : "proparoxítona"

  const marked = syllables.findIndex((s) => Array.from(s).some((c) => ACUTE_CIRC.includes(c)))
  if (marked >= 0) {
    // his-tó-ri-a splits its last vowels, but for stress "-ria" counts as one syllable: a paroxítona, not a proparoxítona.
    const glide = n - marked === 3 && /[iu]$/.test(syllables[n - 2]!) && /^[aeo]s?$/.test(syllables[n - 1]!)
    return { index: marked, kind: glide ? "paroxítona" : kind(marked) }
  }
  const nasal = syllables.findIndex((s) => Array.from(s).some((c) => NASAL.includes(c)))
  if (nasal >= 0) return { index: nasal, kind: kind(nasal) }
  if (n === 1) return { index: 0, kind: "monossílaba" }

  const last = syllables[n - 1]!
  // Unaccented words ending in a, e, o (plus s), am, em, ens are paroxytones; the rest are oxytones.
  const paroxytone = /(?:[aeo]s?|am|em|ens)$/.test(last) && !/(?:[^aeiou]|^)[iu]s?$/.test(last)
  const index = paroxytone ? n - 2 : n - 1
  return { index, kind: kind(index) }
}

/**
 * The regular plural of a noun or adjective. Endings with more than one
 * plural (-ão → ões, ães or ãos), invariable -s/-x words and anything
 * irregular return null.
 */
export function pluralOf(word: string, syllables: string[] | null): string | null {
  const w = word.normalize("NFC").toLowerCase()
  if (!/^[a-zçáéíóúâêôãõàü]+$/.test(w)) return null
  const stress = syllables ? stressOf(syllables) : null
  if (/ão$/.test(w)) return null
  if (/[aeiouáéíóúâêôãõ]$/.test(w) || /ãe$|õe$/.test(w)) return w + "s"
  if (/m$/.test(w)) return w.slice(0, -1) + "ns"
  if (/[rz]$/.test(w)) return w + "es"
  if (/n$/.test(w)) return w + "s"
  if (/s$/.test(w)) {
    // Stressed final syllable: país → países, mês → meses (accent drops). Otherwise invariable (o lápis, os lápis).
    if (stress?.kind === "oxítona" || stress?.kind === "monossílaba") {
      if (/ês$/.test(w)) return w.slice(0, -2) + "eses"
      if (/[áíóú]s$/.test(w) && syllables && syllables.length > 1) return w + "es"
      return null
    }
    return w
  }
  if (/x$/.test(w)) return w
  if (/l$/.test(w)) {
    if (!stress) return null
    const oxy = stress.kind === "oxítona" || stress.kind === "monossílaba"
    if (/il$/.test(w)) return oxy ? w.slice(0, -1) + "s" : null // funil → funis; fóssil → fósseis is irregular enough to skip
    if (!oxy) return null
    if (/el$/.test(w)) return w.slice(0, -2) + "éis"
    if (/ol$/.test(w)) return w.slice(0, -2) + "óis"
    if (/al$/.test(w)) return w.slice(0, -1) + "is"
    if (/ul$/.test(w)) return w.slice(0, -1) + "is"
    return null
  }
  return null
}
