import { useEffect, useMemo, useRef } from "react"
import { prefetchWord } from "@/lib/words"
import { DICT_COLOR } from "@/lib/data"
import { HERO_CARDS } from "@/lib/heroWords"
import { breathOf, HOVER_SCALE, placeSlot, solveOrbit, type OrbitLayout, type Rect, type Slot } from "@/lib/orbit"
import { syllabify } from "@/lib/syllables"

const DICT_NAME: Record<string, string> = { wikcionario: "Wikcionário", "dicionario-aberto": "Dicionário Aberto", wordnet: "OpenWordnet" }
const LOOP_SECONDS = 240
const FOCUS_SPEED = 0.25
const START_PHASE = 0.125 // begins with the cards in the corners, the calmest arrangement
const PHONE_BELOW = 768

interface Card {
  word: string
  syllables: string
  def: string
  dict: string
}

/** Blur and opacity only get written when they really change, so most frames just move the cards. */
function paintLook(el: HTMLElement, opacity: number, blur: number) {
  const o = opacity.toFixed(3)
  const b = blur < 0.05 ? "none" : `blur(${blur.toFixed(1)}px)`
  if (el.dataset.o !== o) {
    el.dataset.o = o
    el.style.opacity = o
  }
  if (el.dataset.b !== b) {
    el.dataset.b = b
    el.style.filter = b
  }
}

/**
 * The entries turning around the Home hero. They repeat what the search can reach, so they sit outside
 * the accessibility tree and the tab order; a pointer gets the shortcut, nobody loses content.
 * `container` holds both the field and the content the cards keep clear of (marked data-orbit-obstacle).
 */
