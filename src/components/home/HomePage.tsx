import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type * as React from "react"
import { Footer } from "@/components/layout/Footer"
import { OrbitField } from "@/components/home/OrbitField"
import { useSuggest } from "@/components/ui/Suggest"
import { DICT_COLOR, SUGGESTIONS } from "@/lib/data"
import { HERO_WORDS } from "@/lib/heroWords"
import { syllabify } from "@/lib/syllables"

const WORD_SECONDS = 2.8
const TYPE_MS = 55
const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

function Syllables({ word }: { word: string }) {
  const parts = syllabify(word) ?? [word]
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="hero-dot">·</span>}
          {p}
        </span>
      ))}
    </>
  )
}

/**
 * "Encontre o sentido de sau·da·de". The line reserves room for its longest word, so the headline's box
 * never changes size: the fit to each word is a slide of the whole line, a transform and not a layout.
 */
export function Headline({ index }: { index: number }) {
  const measures = useRef<(HTMLSpanElement | null)[]>([])
  const [widths, setWidths] = useState<number[]>([])

  useLayoutEffect(() => {
    // In its own pixels, so a scaled frame (the portfolio's demo) reserves the same room.
    const read = () =>
      setWidths(
        measures.current.map((m) => {
          const title = m?.closest<HTMLElement>(".hero-title")
          const k = title?.offsetWidth ? title.getBoundingClientRect().width / title.offsetWidth : 1
          return (m?.getBoundingClientRect().width ?? 0) / k
        }),
      )
    read()
    void document.fonts?.ready.then(read)
    window.addEventListener("resize", read)
    return () => window.removeEventListener("resize", read)
  }, [])

  const widest = Math.max(0, ...widths)
  const shift = widths.length ? (widest - (widths[index] ?? 0)) / 2 : 0

  return (
    <h1 data-orbit-obstacle="título" className="hero-title">
      <span className="sr-only">Encontre o sentido de qualquer palavra</span>
      <span aria-hidden="true">
        Encontre o sentido
        <br />
        <span className="hero-title__line" style={{ transform: `translateX(${shift.toFixed(1)}px)` }}>
          de{" "}
          <span className="hero-rot" style={{ width: widest || undefined }}>
            {HERO_WORDS.map((w, i) => {
              const place = i === index ? "is-in" : i === (index + HERO_WORDS.length - 1) % HERO_WORDS.length ? "is-above" : "is-below"
              return (
                <span key={w} className={`hero-rot__word ${place}`}>
                  <Syllables word={w} />
                </span>
              )
            })}
            {/* Unseen copies, measured for the slide. */}
            {HERO_WORDS.map((w, i) => (
              <span
                key={w}
                ref={(el) => {
                  measures.current[i] = el
                }}
                className="hero-rot__measure"
              >
                <Syllables word={w} />
              </span>
            ))}
          </span>
        </span>
      </span>
    </h1>
  )
}

export function HomePage({
  onSearch,
  onHeroSearchVisible,
}: {
  onSearch: (word: string) => void
  /** Whether the big search is on screen, so the nav only offers its own search once this one has scrolled away. */
  onHeroSearchVisible?: (visible: boolean) => void
}) {
  const [query, setQuery] = useState("")
  const hero = useRef<HTMLDivElement>(null)
  const heroSearch = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const el = heroSearch.current
    if (!el || !onHeroSearchVisible) return
    // The fixed nav covers the top 52px, so a search hidden under it counts as gone.
    const io = new IntersectionObserver(([e]) => onHeroSearchVisible(e!.isIntersecting), { rootMargin: "-52px 0px 0px 0px" })
    io.observe(el)
    return () => {
      io.disconnect()
      onHeroSearchVisible(true)
    }
  }, [onHeroSearchVisible])
  const [focused, setFocused] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  // ⌘K / Ctrl+K puts the cursor in the search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        input.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])
  const suggest = useSuggest(query, (w) => {
    setQuery("")
    onSearch(w)
  })

  // The headline word turns, and the search's placeholder types whichever word is showing.
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState(() => (still() ? HERO_WORDS[0]! : ""))
  useEffect(() => {
    if (still()) return
    const turn = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % HERO_WORDS.length)
    }, WORD_SECONDS * 1000)
    return () => window.clearInterval(turn)
  }, [])
  useEffect(() => {
    if (still()) return
    const word = HERO_WORDS[index]!
    let n = 0
    setTyped("")
    const typing = window.setInterval(() => {
      n++
      setTyped(word.slice(0, n))
      if (n >= word.length) window.clearInterval(typing)
    }, TYPE_MS)
    return () => window.clearInterval(typing)
  }, [index])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    if (q) onSearch(q)
    else input.current?.focus()
  }

  return (
    <div ref={hero} className="home-hero" style={{ fontFamily: "var(--font-sf)" }}>
      <main className="home-hero__center">
        <Headline index={index} />

        <form ref={heroSearch} onSubmit={submit} data-orbit-obstacle="busca" className="hero-search">
          <div
            data-tip="home-search"
            className="hero-search__field"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="var(--color-muted)" strokeWidth="1.1" strokeLinecap="round" className="shrink-0" aria-hidden="true">
              <circle cx="7" cy="7" r="4.75" />
              <path d="M10.5 10.5l3.25 3.25" />
            </svg>
            <div className="relative flex-1 min-w-0 h-full ml-3 md:ml-4">
              <input
                {...suggest.inputProps}
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  setFocused(true)
                  suggest.inputProps.onFocus()
                }}
                onBlur={() => {
                  setFocused(false)
                  suggest.inputProps.onBlur()
                }}
                aria-label="Pesquise uma palavra"
                className="size-full bg-transparent text-ink outline-none text-[17px] md:text-[18px]"
              />
              {!query && (
                <span aria-hidden="true" className="hero-search__placeholder">
                  Pesquise <em>{typed}</em>
                </span>
              )}
            </div>
            <kbd
              aria-hidden="true"
              className="hidden md:flex shrink-0 items-center h-7 px-2 rounded-sm border border-hairline text-meta"
              style={{ fontFamily: "var(--font-sf)", fontSize: 13, fontWeight: 500 }}
            >
              ⌘K
            </kbd>
          </div>
          <button type="submit" aria-label="Pesquisar" className="hero-orb focus-soft">
            <span className="hero-orb__dots" aria-hidden="true">
              <i style={{ background: DICT_COLOR.wikcionario, left: 7, top: 0 }} />
              <i style={{ background: DICT_COLOR["dicionario-aberto"], left: 0, top: 12 }} />
              <i style={{ background: DICT_COLOR.wordnet, left: 14, top: 12 }} />
            </span>
          </button>
          {suggest.list}
        </form>

        <div data-tip="home-suggestions" data-orbit-obstacle="sugestões" className="hero-chips">
          <span className="text-muted" style={{ fontSize: 13, lineHeight: "20px" }}>
            Experimente
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSearch(s)}
              className="focus-soft h-9 px-4 rounded-full bg-white border border-hairline text-ink hover:border-ink active:scale-[0.97] transition-[border-color,scale] duration-200"
              style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px" }}
            >
              {s}
            </button>
          ))}
        </div>
      </main>
      <OrbitField container={hero} focused={focused} onOpen={onSearch} />
      <div className="relative z-10">
        <Footer compact />
      </div>
    </div>
  )
}
