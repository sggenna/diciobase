// Real recordings of a word, from Wikimedia Commons: no key, and the same open
// data family as the dictionaries. The datasets carry IPA but no audio, so this
// is a live lookup. It only runs when someone presses play, and is remembered,
// because every reader shares this server's address against Commons' rate limit.
import { TtlCache } from "./cache.ts"
import { commonsUrl, type CommonsPage, lookUp, type Recording } from "./commonsAudio.ts"
import { config } from "./config.ts"

export { pickRecording, rankFile, type Recording } from "./commonsAudio.ts"

// Wikimedia asks automated clients to say who they are.
const USER_AGENT = `Diciobase/1.0 (Portuguese dictionary${config.SITE_URL ? `; ${config.SITE_URL}` : ""})`

/** Commons is unreachable or asked us to slow down: not an answer about the word, so it isn't remembered. */
export class PronunciationUnavailable extends Error {}

let pausedUntil = 0

async function commons(params: Record<string, string>): Promise<CommonsPage[]> {
  if (Date.now() < pausedUntil) throw new PronunciationUnavailable("paused")
  const url = commonsUrl(params)
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(4000) }).catch(() => null)
  if (!res) throw new PronunciationUnavailable("network")
  if (res.status === 429) {
    const wait = Number(res.headers.get("retry-after"))
    pausedUntil = Date.now() + (Number.isFinite(wait) && wait > 0 ? wait * 1000 : 60_000)
    throw new PronunciationUnavailable("rate limited")
  }
  if (!res.ok) throw new PronunciationUnavailable(`status ${res.status}`)
  const body = (await res.json().catch(() => null)) as { query?: { pages?: CommonsPage[] } } | null
  if (!body) throw new PronunciationUnavailable("bad response")
  return body.query?.pages ?? []
}

const DAY = 24 * 60 * 60 * 1000
const found = new TtlCache<Recording>(5000, 30 * DAY)
const absent = new TtlCache<true>(5000, DAY)
const inflight = new Map<string, Promise<Recording | null>>()

export async function recordingFor(word: string): Promise<Recording | null> {
  const key = word.normalize("NFC")
  const hit = found.get(key)
  if (hit) return hit
  if (absent.get(key)) return null
  const running = inflight.get(key)
  if (running) return running
  const work = lookUp(key, commons)
    .then((r) => {
      if (r) found.set(key, r)
      else absent.set(key, true)
      return r
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, work)
  return work
}
