// Real recordings of a word, from Wikimedia Commons: no key, and the same open
// data family as the dictionaries. The datasets carry IPA but no audio, so this
// is a live lookup. It only runs when someone presses play, and is remembered,
// because every reader shares this server's address against Commons' rate limit.
import { TtlCache } from "./cache.ts"
import { config } from "./config.ts"

export interface Recording {
  /** A file on upload.wikimedia.org, in a format every browser plays. */
  url: string
  mime: string
  region: "Brasil" | "Portugal" | null
  speaker: string | null
  license: string | null
  /** The file's page on Commons: the credit links here, as its licence asks. */
  page: string
}

interface CommonsPage {
  title?: string
  missing?: unknown
  videoinfo?: {
    url?: string
    mime?: string
    descriptionurl?: string
    derivatives?: { src?: string; type?: string }[]
    extmetadata?: { LicenseShortName?: { value?: string }; Artist?: { value?: string } }
  }[]
}

const API = "https://commons.wikimedia.org/w/api.php"
const UPLOADS = "https://upload.wikimedia.org/"
const AUDIO_EXT = String.raw`\.(?:ogg|oga|opus|wav|mp3|flac)$`
// Wikimedia asks automated clients to say who they are.
const USER_AGENT = `Diciobase/1.0 (Portuguese dictionary${config.SITE_URL ? `; ${config.SITE_URL}` : ""})`

const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/_/g, " ")
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const fileName = (title: string) => title.replace(/^[^:]*:/, "")
const plainText = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()

/** Which kind of Portuguese recording of exactly this word a file is, best first; null if it isn't one. */
export function rankFile(word: string, name: string): { rank: number; region: Recording["region"] } | null {
  const file = norm(name)
  const w = escapeRegExp(norm(word))
  if (new RegExp(`^pt-br-${w}${AUDIO_EXT}`).test(file)) return { rank: 0, region: "Brasil" }
  // Lingua Libre: "LL-Q5146 (por)-Speaker-word.wav". Q5146 is the language, so the country isn't stated.
  if (new RegExp(`^ll-q\\d+ \\(por\\)-.+-${w}${AUDIO_EXT}`).test(file)) return { rank: 1, region: null }
  if (new RegExp(`^pt-pt-${w}${AUDIO_EXT}`).test(file)) return { rank: 2, region: "Portugal" }
  return null
}

/** The best recording among Commons' answers, or null. Only ever a URL on Wikimedia's own upload host. */
export function pickRecording(word: string, pages: CommonsPage[]): Recording | null {
  const ranked = pages
    .flatMap((p) => {
      const info = p.videoinfo?.[0]
      const match = p.title && !("missing" in p) && info ? rankFile(word, fileName(p.title)) : null
      return match && info ? [{ ...match, info, title: p.title! }] : []
    })
    .sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title))

  for (const { info, region } of ranked) {
    // Safari can't play Ogg, so the MP3 Commons derives from each file comes first.
    const mp3 = info.derivatives?.find((d) => d.type?.startsWith("audio/mpeg") && d.src?.startsWith(UPLOADS))
    const direct = info.url?.startsWith(UPLOADS) && /^audio\/(?:wav|x-wav|wave|mpeg|mp3)/.test(info.mime ?? "") ? info.url : null
    const url = mp3?.src ?? direct
    if (!url || !info.descriptionurl) continue
    // Lingua Libre writes "Speaker: Ana Recorder: Bia"; the credit names the voice.
    const artist = plainText(info.extmetadata?.Artist?.value ?? "").replace(/^Speaker:\s*(.+?)(?:\s+Recorder:.*)?$/i, "$1")
    return {
      url,
      mime: mp3 ? "audio/mpeg" : info.mime!,
      region,
      speaker: artist ? artist.slice(0, 80) : null,
      license: plainText(info.extmetadata?.LicenseShortName?.value ?? "").slice(0, 40) || null,
      page: info.descriptionurl,
    }
  }
  return null
}

/** Commons is unreachable or asked us to slow down: not an answer about the word, so it isn't remembered. */
export class PronunciationUnavailable extends Error {}

let pausedUntil = 0

async function commons(params: Record<string, string>): Promise<CommonsPage[]> {
  if (Date.now() < pausedUntil) throw new PronunciationUnavailable("paused")
  const url = new URL(API)
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "videoinfo",
    viprop: "url|mime|derivatives|extmetadata",
    viextmetadatafilter: "LicenseShortName|Artist",
    ...params,
  }).toString()
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

async function lookUp(word: string): Promise<Recording | null> {
  // The named files can be asked for directly, at no search cost. A Brazilian one ends the lookup.
  const named = await commons({ titles: [`File:Pt-br-${word}.ogg`, `File:Pt-pt-${word}.ogg`].join("|") })
  const brazilian = pickRecording(word, named.filter((p) => /^[^:]*:pt-br-/i.test(p.title ?? "")))
  if (brazilian) return brazilian
  if (word.includes('"')) return pickRecording(word, named)
  const search = await commons({
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "20",
    gsrsearch: `intitle:"${word}" intitle:"por" filetype:audio`,
  })
  return pickRecording(word, [...named, ...search])
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
  const work = lookUp(key)
    .then((r) => {
      if (r) found.set(key, r)
      else absent.set(key, true)
      return r
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, work)
  return work
}
