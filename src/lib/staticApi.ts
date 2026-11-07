// The site without a server: the same shape as the API client, reading the dictionary from published
// files (server/scripts/export-static.ts). There are no accounts here, so saved words and preferences stay on this device.
import { ApiError, type ApiEntry, type ApiRecording, type MeResponse, type SavedWord, type Settings } from "@/lib/api"
import { entryFile, normKey, suggestFile } from "@/lib/staticKeys"
import { commonsUrl, lookUp } from "../../server/src/commonsAudio.ts"

const files = new Map<string, Promise<unknown>>()

function readFile<T>(path: string): Promise<T> {
  let file = files.get(path)
  if (!file) {
    file = (async () => {
      const res = await fetch(path).catch(() => null)
      if (!res?.ok || !res.body) throw new ApiError(0, "network")
      return new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).json()
    })()
    // A failed download must be free to try again.
    file.catch(() => files.delete(path))
    if (files.size > 40) files.delete(files.keys().next().value as string)
    files.set(path, file)
  }
  return file as Promise<T>
}

async function lookup(word: string) {
  const key = normKey(word)
  const shard = await readFile<Record<string, ApiEntry[]>>(entryFile(key))
  const found = shard[key]
  if (!found) throw new ApiError(404, "not_found")
  const exact = word.normalize("NFC")
  // The exact spelling first, like the API: "pais" and "país" are one file entry but two words.
  const entries = [...found].sort((a, b) => Number(b.word === exact) - Number(a.word === exact))
  return { query: word, entries }
}

async function suggest(q: string) {
  const key = normKey(q)
  if (!key) return { results: [] }
  if (Array.from(key).length === 1) {
    const top = await readFile<Record<string, string[]>>(suggestFile(key))
    return { results: (top[key] ?? []).slice(0, 6) }
  }
  const list = await readFile<string[]>(suggestFile(key)).catch((e) => {
    // The site's fallback answers any unknown path with the page itself, which isn't gzip: no such prefix.
    if (e instanceof TypeError) return [] as string[]
    throw e
  })
  return { results: list.filter((w) => normKey(w).startsWith(key)).slice(0, 6) }
}

const SAVED_KEY = "diciobase:saved"
const POS_CODE: Record<string, SavedWord["pos"]> = { substantivo: "n", verbo: "v", adjetivo: "a", "advérbio": "r" }

function readSaved(): SavedWord[] {
  try {
    const list = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]")
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function writeSaved(list: SavedWord[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list))
  } catch {
    throw new ApiError(0, "storage")
  }
}

async function savedRow(word: string): Promise<SavedWord> {
  const row: SavedWord = { id: Date.now(), word, pos: null, gloss: null, source: null, savedAt: new Date().toISOString() }
  const entry = await lookup(word).then((r) => r.entries[0], () => undefined)
  if (!entry) return row
  for (const d of entry.dictionaries) {
    const e = d.entries.find((x) => x.senses.length)
    if (e) return { ...row, word: entry.word, pos: POS_CODE[e.pos?.split(" ")[0] ?? ""] ?? null, gloss: e.senses[0]!.text, source: d.name }
  }
  const s = entry.senses.find((x) => x.gloss)
  return { ...row, word: entry.word, pos: s?.pos ?? null, gloss: s?.gloss ?? null, source: s ? "OpenWordnet-PT" : null }
}

// What the session logic expects of a signed-in reader: saving works straight away, with nothing to sign in to.
const GUEST = { id: 0, email: "", name: "" }
const SETTINGS_KEY = "diciobase:settings"
const SETTINGS: Settings = {
  notifications: false,
  tips: true,
  interests: [],
  dicts: { wikcionario: true, "dicionario-aberto": true, wordnet: true },
}

function readSettings(): Settings {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Partial<Settings>
    return { ...SETTINGS, ...stored, dicts: { ...SETTINGS.dicts, ...stored.dicts } }
  } catch {
    return SETTINGS
  }
}

function writeSettings(patch: Partial<Settings>) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), ...patch }))
  } catch {
    // With storage blocked the choice still holds until the tab closes; it isn't worth an error.
  }
}

const noAccounts = (): never => {
  throw new ApiError(404, "no_accounts")
}

export const staticApi = {
  auth: {
    me: async () => ({ user: GUEST }),
    login: async (_email: string, _password: string) => noAccounts(),
    register: async (_name: string, _email: string, _password: string) => noAccounts(),
    logout: async () => undefined as void,
  },
  me: {
    get: async (): Promise<MeResponse> => ({
      user: { ...GUEST, createdAt: new Date().toISOString(), lastLoginAt: null },
      settings: readSettings(),
      stats: { saved: readSaved().length, searches: 0 },
    }),
    rename: async (_name: string) => noAccounts(),
    settings: async (patch: Partial<Pick<Settings, "notifications" | "tips" | "interests" | "dicts">>) => {
      writeSettings(patch)
      return { ok: true as const }
    },
    saved: async () => ({ saved: readSaved() }),
    save: async (word: string) => {
      const row = await savedRow(word)
      writeSaved([row, ...readSaved().filter((s) => normKey(s.word) !== normKey(row.word))])
      return { saved: { id: row.id, word: row.word } }
    },
    unsave: async (id: number) => {
      writeSaved(readSaved().filter((s) => s.id !== id))
      return { removed: true }
    },
    recordSearch: async (_query: string) => ({ ok: true as const }),
    changePassword: async (_current: string, _next: string) => noAccounts(),
    deleteAccount: async (_password: string) => noAccounts(),
  },
  words: {
    lookup: (word: string, _signal?: AbortSignal) => lookup(word),
    audio: async (word: string): Promise<{ recording: ApiRecording | null }> => {
      const entry = (await lookup(word)).entries[0]
      const recording = await lookUp(entry?.word ?? word, async (params) => {
        // origin=* is how Commons allows a request from a browser. It also spreads its rate limit across readers.
        const res = await fetch(commonsUrl({ ...params, origin: "*" }))
        if (!res.ok) throw new ApiError(res.status, "unavailable")
        const body = (await res.json()) as { query?: { pages?: never[] } }
        return body.query?.pages ?? []
      })
      return { recording }
    },
    suggest: (q: string, _signal?: AbortSignal) => suggest(q),
  },
}
