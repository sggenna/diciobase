// The app's URLs. A handful of routes, so the History API directly instead of a
// router dependency: `view` in App is derived from the address bar, and App's
// page transitions keep working off the same pageKey as before.
import { useCallback, useEffect, useState } from "react"

export type View =
  | { type: "tutorial" }
  | { type: "home" }
  | { type: "definition"; word: string }
  | { type: "favorites" }
  | { type: "profile" }

/** How the current view was reached: lets a Back press animate as a move back. */
export type Travel = "new" | "back" | "forward"

export interface Route {
  view: View
  travel: Travel
}

const WORD_PREFIX = "/palavra/"
const FIXED: Record<string, View> = {
  "/": { type: "home" },
  "/salvos": { type: "favorites" },
  "/perfil": { type: "profile" },
  "/tutorial": { type: "tutorial" },
}

export const wordKey = (word: string) => word.trim().normalize("NFC").toLowerCase()
export const wordPath = (word: string) => `${WORD_PREFIX}${encodeURIComponent(wordKey(word))}`

export function pathFor(view: View): string {
  if (view.type === "definition") return wordPath(view.word)
  if (view.type === "favorites") return "/salvos"
  if (view.type === "profile") return "/perfil"
  if (view.type === "tutorial") return "/tutorial"
  return "/"
}

/** The view for a path, or null when no page lives there (including a malformed word). */
export function parsePath(pathname: string): View | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
  if (path.startsWith(WORD_PREFIX)) {
    const raw = path.slice(WORD_PREFIX.length)
    if (!raw || raw.includes("/")) return null
    try {
      const word = wordKey(decodeURIComponent(raw))
      return word ? { type: "definition", word } : null
    } catch {
      return null
    }
  }
  return FIXED[path] ?? null
}

/** The address someone else can open: always the canonical word path, never this page's query string. */
export const shareUrl = (word: string) => `${window.location.origin}${wordPath(word)}`

// Each history entry remembers its position, so a popstate can tell Back from
// Forward, and where the page was scrolled when it was left.
const positionOf = (state: unknown) => {
  const idx = (state as { idx?: unknown } | null)?.idx
  return typeof idx === "number" ? idx : null
}
let position = 0
const scrolls = new Map<number, number>()
let pendingScroll = 0

/** Where the page that is arriving should scroll to, once it's on screen. Read by PageTransition. */
export function takeScrollTarget(): number {
  const y = pendingScroll
  pendingScroll = 0
  return y
}

function readInitial(): Route {
  const parsed = parsePath(window.location.pathname)
  const view = parsed ?? { type: "home" as const }
  position = positionOf(window.history.state) ?? 0
  // A typed /palavra/Saudade/ or an address with no page settles on the canonical path, without adding a history entry.
  const path = pathFor(view)
  const url = parsed && path !== window.location.pathname ? path + window.location.search : parsed ? window.location.href : "/"
  window.history.replaceState({ idx: position }, "", url)
  return { view, travel: "new" }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(readInitial)

  useEffect(() => {
    // The page animates out before the next one mounts, so the browser's own restoration would land on the wrong page.
    window.history.scrollRestoration = "manual"
    const onPop = (e: PopStateEvent) => {
      const next = positionOf(e.state) ?? 0
      scrolls.set(position, window.scrollY)
      pendingScroll = scrolls.get(next) ?? 0
      const travel: Travel = next < position ? "back" : "forward"
      position = next
      setRoute({ view: parsePath(window.location.pathname) ?? { type: "home" }, travel })
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const navigate = useCallback((view: View, opts?: { replace?: boolean }) => {
    const path = pathFor(view)
    // Preview flags such as ?dots=off stay on while moving around.
    const url = path + window.location.search
    if (opts?.replace) {
      window.history.replaceState({ idx: position }, "", url)
    } else {
      // Searching for the word already open must not make Back appear to do nothing.
      if (path === window.location.pathname) return
      scrolls.set(position, window.scrollY)
      position += 1
      scrolls.delete(position)
      window.history.pushState({ idx: position }, "", url)
    }
    pendingScroll = 0
    setRoute({ view, travel: "new" })
  }, [])

  return { route, navigate }
}
