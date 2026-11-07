import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import { useToast } from "@/components/ui/Toast"
import { EASE_OUT } from "@/lib/motion"
import {
  SCREEN_TIPS,
  TERM_HELP,
  TIPS,
  type TipId,
  type TipScreen,
} from "@/lib/tips"

/* -------------------------------------------------------------------------- */
/*  State: which tips were already seen, and whether tips are on at all.       */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "diciobase:tips:v1"

interface Stored {
  enabled: boolean
  seen: TipId[]
}

function load(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return {
        enabled: p.enabled !== false,
        seen: Array.isArray(p.seen) ? p.seen : [],
      }
    }
  } catch {
    /* storage unavailable: fall through to defaults */
  }
  return { enabled: true, seen: [] }
}

function persist(s: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

interface TipsApi {
  enabled: boolean
  seen: ReadonlySet<TipId>
  markSeen: (id: TipId) => void
  /** Turning tips back on also replays them from the start. */
  setEnabled: (on: boolean) => void
}

const TipsContext = createContext<TipsApi | null>(null)

export function useTips(): TipsApi {
  const ctx = useContext(TipsContext)
  if (!ctx) throw new Error("useTips must be used inside <TipsProvider>")
  return ctx
}

export function TipsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(load)

  const markSeen = useCallback((id: TipId) => {
    setState((s) => {
      if (s.seen.includes(id)) return s
      const next = { ...s, seen: [...s.seen, id] }
      persist(next)
      return next
    })
  }, [])

  const setEnabled = useCallback((on: boolean) => {
    setState((s) => {
      const next: Stored = on ? { enabled: true, seen: [] } : { ...s, enabled: false }
      persist(next)
      return next
    })
  }, [])

  const api = useMemo<TipsApi>(
    () => ({
      enabled: state.enabled,
      seen: new Set(state.seen),
      markSeen,
      setEnabled,
    }),
    [state, markSeen, setEnabled],
  )

  return <TipsContext.Provider value={api}>{children}</TipsContext.Provider>
}

/* -------------------------------------------------------------------------- */
/*  Bubble: a small dark card anchored to a rectangle, kept inside the screen. */
/* -------------------------------------------------------------------------- */

interface Box {
  top: number
  left: number
  width: number
  height: number
}

const MARGIN = 12
const GAP = 14
const MAX_W = 288