export function OrbitField({
  container,
  focused,
  onOpen,
  insetTop,
  paused = false,
}: {
  container: React.RefObject<HTMLElement | null>
  focused: boolean
  onOpen: (word: string) => void
  /** Set when the field fills a frame rather than the window (a demo): the room its own nav takes, read in place of the page's. */
  insetTop?: number
  /** Holds the cards where they are, for a field something else is covering. */
  paused?: boolean
}) {
  const cards = useMemo<Card[]>(
    () =>
      Object.entries(HERO_CARDS).flatMap(([dict, list]) =>
        list.map(({ word, def }) => ({ word, def, dict, syllables: syllabify(word)?.join("·") ?? word })),
      ),
    [],
  )
  const els = useRef<(HTMLDivElement | null)[]>([])
  const focusRef = useRef(focused)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const invalidate = useRef<() => void>(() => undefined)
  const hover = useRef<number[]>(cards.map(() => 0))
  const hoverTarget = useRef<number[]>(cards.map(() => 0))

  useEffect(() => {
    focusRef.current = focused
    invalidate.current()
  }, [focused])

  useEffect(() => {
    const root = container.current
    if (!root) return
    const nodes = els.current.filter((e): e is HTMLDivElement => !!e)
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let layout: OrbitLayout | null = null
    let phase = START_PHASE
    let clock = 0
    let focus = focusRef.current ? 1 : 0
    let frame = 0
    let last = 0
    let shownAt = 0
    let timer = 0
    const slotOf = new Map<number, Slot>()

    function paintPositions(p: number, hoverAll = false, breath?: (index: number) => number) {
      if (!layout) return
      for (const [i, slot] of layout.slots.entries()) {
        const el = nodes[slot.card]!
        // Reduced motion keeps every card at its resting place.
        const b = breath ? breath(i) : still ? 0 : breathOf(slot, clock)
        const { x, y, scale, rotation } = placeSlot(layout, slot, p, b)
        const h = hoverAll ? 1 : hover.current[slot.card]!
        const s = scale * (1 + h * (HOVER_SCALE - 1))
        el.style.transform = `translate3d(${(x - el.offsetWidth / 2).toFixed(2)}px, ${(y - el.offsetHeight / 2).toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${s.toFixed(4)})`
      }
    }

    function paintLooks(now: number) {
      if (!layout) return
      layout.slots.forEach((slot, order) => {
        const el = nodes[slot.card]!
        const { dz } = placeSlot(layout!, slot, phase)
        const h = hover.current[slot.card]!
        const base = (0.34 + dz * 0.5) * slot.fade
        const rest = base + (1 - base) * h
        const restBlur = (1 - dz) * 2.6 * (1 - h)
        // The cards arrive one after another.
        const reveal = still ? 1 : Math.min(1, Math.max(0, (now - shownAt - 200 - order * 55) / 700))
        paintLook(el, (rest + (0.1 - rest) * focus) * reveal, restBlur + (4 - restBlur) * focus + (1 - reveal) * 6)
        el.style.zIndex = String(Math.round(dz * 100) + (h > 0.05 ? 200 : 0))
      })
    }

    function measure() {
      const rect = root!.getBoundingClientRect()
      // A frame can be scaled, and the cards are placed in its own pixels.
      const k = insetTop === undefined ? 1 : rect.width / (root!.offsetWidth || rect.width)
      const box = { left: rect.left, top: rect.top, width: rect.width / k, height: rect.height / k }
      const rel = (r: DOMRect): Rect => ({ x0: (r.left - box.left) / k, y0: (r.top - box.top) / k, x1: (r.right - box.left) / k, y1: (r.bottom - box.top) / k })
      const obstacles = [...root!.querySelectorAll("[data-orbit-obstacle]")].map((o) => rel(o.getBoundingClientRect()))
      // The navs are fixed, so they're read against the window; a footer belongs to the page.
      let top = insetTop ?? 0
      let bottom = box.height
      for (const nav of insetTop === undefined ? document.querySelectorAll("nav") : []) {
        const r = nav.getBoundingClientRect()
        if (r.height === 0) continue
        if (r.top <= 1) top = Math.max(top, r.bottom)
        else bottom = Math.min(bottom, r.top)
      }
      const footer = root!.querySelector("footer")
      if (footer && footer.getBoundingClientRect().height > 0) bottom = Math.min(bottom, rel(footer.getBoundingClientRect()).y0)
      return { box, obstacles, top, bottom }
    }

    function solve() {
      const { box, obstacles, top, bottom } = measure()
      // A page that scrolls would carry cards under the fixed nav, so a screen that short shows none.
      const scrolls = insetTop === undefined && root!.scrollHeight > window.innerHeight + 1
      const dicts = Object.keys(HERO_CARDS)
      layout = scrolls
        ? null
        : solveOrbit({
            width: box.width,
            height: box.height,
            obstacles,
            top,
            bottom,
            phone: box.width < PHONE_BELOW,
            sizes: nodes.map((n) => ({ w: n.offsetWidth, h: n.offsetHeight })),
            groups: dicts.map((d) => cards.flatMap((c, i) => (c.dict === d ? [i] : []))),
          })
      slotOf.clear()
      layout?.slots.forEach((s) => slotOf.set(s.card, s))
      nodes.forEach((n, i) => {
        const on = slotOf.has(i)
        n.style.visibility = on ? "visible" : "hidden"
        n.style.pointerEvents = on ? "auto" : "none"
      })
      paintPositions(phase)
      paintLooks(performance.now())
      if (import.meta.env.DEV && insetTop === undefined) void devCheck()
    }

    // Development only: walk the real elements through the loop and say so if anything ever touches.
    async function devCheck() {
      const { checkOrbit } = await import("@/lib/orbitCheck")
      const run = (hoverAll = false) =>
        checkOrbit({
          cards: nodes.filter((_, i) => slotOf.has(i)),
          obstacles: () => [
            ...[...root!.querySelectorAll<HTMLElement>("[data-orbit-obstacle]")].map((el) => ({ name: el.dataset.orbitObstacle || "conteúdo", el })),
            ...[...document.querySelectorAll("nav, footer")].filter((el) => el.getBoundingClientRect().height > 0).map((el) => ({ name: el.tagName.toLowerCase(), el })),
          ],
          place: (p, h, b) => paintPositions(p, h, b),
          restore: () => paintPositions(phase),
          hover: hoverAll,
        })
      // How many cards a reader really sees: a ring can run past the page's sides.
      const onScreen = () => {
        const counts: number[] = []
        for (let i = 0; i < 120; i++) {
          paintPositions(i / 120)
          counts.push(
            nodes.filter((n, c) => {
              if (!slotOf.has(c)) return false
              const r = n.getBoundingClientRect()
              return r.left + r.width / 2 > 0 && r.left + r.width / 2 < window.innerWidth
            }).length,
          )
        }
        paintPositions(phase)
        return { min: Math.min(...counts), avg: counts.reduce((a, b) => a + b, 0) / counts.length }
      }
      const report = {
        onScreen,
        cards: layout?.slots.length ?? 0,
        rings: layout?.rings.length ?? 0,
        k: layout?.k ?? 0,
        exponent: layout?.exponent ?? 0,
        jitter: layout?.jitter ?? 0,
        spreadX: layout?.spreadX ?? 0,
        spreadY: layout?.spreadY ?? 0,
        run,
      }
      ;(window as unknown as { __orbit?: typeof report }).__orbit = report
      const collisions = run()
      if (collisions.length) console.warn(`[orbit] ${collisions.length} overlaps across the loop`, collisions.slice(0, 8))
    }

    function schedule() {
      window.clearTimeout(timer)
      timer = window.setTimeout(solve, 120)
    }

    function tick(now: number) {
      frame = 0
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (pausedRef.current) return request()
      const focusTarget = focusRef.current ? 1 : 0
      focus += (focusTarget - focus) * (1 - Math.exp(-dt * 6))
      if (Math.abs(focusTarget - focus) < 0.001) focus = focusTarget
      const pace = 1 + (FOCUS_SPEED - 1) * focus
      phase += (dt / LOOP_SECONDS) * pace
      clock += dt * pace
      const blend = 1 - Math.exp(-dt * 8)
      hover.current.forEach((h, i) => {
        const target = hoverTarget.current[i]!
        const next = h + (target - h) * blend
        hover.current[i] = Math.abs(target - next) < 0.001 ? target : next
      })
      paintPositions(phase)
      paintLooks(now)
      request()
    }
    function request() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(tick)
    }
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else if (!still) {
        last = performance.now()
        request()
      }
    }

    invalidate.current = () => {
      if (!still) return
      focus = focusRef.current ? 1 : 0
      hover.current = [...hoverTarget.current]
      paintPositions(phase)
      paintLooks(performance.now())
    }

    shownAt = performance.now()
    solve()
    last = shownAt
    if (!still) request()

    const ro = new ResizeObserver(schedule)
    ro.observe(root)
    root.querySelectorAll("[data-orbit-obstacle]").forEach((o) => ro.observe(o))
    document.addEventListener("visibilitychange", onVisibility)
    void document.fonts?.ready.then(schedule)
    // The page arrives on a transition; measure again once it has settled.
    const settled = window.setTimeout(solve, 500)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      window.clearTimeout(settled)
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      invalidate.current = () => undefined
    }
  }, [cards, container, insetTop])

  return (
    <div aria-hidden="true" className="orbit-field">
      {cards.map((c, i) => (
        <div
          key={c.word}
          ref={(el) => {
            els.current[i] = el
          }}
          data-word={c.word}
          className="orbit-card"
          onClick={() => onOpen(c.word)}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return
            hoverTarget.current[i] = 1
            prefetchWord(c.word)
            invalidate.current()
          }}
          onPointerLeave={() => {
            hoverTarget.current[i] = 0
            invalidate.current()
          }}
        >
          <div className="orbit-card__word">{c.word}</div>
          <div className="orbit-card__syl">{c.syllables}</div>
          <p className="orbit-card__def">{c.def}</p>
          <div className="orbit-card__src">
            <i style={{ background: DICT_COLOR[c.dict] }} />
            {DICT_NAME[c.dict]}
          </div>
        </div>
      ))}
    </div>
  )
}
