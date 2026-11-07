import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type * as React from "react"
import { animate, motion, useReducedMotion } from "motion/react"
import { SourceDot } from "@/components/definition/SourceDots"

interface TabDict {
  id: string
  shortName: string
  senses: unknown[]
}

const GAP = 32

/** What each dictionary last showed, across words, so a count can tick from there. */
const lastCount = new Map<string, number>()

/** A sense count that ticks to its new value when the word changes: the dictionaries really do say different amounts. */
function TickCount({ id, value }: { id: string; value: number }) {
  const el = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  useLayoutEffect(() => {
    const node = el.current
    const from = lastCount.get(id)
    if (!node || reduce || from === undefined || from === value) {
      if (node) node.textContent = String(value)
      lastCount.set(id, value)
      return
    }
    node.textContent = String(from)
    const run = animate(from, value, {
      duration: 0.55,
      delay: 0.15,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = String(Math.round(v))
      },
      onComplete: () => lastCount.set(id, value),
    })
    return () => run.stop()
  }, [id, value, reduce])
  return (
    <span ref={el} style={{ fontVariantNumeric: "tabular-nums" }}>
      {value}
    </span>
  )
}
const tabBase =
  "focus-soft relative shrink-0 flex items-center gap-2 h-full rounded-t-md hover:text-ink active:scale-[0.98] transition-[color,scale] duration-200 whitespace-nowrap"

/**
 * Dictionary tabs that show as many as fit and fold the rest into "Mais ▾",
 * so they never run under the Leitura/Estrutura toggle. When the active
 * dictionary is one of the folded ones, the "Mais" tab takes its name.
 */
export function DictTabs({
  dicts,
  activeId,
  onSelect,
  tip,
}: {
  dicts: TabDict[]
  activeId: string
  onSelect: (id: string) => void
  tip?: boolean
}) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)
  const [fit, setFit] = useState(dicts.length)
  const [open, setOpen] = useState(false)

  // Measure every tab (and "Mais") in a hidden row, then count how many fit.
  useLayoutEffect(() => {
    const el = box.current
    const pr = probe.current
    if (!el || !pr) return
    const measure = () => {
      const kids = Array.from(pr.children) as HTMLElement[]
      const widths = kids.slice(0, dicts.length).map((k) => k.offsetWidth)
      const moreW = kids[dicts.length]?.offsetWidth ?? 80
      const avail = el.clientWidth
      const all = widths.reduce((a, w) => a + w, 0) + GAP * (widths.length - 1)
      if (all <= avail) return setFit(dicts.length)
      let used = moreW
      let n = 0
      for (const w of widths) {
        if (used + GAP + w > avail) break
        used += GAP + w
        n++
      }
      setFit(Math.max(1, n))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts?.ready.then(measure).catch(() => undefined)
    return () => ro.disconnect()
  }, [dicts])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const n = e.target as Node
      if (!menuRef.current?.contains(n) && !moreRef.current?.contains(n)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        moreRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>("[role=menuitemradio]")?.focus()
  }, [open])

  const shown = dicts.slice(0, fit)
  const folded = dicts.slice(fit)
  const activeFolded = folded.find((d) => d.id === activeId)

  const underline = (
    <motion.span
      layoutId="dict-underline"
      className="absolute left-0 right-0 -bottom-px h-[2px]"
      style={{ background: "var(--dict-accent)" }}
      transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    />
  )
  const label = (d: TabDict, active: boolean) => (
    <>
      <SourceDot id={d.id} />
      <span style={{ fontWeight: active ? 500 : 400 }}>
        {d.shortName}
        <span className="text-muted" style={{ fontWeight: 400 }}> · <TickCount id={d.id} value={d.senses.length} /></span>
      </span>
    </>
  )
  const color = (active: boolean) => (active ? "var(--color-ink)" : "var(--color-muted)")

  function onMenuKey(e: React.KeyboardEvent) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitemradio]") ?? [])
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      items[(i + 1) % items.length]?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      items[(i - 1 + items.length) % items.length]?.focus()
    }
  }

  return (
    <div ref={box} data-tip={tip ? "def-dicts" : undefined} className="relative flex-1 min-w-0 h-full">
      {/* Hidden row used only to measure widths. */}
      <div
        ref={probe}
        aria-hidden="true"
        className="absolute invisible pointer-events-none flex h-0 overflow-hidden"
        style={{ fontSize: 14 }}
      >
        {dicts.map((d) => (
          <span key={d.id} className="flex items-center gap-2 whitespace-nowrap" style={{ fontWeight: 500 }}>
            <span className="size-2" />
            {d.shortName} · {d.senses.length}
          </span>
        ))}
        <span className="flex items-center gap-2 whitespace-nowrap" style={{ fontWeight: 500 }}>
          Mais
          <svg width="10" height="10" viewBox="0 0 10 10" />
        </span>
      </div>

      <div className="flex items-stretch h-full" style={{ gap: GAP, fontSize: 14 }}>
        <div role="tablist" aria-label="Fonte do dicionário" className="flex items-stretch h-full" style={{ gap: GAP }}>
          {shown.map((d) => {
            const active = d.id === activeId
            return (
              <button
                key={d.id}
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(d.id)}
                className={tabBase}
                style={{ color: color(active) }}
              >
                {label(d, active)}
                {active && underline}
              </button>
            )
          })}
        </div>

        {folded.length > 0 && (
          <div className="relative h-full">
            <button
              ref={moreRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className={tabBase}
              style={{ color: color(!!activeFolded) }}
            >
              {activeFolded ? label(activeFolded, true) : <span style={{ fontWeight: 500 }}>Mais</span>}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-200"
                style={{ transform: open ? "rotate(180deg)" : undefined }}
              >
                <path d="M2 3.5 5 6.5 8 3.5" />
              </svg>
              {activeFolded && underline}
            </button>
            {open && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Outros dicionários"
                onKeyDown={onMenuKey}
                className="absolute left-0 top-full mt-2 z-40 min-w-[200px] rounded-lg bg-white p-2"
                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 12px 32px -8px rgba(0,0,0,0.2)" }}
              >
                {folded.map((d) => {
                  const active = d.id === activeId
                  return (
                    <button
                      key={d.id}
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        onSelect(d.id)
                        setOpen(false)
                      }}
                      className="focus-soft w-full flex items-center gap-3 rounded-sm px-3 h-10 text-left text-ink hover:bg-surface active:scale-[0.98] transition-[background-color,scale] duration-150"
                      style={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
                    >
                      <SourceDot id={d.id} />
                      {d.shortName} · {d.senses.length}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
