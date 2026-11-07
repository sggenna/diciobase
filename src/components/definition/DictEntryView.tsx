import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { Part } from "@/components/definition/structure"
import { SourceDot, SourceDots } from "@/components/definition/SourceDots"
import { WordPreview } from "@/components/definition/WordPreview"
import { InfoTip } from "@/components/ui/Tips"
import { LABEL_HELP } from "@/lib/tips"
import { bodyOrder } from "@/lib/microstructure"
import { glideWord } from "@/lib/wordGlide"
import { prefetchWord } from "@/lib/words"
import { DictEntry } from "@/lib/types"

// Tiers: 17/27 definitions, 16/26 examples, 13 sense numbers, 11 labels.
// Definitions stop at about 65 characters a line; every sense shares one grid:
// a 32px number slot, the 480px text column, a 40px slot for the "Também em" dot.
const text = { fontFamily: "var(--font-serif)" } as const
const definition = { ...text, fontSize: 17, lineHeight: "27px" } as const
const example = { ...text, fontSize: 16, lineHeight: "26px", color: "var(--color-meta)" } as const

export function DictEntryView({
  entry,
  onSearch: _onSearch,
  presence,
  names,
  omit,
}: {
  entry: DictEntry
  onSearch: (w: string) => void
  /** Parts rendered elsewhere (the side column on desktop), so they never appear twice. */
  omit?: string[]
  /** `${dictId}|${senseNum}` -> dictionaries that carry that sense. Omit for single-dictionary words. */
  presence?: Map<string, string[]>
  names?: Record<string, string>
}) {
  // The interface speaking, not the dictionary, so it isn't in serif.
  if (entry.missing) {
    return (
      <p className="text-meta" style={{ fontSize: 16, lineHeight: "24px" }}>
        Não consta no {entry.shortName}
      </p>
    )
  }

  const blocks: Record<string, ReactNode> = {}
  // Dots point at the *other* dictionaries that carry a sense; the current one is implied.
  const othersFor = (num: string) => presence?.get(`${entry.id}|${num}`)?.filter((id) => id !== entry.id) ?? []
  const firstExample = entry.senses.findIndex((s) => s.examples && s.examples.length > 0)
  const firstRubric = entry.senses.findIndex((s) => s.labels && s.labels.length > 0)

  if (entry.etymology) blocks.etimologia = <EntryEtymology entry={entry} order={entry.senses.length + 4} />

  if (entry.senses.length > 0) {
    blocks.acepcoes = (
      <div className="flex flex-col gap-6">
        {entry.senses.map((sense, i) => {
          const others = names ? othersFor(sense.num) : []
          const rubrics = sense.labels ?? []
          const hasExamples = !!sense.examples?.length
          const labels = [
            ...(i === 0 ? [{ text: "Acepção" }] : []),
            ...(rubrics.length > 0 ? [{ text: "Rubrica", kind: "rubricas" as const }] : []),
          ]
          return (
            <div key={sense.num} className="flex flex-col gap-2 max-xl:[&:has(.ex)]:gap-5">
              <Part kind="acepcoes" title={`Acepção ${sense.num}`} labels={labels} order={i + 2} className="flex items-start">
                <span
                  id={`${entry.id}-sentido-${sense.num}`}
                  className="shrink-0 w-6 sm:w-8 tabular-nums"
                  style={{ fontSize: 13, fontWeight: 500, lineHeight: "27px", color: "var(--dict-accent)" }}
                >
                  {sense.num}
                </span>
                <div className="flex-1 sm:flex-none sm:w-[480px] min-w-0">
                  <p className="text-ink" style={definition}>
                    {rubrics.map((l, r) => (
                      <span key={l.text} {...(i === firstRubric && r === 0 ? { "data-part": "rubricas" } : {})} className="inline-flex align-baseline mr-2 scroll-mt-24">
                        {/* A spelled-out abbreviation keeps the dictionary's own form one tap away. */}
                        <InfoTip
                          title={l.text}
                          body={[LABEL_HELP[l.text], l.original && `No original: “${l.original}”`].filter(Boolean).join(" ") || undefined}
                          className="rounded-sm"
                        >
                          <span className="rubric">{l.text}</span>
                        </InfoTip>
                      </span>
                    ))}
                    {sense.text}
                  </p>
                </div>
                <span className="shrink-0 flex items-center justify-end w-6 sm:w-10 h-[27px]">
                  {names && others.length > 0 && <SourceDots ids={others} names={names} />}
                </span>
              </Part>

              {sense.subsenses && (
                <div className="flex flex-col gap-2 pl-6 sm:pl-8">
                  {sense.subsenses.map((sub) => (
                    <div key={sub.num} className="flex gap-3 sm:w-[480px]">
                      <span className="shrink-0 tabular-nums" style={{ fontSize: 13, fontWeight: 500, lineHeight: "26px", color: "var(--dict-accent)" }}>
                        {sub.num}
                      </span>
                      <p className="text-meta" style={{ ...text, fontSize: 16, lineHeight: "26px" }}>
                        {sub.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {hasExamples &&
                sense.examples!.map((ex, e) => (
                  <div key={e} className="ex pl-6 sm:pl-8">
                    <Part
                      kind="exemplos"
                      title="Exemplo"
                      labels={i === firstExample && e === 0 ? [{ text: "Exemplo" }] : undefined}
                      order={i + 3}
                      className="sm:w-[480px]"
                    >
                      <p className={`italic ${ex.startsWith("“") ? "ex-hang" : ""}`} style={example}>
                        {ex}
                      </p>
                    </Part>
                  </div>
                ))}
            </div>
          )
        })}
      </div>
    )
  }

  if (entry.notes && entry.notes.length > 0) {
    blocks.notas = (
      <Part kind="notas" labels={[{ text: "Notas" }]} order={entry.senses.length + 5} className="flex flex-col gap-2 sm:w-[512px]">
        <span className="sec-label info-host flex items-center gap-2 w-fit">
          Notas
          <InfoTip term="Notas" />
        </span>
        {entry.notes.map((n, i) => (
          <p key={i} className="text-meta" style={{ ...text, fontSize: 16, lineHeight: "26px" }}>
            {n}
          </p>
        ))}
      </Part>
    )
  }

  // One column, read top to bottom in the dictionary's own order. Cross-references (remissões) are consulted,
  // not read, so they live in the side column (EntryRemissoes).
  return (
    <div className="flex flex-col gap-8">
      {bodyOrder(entry).map((k) => (blocks[k] && !omit?.includes(k) ? <div key={k}>{blocks[k]}</div> : null))}
    </div>
  )
}

export function EntryEtymology({ entry, order = 8 }: { entry: DictEntry; order?: number }) {
  return (
    <Part kind="etimologia" order={order} className="flex flex-col gap-2">
      <span id={`${entry.id}-etimologia`} tabIndex={-1} className="sec-label info-host flex items-center gap-2 w-fit outline-none">
        Etimologia
        <InfoTip term="Etimologia" />
      </span>
      <p className="italic text-ink" style={definition}>
        {entry.etymology}
      </p>
    </Part>
  )
}

/** This dictionary's own synonyms and related entries, for the side column. */
export function EntryRemissoes({ entry, onSearch }: { entry: DictEntry; onSearch: (w: string) => void }) {
  const groups = [
    { id: "sinonimos", label: "Sinônimos neste dicionário", words: entry.synonyms ?? [] },
    { id: "relacionadas", label: "Relacionadas", words: entry.related ?? [] },
  ].filter((g) => g.words.length)
  if (!groups.length) return null
  return (
    <Part kind="remissoes" interactive order={entry.senses.length + 6} className="flex flex-col gap-8">
      {groups.map((g) => (
        <div key={g.id} id={`${entry.id}-${g.id}`} tabIndex={-1} className="flex flex-col gap-4 outline-none">
          <span className="sec-label info-host flex items-center gap-2 w-fit">
            {g.label}
            <InfoTip term={g.label} />
          </span>
          <div className="flex flex-wrap gap-2">
            {g.words.map((w) => (
              <WordChip key={w} word={w} source={entry.id} onSearch={onSearch} />
            ))}
          </div>
        </div>
      ))}
    </Part>
  )
}

/** A synonym: a real button that opens its own entry. The source dot turns into an arrow on hover, in the same slot. */
export function WordChip({ word, source, onSearch }: { word: string; source?: string; onSearch: (w: string) => void }) {
  const label = useRef<HTMLSpanElement>(null)
  const timer = useRef(0)
  const previewId = useId()
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const close = () => {
    window.clearTimeout(timer.current)
    setAnchor(null)
  }
  useEffect(() => {
    if (!anchor) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("scroll", close, { passive: true, capture: true })
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("scroll", close, { capture: true })
      window.removeEventListener("keydown", onKey)
    }
  }, [anchor])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <>
    {anchor && <WordPreview id={previewId} word={word} source={source} anchor={anchor} />}
    <button
      onClick={() => {
        close()
        if (label.current) glideWord(word, label.current)
        onSearch(word)
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return
        const box = e.currentTarget
        prefetchWord(word)
        timer.current = window.setTimeout(() => setAnchor(box.getBoundingClientRect()), 220)
      }}
      onPointerLeave={close}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) setAnchor(e.currentTarget.getBoundingClientRect())
      }}
      onBlur={close}
      aria-describedby={anchor ? previewId : undefined}
      className="group focus-soft inline-flex items-center gap-2 h-10 px-4 rounded-full border border-hairline text-ink hover:border-ink active:scale-[0.97] transition-[border-color,scale] duration-200"
      style={{ fontSize: 14, lineHeight: "20px" }}
    >
      <span className="relative flex items-center justify-center size-3 shrink-0" aria-hidden="true">
        <span className="transition-opacity duration-150 group-hover:opacity-0 flex">{source ? <SourceDot id={source} /> : <span className="size-2 rounded-full bg-faint" />}</span>
        <svg className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-150" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6h8M10 6 6.5 2.5M10 6 6.5 9.5" />
        </svg>
      </span>
      <span ref={label}>{word}</span>
    </button>
    </>
  )
}