function readBox(el: Element): Box {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function sameBox(a: Box | null, b: Box) {
  return (
    !!a &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

function Bubble({
  anchor,
  prefer = "bottom",
  id,
  role,
  children,
}: {
  anchor: Box
  prefer?: "top" | "bottom"
  id?: string
  role: "note" | "tooltip"
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(140)

  useLayoutEffect(() => {
    if (ref.current) setHeight(ref.current.offsetHeight)
  })

  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(MAX_W, vw - MARGIN * 2)
  const cx = anchor.left + anchor.width / 2
  const left = Math.min(Math.max(cx - width / 2, MARGIN), vw - width - MARGIN)

  const tabbar = document.documentElement.dataset.tabbar === "1"
  const topLimit = 60
  const bottomLimit = vh - (tabbar ? 84 : MARGIN)
  const fitsBelow = anchor.top + anchor.height + GAP + height <= bottomLimit
  const fitsAbove = anchor.top - GAP - height >= topLimit
  const placement =
    prefer === "bottom"
      ? fitsBelow || !fitsAbove
        ? "bottom"
        : "top"
      : fitsAbove || !fitsBelow
        ? "top"
        : "bottom"

  const top =
    placement === "bottom"
      ? anchor.top + anchor.height + GAP
      : anchor.top - GAP - height
  const arrowLeft = Math.min(Math.max(cx - left, 20), width - 20)
  const dy = placement === "bottom" ? 6 : -6

  return createPortal(
    <motion.div
      ref={ref}
      id={id}
      role={role}
      initial={{ opacity: 0, y: dy, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: dy / 2, transition: { duration: 0.12 } }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
      className="fixed z-[71] rounded-2xl text-ink"
      style={{
        top,
        left,
        width,
        // Frosted white, like the navbar and tab bar: light, soft, no hard edge.
        background: "rgba(255,255,255,0.84)",
        backdropFilter: "saturate(180%) blur(24px)",
        WebkitBackdropFilter: "saturate(180%) blur(24px)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 20px 50px -14px rgba(0,0,0,0.20), 0 2px 10px rgba(0,0,0,0.04)",
        fontFamily: "var(--font-sf)",
        transformOrigin: `${arrowLeft}px ${placement === "bottom" ? "0%" : "100%"}`,
      }}
    >
      <div className="relative">{children}</div>
    </motion.div>,
    document.body,
  )
}

function Ring({ anchor, radius }: { anchor: Box; radius: number }) {
  return createPortal(
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="fixed z-[70] pointer-events-none"
      style={{
        top: anchor.top - 4,
        left: anchor.left - 4,
        width: anchor.width + 8,
        height: anchor.height + 8,
        borderRadius: radius + 4,
        animation: "tip-halo 2.6s ease-in-out infinite",
      }}
    />,
    document.body,
  )
}

/* -------------------------------------------------------------------------- */
/*  TipHost: first-use coachmarks for one screen.                              */
/* -------------------------------------------------------------------------- */

const START_DELAY = 1300
const GAP_DELAY = 500
const POLL = 250

function findTarget(id: TipId): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tip="${id}"]`)
  for (const el of nodes) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden") {
      return el
    }
  }
  return null
}

function radiusOf(el: HTMLElement) {
  const own = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
  if (own > 0) return own
  const child = el.firstElementChild
  return child ? parseFloat(getComputedStyle(child).borderTopLeftRadius) || 0 : 0
}

export function TipHost({
  screen,
  paused = false,
}: {
  screen: TipScreen
  paused?: boolean
}) {
  const { enabled, seen, markSeen, setEnabled } = useTips()
  const { toast } = useToast()
  const { ids, max } = SCREEN_TIPS[screen]

  const [ready, setReady] = useState(false)
  const [shown, setShown] = useState<TipId[]>([])
  const [current, setCurrent] = useState<TipId | null>(null)
  const [total, setTotal] = useState(0)
  const [anchor, setAnchor] = useState<Box | null>(null)
  const [radius, setRadius] = useState(0)
  const gapTimer = useRef<number>(0)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), START_DELAY)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(gapTimer.current)
    }
  }, [])

  // Pick the next unseen tip whose target is actually on screen.
  useEffect(() => {
    if (!ready || !enabled || paused || current || shown.length >= max) return
    const unseen = ids.filter((i) => !seen.has(i) && !shown.includes(i))
    if (!unseen.length) return
    const pick = () => {
      const next = unseen.find((i) => findTarget(i))
      if (!next) return false
      if (shown.length === 0) {
        setTotal(Math.min(max, unseen.filter((i) => findTarget(i)).length))
      }
      setCurrent(next)
      return true
    }
    if (pick()) return
    const started = Date.now()
    const t = window.setInterval(() => {
      if (pick() || Date.now() - started > 8000) window.clearInterval(t)
    }, POLL)
    return () => window.clearInterval(t)
  }, [ready, enabled, paused, current, shown, seen, ids, max])

  const finish = useCallback(
    (id: TipId, learned = true) => {
      if (learned) markSeen(id)
      setShown((s) => [...s, id])
      setCurrent(null)
      setAnchor(null)
      setReady(false)
      window.clearTimeout(gapTimer.current)
      gapTimer.current = window.setTimeout(() => setReady(true), GAP_DELAY)
    },
    [markSeen],
  )

  // Follow the target: bring it into view, then track its box every frame.
  useEffect(() => {
    if (!current) return
    const el = findTarget(current)
    if (!el) {
      finish(current, false)
      return
    }
    setRadius(radiusOf(el))
    const r = el.getBoundingClientRect()
    const tabbar = document.documentElement.dataset.tabbar === "1"
    if (r.top < 64 || r.bottom > window.innerHeight - (tabbar ? 90 : 20)) {
      el.scrollIntoView({ block: "center", behavior: "smooth" })
    }
    let raf = 0
    let last: Box | null = null
    const tick = () => {
      if (!el.isConnected) {
        finish(current, false)
        return
      }
      const box = readBox(el)
      if (!sameBox(last, box)) {
        last = box
        setAnchor(box)
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [current, finish])

  // Using the highlighted thing counts as learning it; Esc dismisses.
  useEffect(() => {
    if (!current || paused) return
    const onDown = (e: PointerEvent) => {
      const el = findTarget(current)
      if (el && e.target instanceof Node && el.contains(e.target)) finish(current)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(current)
    }
    document.addEventListener("pointerdown", onDown, true)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown, true)
      document.removeEventListener("keydown", onKey)
    }
  }, [current, paused, finish])

  const tip = current ? TIPS[current] : null
  const step = shown.length + 1
  const isLast = step >= total

  const visible = enabled && !paused && !!current && !!tip && !!anchor

  return (
    <AnimatePresence>
      {visible && current && tip && anchor
        ? [
            <Ring key={`ring-${current}`} anchor={anchor} radius={radius} />,
            <Bubble
              key={`bubble-${current}`}
              anchor={anchor}
              prefer={tip.placement ?? "bottom"}
              role="note"
            >
              <div className="px-4 pt-4 pb-3">
                <p className="font-semibold" style={{ fontSize: 15, letterSpacing: "-0.01em" }}>
                  {tip.title}
                </p>
                <p
                  className="mt-1"
                  style={{ fontSize: 13.5, lineHeight: 1.45, color: "var(--color-label-secondary)" }}
                >
                  {tip.body}
                </p>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEnabled(false)
                      toast({
                        id: "tips",
                        title: "Dicas desativadas",
                        description: "Para vê-las de novo, ative em Perfil › Dicas de uso.",
                        variant: "info",
                      })
                    }}
                    className="hit-area relative rounded-full px-1 py-1 transition-colors hover:text-ink"
                    style={{ fontSize: 12.5, color: "var(--color-muted)" }}
                  >
                    Pular dicas
                  </button>
                  <div className="flex items-center gap-3">
                    {total > 1 && (
                      <span className="tabular-nums" style={{ fontSize: 12, color: "var(--color-muted)" }}>
                        {Math.min(step, total)} de {total}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => finish(current)}
                      className="h-8 px-4 rounded-full bg-ink text-on-ink font-semibold transition-[opacity,scale] hover:opacity-85 active:scale-[0.97]"
                      style={{ fontSize: 13 }}
                    >
                      {isLast ? "Entendi" : "Próxima"}
                    </button>
                  </div>
                </div>
              </div>
            </Bubble>,
          ]
        : null}
    </AnimatePresence>
  )
}

/* -------------------------------------------------------------------------- */
/*  InfoTip: an always-available "what is this?" for a term or label.          */
/* -------------------------------------------------------------------------- */

export function InfoTip({
  term,
  title,
  body,
  children,
  className = "",
}: {
  /** Key into TERM_HELP, or pass `title` + `body` directly. */
  term?: string
  title?: string
  body?: string
  /** Render the trigger around existing content (e.g. a badge) instead of an "i". */
  children?: React.ReactNode
  className?: string
}) {
  const help = term ? TERM_HELP[term] : undefined
  const heading = title ?? help?.title
  const text = body ?? help?.body
  const id = useId()
  const btn = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<Box | null>(null)
  const pinned = useRef(false)
  const timer = useRef<number>(0)

  const show = useCallback(() => {
    if (!btn.current) return
    setAnchor(readBox(btn.current))
    setOpen(true)
  }, [])
  const hide = useCallback(() => {
    pinned.current = false
    window.clearTimeout(timer.current)
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (btn.current && e.target instanceof Node && btn.current.contains(e.target)) return
      hide()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide()
    }
    document.addEventListener("pointerdown", onDown, true)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", hide, { passive: true })
    window.addEventListener("resize", hide)
    return () => {
      document.removeEventListener("pointerdown", onDown, true)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", hide)
      window.removeEventListener("resize", hide)
    }
  }, [open, hide])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!heading || !text) return <>{children}</>

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-label={`O que é ${heading.toLowerCase()}?`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => {
          if (open && pinned.current) hide()
          else {
            pinned.current = true
            show()
          }
        }}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse" || open) return
          timer.current = window.setTimeout(show, 220)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return
          window.clearTimeout(timer.current)
          if (!pinned.current) setOpen(false)
        }}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) show()
        }}
        onBlur={() => {
          if (!pinned.current) setOpen(false)
        }}
        className={
          children
            ? `cursor-help ${className}`
            : `info-i relative inline-flex items-center justify-center align-middle rounded-full text-muted hover:text-ink transition-[color,opacity] p-1 -m-1 before:absolute before:-inset-2 before:content-[''] ${className}`
        }
      >
        {children ?? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9.5" />
            <path d="M12 11v5.5" />
            <path d="M12 7.6h.01" strokeWidth="2.6" />
          </svg>
        )}
      </button>
      <AnimatePresence>
        {open && anchor && (
          <Bubble anchor={anchor} prefer="top" id={id} role="tooltip">
            <div className="px-4 py-3">
              <p className="font-semibold" style={{ fontSize: 14, letterSpacing: "-0.01em" }}>
                {heading}
              </p>
              <p
                className="mt-1"
                style={{ fontSize: 13, lineHeight: 1.45, color: "var(--color-label-secondary)" }}
              >
                {text}
              </p>
            </div>
          </Bubble>
        )}
      </AnimatePresence>
    </>
  )
}
