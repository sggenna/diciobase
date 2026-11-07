// Finding a real recording of a word on Wikimedia Commons. No key, and the same open data family as the
// dictionaries. Pure on purpose: the API's server and the static site both call it, each with its own fetch.

const API = "https://commons.wikimedia.org/w/api.php"

export const commonsUrl = (params: Record<string, string>) => {
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
  return url
}

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

export interface CommonsPage {
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

const UPLOADS = "https://upload.wikimedia.org/"
const AUDIO_EXT = String.raw`\.(?:ogg|oga|opus|wav|mp3|flac)$`

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

/** The best recording of a word, through whichever transport can reach Commons (the API's server, or the browser). */
export async function lookUp(word: string, commons: (params: Record<string, string>) => Promise<CommonsPage[]>): Promise<Recording | null> {
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
