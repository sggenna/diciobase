/// <reference types="vite/client" />
// Thin client for the Express API (server/). Requests go to same-origin /api
// (Vite proxies it in development), so the session cookie is first-party and
// is never readable from JavaScript. A build with VITE_STATIC=1 has no server
// at all and swaps in staticApi: published dictionary files, saved words on this device.
import { staticApi } from "@/lib/staticApi"

export const STATIC_SITE = import.meta.env.VITE_STATIC === "1"

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code)
  }
}

export interface ApiUser {
  id: number
  email: string
  name: string
}

export interface DictToggles {
  wikcionario: boolean
  "dicionario-aberto": boolean
  wordnet: boolean
}

export interface Settings {
  notifications: boolean
  tips: boolean
  interests: string[]
  dicts: DictToggles
}

export interface MeResponse {
  user: ApiUser & { createdAt: string; lastLoginAt: string | null }
  settings: Settings
  stats: { saved: number; searches: number }
}

export interface SavedWord {
  id: number
  word: string
  pos: "n" | "v" | "a" | "r" | null
  gloss: string | null
  /** The dictionary `gloss` comes from. */
  source: string | null
  savedAt: string
}

export interface ApiSense {
  pos: "n" | "v" | "a" | "r"
  gloss: string | null
  examples: string[]
  synonyms: string[]
  broader: string[]
}

export interface ApiSource {
  slug: string
  name: string
  license: string
  licenseUrl: string | null
  attribution: string
}

export interface ApiProseSense {
  text: string
  labels: string[]
  examples: string[]
}

export interface ApiProseEntry {
  pos: string | null
  etymology: string | null
  pronunciations: { ipa: string; region: string | null }[]
  senses: ApiProseSense[]
}

/** A prose dictionary (Wikcionário, Dicionário Aberto) with its licence. */
export interface ApiDictionary extends ApiSource {
  entries: ApiProseEntry[]
}

export interface ApiRecording {
  url: string
  mime: string
  region: "Brasil" | "Portugal" | null
  speaker: string | null
  license: string | null
  page: string
}

export interface ApiEntry {
  word: string
  dictionaries: ApiDictionary[]
  isStopword: boolean
  tags: string[]
  senses: ApiSense[]
  synonyms: string[]
  antonyms: string[]
  /** The names of the sources the antonyms come from. */
  antonymSources: string[]
  sources: ApiSource[]
}

let onUnauthorized: (() => void) | null = null
/** Called when a request that needed a session comes back 401 (e.g. it expired). */
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn
}

interface Options {
  signal?: AbortSignal
  /** Do not treat a 401 as "session expired" (login attempts, the first /me check). */
  auth?: boolean
}

async function request<T>(method: string, path: string, body?: unknown, opts: Options = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: opts.signal,
    })
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e
    throw new ApiError(0, "network")
  }
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && !opts.auth) onUnauthorized?.()
    throw new ApiError(res.status, typeof data?.error === "string" ? data.error : "error")
  }
  return data as T
}

const enc = encodeURIComponent

const serverApi = {
  auth: {
    me: () => request<{ user: ApiUser }>("GET", "/auth/me", undefined, { auth: true }),
    login: (email: string, password: string) =>
      request<{ user: ApiUser }>("POST", "/auth/login", { email, password }, { auth: true }),
    register: (name: string, email: string, password: string) =>
      request<{ user: ApiUser }>("POST", "/auth/register", { name, email, password }, { auth: true }),
    logout: () => request<void>("POST", "/auth/logout", {}, { auth: true }),
  },
  me: {
    get: () => request<MeResponse>("GET", "/me"),
    rename: (name: string) => request<{ ok: true }>("PATCH", "/me", { name }),
    settings: (patch: Partial<Pick<Settings, "notifications" | "tips" | "interests" | "dicts">>) =>
      request<{ ok: true }>("PATCH", "/me/settings", patch),
    saved: () => request<{ saved: SavedWord[] }>("GET", "/me/saved?limit=100"),
    save: (word: string) => request<{ saved: { id: number; word: string } }>("POST", "/me/saved", { word }),
    unsave: (id: number) => request<{ removed: boolean }>("DELETE", `/me/saved/${id}`),
    recordSearch: (query: string) => request<{ ok: true }>("POST", "/me/searches", { query }),
    changePassword: (current: string, next: string) =>
      request<{ ok: true }>("POST", "/me/password", { current, next }),
    deleteAccount: (password: string) => request<void>("POST", "/me/delete-account", { password }),
  },
  words: {
    lookup: (word: string, signal?: AbortSignal) =>
      request<{ query: string; entries: ApiEntry[] }>("GET", `/words/${enc(word)}`, undefined, { signal }),
    audio: (word: string) => request<{ recording: ApiRecording | null }>("GET", `/words/${enc(word)}/audio`),
    suggest: (q: string, signal?: AbortSignal) =>
      request<{ results: string[] }>("GET", `/words/search?q=${enc(q)}&limit=6`, undefined, { signal }),
  },
}

export const api: typeof serverApi = STATIC_SITE ? staticApi : serverApi
