import { useEffect, useId, useState } from "react"
import type * as React from "react"
import { api } from "@/lib/api"
import { prefetchWord } from "@/lib/words"

const MIN_CHARS = 2
const DEBOUNCE_MS = 90

// Remembered for the whole session: typing "ca", deleting, typing "ca" again costs nothing.
const suggestCache = new Map<string, string[]>()

/**
 * Autocomplete for a search input: debounced lookups against the API, plus the
 * ARIA combobox wiring and keyboard handling (↑ ↓ Enter Esc).
 */
export function useSuggest(value: string, onPick: (word: string) => void) {
  const listId = useId()
  const [items, setItems] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  // The term the current `items` answer, so "no matches" shows only once a lookup has actually come back empty.
  const [answered, setAnswered] = useState("")

  useEffect(() => {
    const term = value.trim()
    setActive(-1)
    if (term.length < MIN_CHARS) {
      setItems([])
      return
    }
    const key = term.normalize("NFC").toLowerCase()
    const known = suggestCache.get(key)
    if (known) {
      setItems(known)
      setAnswered(key)
      return
    }
    const ctl = new AbortController()
    const t = setTimeout(() => {
      api.words.suggest(term, ctl.signal).then(
        (r) => {
          suggestCache.set(key, r.results)
          setItems(r.results)
          setAnswered(key)
        },
        (e) => {
          if ((e as Error).name !== "AbortError") setItems([]) // suggestions are optional: stay quiet if the API is away
        },
      )
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(t)
      ctl.abort()
    }
  }, [value])

  const term0 = value.trim()
  const noMatch = open && items.length === 0 && term0.length >= MIN_CHARS && answered === term0.normalize("NFC").toLowerCase()
  const visible = open && items.length > 0

  // Typed "acao" and the best match is "ação": say so, so the list never looks wrong.
  const plain = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
  const term = value.trim()
  const top = items[0]
  const lead = top ? Array.from(top).slice(0, Array.from(term).length).join("") : ""
  const corrected =
    top && term && plain(lead) === plain(term) && lead.toLowerCase() !== term.toLowerCase()
      ? plain(top) === plain(term)
        ? top
        : `${lead}…`
      : null

  // The suggestion under the cursor or arrow key is the likely next page: load it now.
  useEffect(() => {
    const w = items[active]
    if (visible && w) prefetchWord(w)
  }, [visible, items, active])

  const inputProps = {
    role: "combobox" as const,
    "aria-autocomplete": "list" as const,
    "aria-expanded": visible || noMatch,
    "aria-controls": listId,
    "aria-activedescendant": active >= 0 ? `${listId}-${active}` : undefined,
    autoComplete: "off",
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      } else if (e.key === "ArrowDown" && items.length) {
        e.preventDefault()
        setOpen(true)
        setActive((a) => (a + 1) % items.length)
      } else if (e.key === "ArrowUp" && items.length) {
        e.preventDefault()
        setActive((a) => (a <= 0 ? items.length - 1 : a - 1))
      } else if (e.key === "Enter" && visible && active >= 0) {
        e.preventDefault()
        setOpen(false)
        onPick(items[active]!)
      }
    },
  }

  const list = noMatch ? (
    <div
      id={listId}
      role="status"
      className="absolute left-0 right-0 top-full mt-2 z-30 rounded-lg bg-white px-4 py-3 text-left text-label-secondary"
      style={{ fontSize: 14, lineHeight: "20px", boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.12)" }}
    >
      Nenhuma palavra começa com <span className="text-ink font-medium">“{term0}”</span>. Pressione Enter para buscar mesmo assim.
    </div>
  ) : visible ? (
    <ul
      id={listId}
      role="listbox"
      aria-label="Sugestões de palavras"
      className="absolute left-0 right-0 top-full mt-2 z-30 overflow-hidden rounded-lg bg-white py-2 text-left"
      style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.12)" }}
    >
      {corrected && (
        <li role="presentation" className="px-4 pt-2 pb-2 text-muted" style={{ fontSize: 12.5 }}>
          Mostrando resultados para <span className="text-ink font-medium">{corrected}</span>
        </li>
      )}
      {items.map((w, i) => (
        <li
          key={w}
          id={`${listId}-${i}`}
          role="option"
          aria-selected={i === active}
          // mousedown (not click) so the input keeps focus and blur does not close the list first
          onMouseDown={(e) => {
            e.preventDefault()
            setOpen(false)
            onPick(w)
          }}
          onMouseEnter={() => setActive(i)}
          className="px-4 py-3 cursor-pointer text-ink"
          style={{ fontSize: 15, background: i === active ? "var(--color-surface)" : "transparent" }}
        >
          {w}
        </li>
      ))}
    </ul>
  ) : null

  return { inputProps, list }
}
