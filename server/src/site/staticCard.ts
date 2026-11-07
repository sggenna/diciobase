// A word's card from the published dictionary files, for the preview functions on the static site.
import { gunzipSync } from "node:zlib"
import { entryFile, normKey } from "../../../src/lib/staticKeys.ts"
import { cardFromEntry, type CardEntry, type WordCard } from "./wordCard.ts"

/** Where the site is public. Deployment previews sit behind a login, so their functions can only read production's files. */
export const siteOrigin = () =>
  process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")

export async function staticCard(word: string): Promise<WordCard | null> {
  const key = normKey(word)
  if (!key) return null
  const res = await fetch(siteOrigin() + entryFile(key), { signal: AbortSignal.timeout(4000) })
  if (!res.ok) return null
  const shard = JSON.parse(gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8")) as Record<string, CardEntry[]>
  const found = shard[key]
  if (!found?.length) return null
  const exact = word.normalize("NFC")
  return cardFromEntry(found.find((e) => e.word === exact) ?? found[0]!)
}
