import type { DictEntry } from "@/lib/types"

const STOP = new Set(
  "a o as os um uma uns umas de da do das dos em na no nas nos ao aos que com por para pelo pela como mais menos muito muita qual quais quando onde cujo cuja seu sua seus suas se ou e é são foi ser ter tem tendo diz-se diz".split(" "),
)

/** Content words, accents removed, cut to a 5-letter stem so "construção"/"construções" agree. */
function stems(text: string): Set<string> {
  const out = new Set<string>()
  for (const raw of text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().split(/[^a-z]+/)) {
    if (raw.length < 3 || STOP.has(raw)) continue
    out.add(raw.slice(0, 5))
  }
  return out
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let hit = 0
  for (const x of a) if (b.has(x)) hit++
  // Dictionaries phrase things differently; compare against the shorter definition.
  return hit / Math.min(a.size, b.size)
}

const THRESHOLD = 0.5

/**
 * For every sense, the dictionaries that carry an equivalent sense, judged by
 * how much of the shorter definition's wording the other one shares. This is
 * an inference from text, not curated data: it can miss a match or merge two
 * close senses, which is why the UI words it as "present in", not "identical".
 */
export function buildPresence(dicts: DictEntry[]): Map<string, string[]> {
  const out = new Map<string, string[]>()
  const prepared = dicts.map((d) => ({
    id: d.id,
    senses: d.senses.map((s) => ({
      num: s.num,
      tokens: stems([s.text, ...(s.subsenses ?? []).map((x) => x.text)].join(" ")),
    })),
  }))
  for (const a of prepared) {
    for (const sa of a.senses) {
      const ids = [a.id]
      for (const b of prepared) {
        if (b.id === a.id) continue
        const best = Math.max(0, ...b.senses.map((sb) => overlap(sa.tokens, sb.tokens)))
        if (best >= THRESHOLD) ids.push(b.id)
      }
      out.set(`${a.id}|${sa.num}`, ids)
    }
  }
  return out
}
