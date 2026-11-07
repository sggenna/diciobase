/**
 * Adapted from Subframe's activity capsule.
 *
 * MIT License
 * Copyright (c) 2026 Subframe
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { SourceDot } from "@/components/definition/SourceDots"
import { track } from "@/lib/analytics"
import { citationFor } from "@/lib/citation"
import { DICT_ACCENT } from "@/lib/data"

type Phase = "idle" | "copied" | "selected"
const SEGMENTS = 24
const STATUS: Record<Phase, string> = { idle: "Pronta para colar", copied: "Citação copiada", selected: "Selecionada: use ⌘C ou Ctrl+C" }
const GLYPH: Record<Phase, string> = { idle: "“", copied: "✓", selected: "“" }

/**
 * The Cite step of a lookup, beside save and share: a reference ready to paste.
 * It starts on the open dictionary, and any other one can be picked right here
 * without leaving the popover. The popover anchors to the nearest positioned
 * ancestor, so the button row decides where it lines up.
 */
export function CitationCapsule({ word, dicts, activeId }: { word: string; dicts: { id: string; shortName: string }[]; activeId: string }) {
  const options = dicts.filter((d) => citationFor(word, d.id))
  const [selectedId, setSelectedId] = useState(activeId)
  const current = options.find((d) => d.id === selectedId) ?? options[0]
  const dictId = current?.id ?? activeId
  const citation = citationFor(word, dictId)
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  const copyButton = useRef<HTMLButtonElement>(null)
  const [phase, setPhase] = useState<Phase>("idle")
  const text = useRef<HTMLParagraphElement>(null)
  const timer = useRef(0)
  useEffect(() => {
    window.clearTimeout(timer.current)
    setPhase("idle")
  }, [citation])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => setSelectedId(activeId), [activeId, word])
  useEffect(() => {
    if (!open) return
    copyButton.current?.focus()
    const onDown = (e: PointerEvent) => {
      const n = e.target as Node
      if (!panel.current?.contains(n) && !trigger.current?.contains(n)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])
  if (!citation || !current) return null

  function onSourcesKey(e: ReactKeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (options.findIndex((d) => d.id === dictId) + step + options.length) % options.length
    setSelectedId(options[next]!.id)
    ;(e.currentTarget.children[next] as HTMLElement).focus()
  }

  async function copy() {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(citation!)
      track("citation_copy", { dictionary: dictId })
      setPhase("copied")
      timer.current = window.setTimeout(() => setPhase("idle"), 2400)
    } catch {
      // No clipboard access: select the text so one more keystroke copies it.
      if (text.current) window.getSelection()?.selectAllChildren(text.current)
      setPhase("selected")
    }
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label="Citar"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) setSelectedId(activeId)
          setOpen(!open)
        }}
        className={`focus-soft flex items-center justify-center rounded-full border bg-white hover:border-ink active:scale-[0.96] transition-[border-color,scale] duration-200 ${open ? "border-ink" : "border-hairline"}`}
        style={{ width: 40, height: 40 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-ink" aria-hidden="true">
          <path d="M6.6 3.2C3.9 4.3 2 6.4 2 9.3c0 2 1.2 3.5 2.9 3.5 1.5 0 2.6-1.1 2.6-2.5S6.5 7.9 5.1 7.9c-.3 0-.6 0-.8.1.3-1.3 1.4-2.4 3-3.2l-.7-1.6Zm7 0C10.9 4.3 9 6.4 9 9.3c0 2 1.2 3.5 2.9 3.5 1.5 0 2.6-1.1 2.6-2.5s-1-2.4-2.4-2.4c-.3 0-.6 0-.8.1.3-1.3 1.4-2.4 3-3.2l-.7-1.6Z" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.section
            ref={panel}
            role="dialog"
            aria-label="Citar em ABNT"
            className="cite-capsule"
            data-phase={phase}
            style={{ "--dict-accent": DICT_ACCENT[dictId], "--focus-color": DICT_ACCENT[dictId] } as CSSProperties}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <div className="cite-capsule__summary">
              <span className="cite-capsule__glyph" aria-hidden="true">
                {GLYPH[phase]}
              </span>
              <span>Citar · ABNT</span>
            </div>
            <div className="cite-capsule__details">
              <div className="cite-capsule__entry">
                <b>{word}</b>
                {options.length === 1 && (
                  <span>
                    <SourceDot id={dictId} />
                    {current.shortName}
                  </span>
                )}
              </div>
              {options.length > 1 && (
                <div className="cite-capsule__sources" role="radiogroup" aria-label="Dicionário da citação" onKeyDown={onSourcesKey}>
                  {options.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      role="radio"
                      aria-checked={d.id === dictId}
                      tabIndex={d.id === dictId ? 0 : -1}
                      onClick={() => setSelectedId(d.id)}
                    >
                      <SourceDot id={d.id} />
                      {d.shortName}
                    </button>
                  ))}
                </div>
              )}
              <p ref={text} className="cite-capsule__text">
                {citation}
              </p>
              {/* Sweeps across once the citation is really on the clipboard. */}
              <div className="cite-capsule__segments" aria-hidden="true">
                {Array.from({ length: SEGMENTS }, (_, i) => (
                  <i key={i} data-on={phase === "copied"} style={{ transitionDelay: phase === "copied" ? `${i * 16}ms` : undefined }} />
                ))}
              </div>
              <div className="cite-capsule__footer">
                <span role="status">{STATUS[phase]}</span>
                <button ref={copyButton} type="button" onClick={copy}>
                  {phase === "copied" ? "Copiar de novo" : "Copiar citação"}
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
