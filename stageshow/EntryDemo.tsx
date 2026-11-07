import { useId, useMemo, type CSSProperties } from 'react'
import { LayoutGroup, MotionConfig } from 'motion/react'
import { CitationCapsule } from '@/components/definition/CitationCapsule'
import { SyllableLine } from '@/components/definition/DefinitionPage'
import { DictEntryView, EntryEtymology, WordChip } from '@/components/definition/DictEntryView'
import { DictTabs } from '@/components/definition/DictTabs'
import { ModeToggle } from '@/components/definition/ModeToggle'
import { PronounceButton } from '@/components/definition/PronounceButton'
import { SaveButton } from '@/components/definition/SaveButton'
import { SequenceStrip } from '@/components/definition/SequenceStrip'
import { Part, StructureProvider, type ViewMode } from '@/components/definition/structure'
import { InfoTip } from '@/components/ui/Tips'
import { resolveAnatomy } from '@/lib/anatomy'
import { imgShare } from '@/lib/assets'
import { DICT_ACCENT, DICT_COLOR } from '@/lib/data'
import { entryParts } from '@/lib/microstructure'
import { buildPresence } from '@/lib/senseMatch'
import { Stage } from './kit/stage'
import { Camera } from './kit/motion/Camera'
import type { Act } from './kit/act'
import type { Rect } from './kit/measure'
import { SAUDADE } from './saudade'
import './EntryDemo.css'

// Diciobase's one idea, in one take: type a word and the search bar becomes its entry; switch to Estrutura and the
// entry shows its anatomy. Everything inside the sheet is the app's own component, with the app's own CSS, in the
// state DefinitionPage would hold it in. The stage only drives that state and supplies the camera.

type S = {
  q: string
  focused: boolean
  /** The sheet is open: the search bar has become the page. */
  open: boolean
  /** The take is over: the sheet dissolves back to the empty search bar. */
  gone: boolean
  mode: ViewMode
  focus: Rect | null
}

const initial: S = { q: '', focused: false, open: false, gone: false, mode: 'leitura', focus: null }
// Reduced motion, and any frame that has to stand alone: the entry, in Estrutura, at rest.
const POSTER: S = { ...initial, open: true, mode: 'estrutura' }

// Each stage's own geometry. Pill sizes are the real .hero-search at its two breakpoints.
export type EntryDemoVariant = 'hero' | 'card'

const GEOMETRY = {
  hero: { w: 1200, h: 820, gutter: 24, pillW: 640, pillH: 80, headword: 72, zoomW: 740, rest: { x: 800, y: 548 } },
  card: { w: 720, h: 405, gutter: 14, pillW: 560, pillH: 80, headword: 56, zoomW: 600, rest: { x: 520, y: 320 } },
  compact: { w: 358, h: 520, gutter: 16, pillW: 326, pillH: 70, headword: 48, zoomW: 318, rest: { x: 240, y: 340 } },
}
const COMPACT_BELOW = { hero: 600, card: 400 }
const SEARCH_FONT = 18

const WORD = 'saudade'
// A person typing a word they know: a quick start, a hitch at the "d" where the hand changes, the last letters landing together.
const RHYTHM = [120, 95, 130, 190, 90, 110, 150]

const TIMING = {
  hero: { lead: 300, toField: 750, focus: 220, type: 1, enter: 300, toToggle: 1250, press: 180, zoom: 1500, hold: 1500, pull: 1400, rest: 550, fade: 800, tail: 250 },
  card: { lead: 200, toField: 520, focus: 140, type: 0.82, enter: 180, toToggle: 900, press: 120, zoom: 1100, hold: 950, pull: 1100, rest: 400, fade: 600, tail: 120 },
}

const take = (variant: EntryDemoVariant) => async (a: Act<S>) => {
  const t = TIMING[variant]
  await a.wait(t.lead)

  await a.move({ at: 'field', x: 0.72, y: 0.62 }, { duration: t.toField })
  await a.wait(80)
  await a.click()
  await a.set({ focused: true })
  await a.wait(t.focus)

  for (let i = 0; i < WORD.length; i++) {
    await a.set({ q: WORD.slice(0, i + 1) })
    await a.wait(RHYTHM[i]! * t.type)
  }
  await a.wait(t.enter)

  // The bar opens into the page, and the hand is already on its way to what it wants there
  a.mark('open')
  await a.set({ open: true })
  await a.move({ at: 'mode', x: 0.9, y: 0.82 }, { duration: t.toToggle })
  await a.wait(t.press)
  await a.click()
  await a.set({ mode: 'estrutura' })

  // The toggle answers at product speed; the camera follows a beat later and carries the labels in with it
  await a.wait(90)
  await a.set({ focus: a.rect('zoom', { layout: true }) })
  a.mark('zoom')
  await a.wait(t.zoom)
  a.mark('estrutura')
  await a.wait(t.hold)

  await a.set({ focus: null })
  await a.wait(t.pull)
  a.mark('full')
  await a.wait(t.rest)

  // What the search bar typed is already cleared under the sheet, so it fades back in empty
  void a.move('rest', { duration: t.fade })
  await a.set({ gone: true, q: '', focused: false })
  await a.wait(t.fade)
  await a.snap({ ...initial })
  await a.wait(t.tail)
}

// The hero loops while on screen. The stage plays a hover script once, so the card keeps looping for as long as the pointer stays on it.
const scripts = {
  hero: take('hero'),
  card: async (a: Act<S>) => {
    for (;;) await take('card')(a)
  },
}

export function EntryDemo({ variant = 'card', className = '' }: { variant?: EntryDemoVariant; className?: string }) {
  const group = useId()
  const wide = GEOMETRY[variant]
  return (
    <div
      className={className}
      role="img"
      aria-label="Demonstração do Diciobase: a palavra saudade é digitada na busca, a barra se abre no verbete e o modo Estrutura marca as partes do verbete."
    >
      <MotionConfig reducedMotion="user">
        {/* The toggle's thumb is a shared layout element: keep it from jumping between two demos on one page */}
        <LayoutGroup id={group}>
          <Stage<S>
            width={wide.w}
            height={wide.h}
            compact={{ below: COMPACT_BELOW[variant], width: GEOMETRY.compact.w, height: GEOMETRY.compact.h }}
            initial={initial}
            poster={POSTER}
            script={scripts[variant]}
            play={variant === 'card' ? 'hover' : 'loop'}
            fill={variant === 'hero'}
            cursor={{ at: { wide: wide.rest, compact: GEOMETRY.compact.rest }, idle: false }}
            className={`dbx dbx--${variant}`}
          >
            {(s, rect, layout) => <Scene s={s} rect={rect} layout={layout} variant={variant} />}
          </Stage>
        </LayoutGroup>
      </MotionConfig>
    </div>
  )
}

const noop = () => {}

function Scene({ s, rect, layout, variant }: { s: S; rect: (name: string) => Rect; layout: 'wide' | 'compact'; variant: EntryDemoVariant }) {
  const g = layout === 'compact' ? GEOMETRY.compact : GEOMETRY[variant]
  const big = variant === 'hero' && layout === 'wide'

  // The sheet is drawn at its final size from the first frame and clipped to the pill exactly: opening it moves an
  // edge, never its text. It runs off the stage's foot, so its bottom edge is the stage's.
  const y = (g.h - g.pillH) / 2
  const x = (g.w - g.pillW) / 2 - g.gutter
  const clipClosed = `inset(${y - g.gutter}px ${x}px ${y}px ${x}px round ${g.pillH / 2}px)`
  const clipOpen = 'inset(0px 0px 0px 0px round 16px 16px 0px 0px)'

  // The headword is the typed word: until the sheet opens the real h1 sits scaled down over the typed text.
  const slot = rect('typed')
  const head = rect('headword')
  const flown = slot.height && head.height
    ? `translate(${slot.x - head.x}px, ${slot.y + slot.height / 2 - (head.y + head.height / 2)}px) scale(${SEARCH_FONT / g.headword})`
    : `scale(${SEARCH_FONT / g.headword})`

  return (
    <div
      className="dbx-panel"
      data-open={s.open || undefined}
      data-gone={s.gone || undefined}
      data-zoomed={s.focus ? true : undefined}
      style={{ '--gutter': `${g.gutter}px`, '--headword': `${g.headword}px`, '--zoom-w': `${g.zoomW}px`, '--zoom-h': `${(g.zoomW * g.h) / g.w}px` } as CSSProperties}
    >
      <Search q={s.q} focused={s.focused} />

      <Camera focus={s.focus} pad={0} max={2} feather={0} duration={s.focus ? TIMING[variant].zoom : TIMING[variant].pull} ease={[0.45, 0, 0.1, 1]}>
        <div className="dbx-sheet" style={{ clipPath: s.open ? clipOpen : clipClosed }}>
          <span className="dbx-zoom" data-target="zoom" />
          <Entry mode={s.mode} flown={s.open ? 'none' : flown} big={big} layout={layout} />
        </div>
      </Camera>

      {/* Pushed in, the crop dissolves into the page's white. A mask would let the panel's black through as a vignette. */}
      <span className="dbx-soft" />
      <span data-target="rest" style={{ position: 'absolute', left: g.rest.x, top: g.rest.y }} />
    </div>
  )
}

/** The home page's search bar: the same classes as HomePage's form, on the demo's near-black. */
function Search({ q, focused }: { q: string; focused: boolean }) {
  return (
    <div className="dbx-search" aria-hidden="true">
      <div className="hero-search">
        <div className="hero-search__field" data-target="field" data-cursor="ibeam" data-focused={focused || undefined}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="var(--color-muted)" strokeWidth="1.1" strokeLinecap="round" className="shrink-0">
            <circle cx="7" cy="7" r="4.75" />
            <path d="M10.5 10.5l3.25 3.25" />
          </svg>
          <div className="dbx-slot" data-target="typed">
            <span className="dbx-typed">
              {q}
              {focused && <i className="dbx-caret" />}
            </span>
            {/* As on the home page, the placeholder stays until the first letter */}
            <span className="hero-search__placeholder dbx-placeholder" data-hidden={q ? true : undefined}>
              Pesquise <em>uma palavra</em>
            </span>
          </div>
          <kbd className="dbx-kbd">⌘K</kbd>
        </div>
        <span className="hero-orb">
          <span className="hero-orb__dots">
            <i style={{ background: DICT_COLOR.wikcionario, left: 7, top: 0 }} />
            <i style={{ background: DICT_COLOR['dicionario-aberto'], left: 0, top: 12 }} />
            <i style={{ background: DICT_COLOR.wordnet, left: 14, top: 12 }} />
          </span>
        </span>
      </div>
    </div>
  )
}

/** DefinitionPage's markup, held at the demo's size rather than the viewport's, with the state in the stage's hands. */
function Entry({ mode, flown, big, layout }: { mode: ViewMode; flown: string; big: boolean; layout: 'wide' | 'compact' }) {
  const word = SAUDADE
  const entry = word.dicts[0]!
  const parts = useMemo(() => entryParts(entry), [entry])
  const anatomy = useMemo(() => resolveAnatomy(word), [word])
  const presence = useMemo(() => buildPresence(word.dicts), [word])
  const names = useMemo(() => Object.fromEntries(word.dicts.map((d) => [d.id, d.shortName])), [word])
  const compact = layout === 'compact'
  const scope = { fontFamily: 'var(--font-sf)', '--dict-accent': DICT_ACCENT[entry.id] } as CSSProperties
  return (
    <StructureProvider value={{ mode, hot: null, setHot: noop }}>
      {/* inert: an illustration, so nothing in it takes the host page's focus or hover */}
      <div className="dict-scope dbx-page" style={scope} inert>
        <header className="dbx-header">
          <Part kind="cabeca" labels={[{ text: 'Cabeça' }]} order={0} labelTop={28}>
            <div className="flex items-end justify-between gap-4">
              <div className="dbx-headword-box" data-target="headword">
                <h1
                  data-headword
                  className="dbx-headword text-ink"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, transform: flown }}
                >
                  {word.word}
                </h1>
              </div>
              <div className="dbx-in relative flex items-center gap-2 shrink-0 pb-2" style={{ '--i': 0 } as CSSProperties}>
                <SaveButton saved={false} onToggle={noop} showLabel={false} height={40} radius="9999px" bg="#ffffff" border="var(--color-hairline)" />
                {!compact && <CitationCapsule word={word.word} dicts={word.dicts} activeId={entry.id} />}
                <span className="flex items-center justify-center rounded-full border bg-white border-hairline" style={{ width: 40, height: 40 }}>
                  <img src={imgShare} alt="" className="size-[16px]" />
                </span>
              </div>
            </div>
            <div className="dbx-in flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-4 text-meta" style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: '24px', '--i': 1 } as CSSProperties}>
              {!compact && <span className="whitespace-nowrap">{word.phonetic}</span>}
              <span className="inline-flex self-center mr-2">
                <PronounceButton word={word.word} variant="inline" />
              </span>
              {anatomy && <SyllableLine syllables={anatomy.syllables} stress={anatomy.stress} />}
              {anatomy?.stressKind && <span>{anatomy.stressKind}</span>}
              {!compact && <span>plural {word.facts[0]!.value}</span>}
              {!compact && (
                <span className="self-center inline-flex" style={{ fontFamily: 'var(--font-sf)' }}>
                  <InfoTip term="Calculado" />
                </span>
              )}
            </div>
          </Part>
          <div className="dbx-in" style={{ '--i': 2 } as CSSProperties}>
            <Part kind="classe" title="Classe gramatical" labels={[{ text: 'Classe' }]} order={1} labelTop={4} className="w-fit">
              <span className="block italic text-meta" style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: '24px' }}>
                {word.partOfSpeech}
              </span>
            </Part>
          </div>
        </header>

        <div className="dbx-controls dbx-in" style={{ '--i': 3 } as CSSProperties}>
          <div className="dbx-tabs">
            <DictTabs dicts={word.dicts} activeId={entry.id} onSelect={noop} tip />
          </div>
          <div className="dbx-mode" data-target="mode" data-cursor="pointer">
            <ModeToggle mode={mode} onChange={noop} />
          </div>
        </div>

        <div className="dbx-body">
          <div className="dbx-main">
            <SequenceStrip parts={parts} dictName={entry.shortName} hot={null} onHot={noop} onPick={noop} />
            <div className="dbx-in" style={{ '--i': 4 } as CSSProperties}>
              <DictEntryView entry={entry} onSearch={noop} presence={presence} names={names} omit={big ? ['etimologia'] : undefined} />
            </div>
          </div>
          {big && (
            <aside className="dbx-aside dbx-in flex flex-col gap-8" style={{ '--i': 5 } as CSSProperties}>
              <section className="pt-4 border-t border-hairline flex flex-col gap-4">
                <EntryEtymology entry={entry} />
              </section>
              <section className="pt-4 border-t border-hairline flex flex-col gap-4">
                <h2 className="sec-label">Sinônimos em outras bases</h2>
                <div className="flex flex-wrap gap-2">
                  {word.synonyms.map((w) => (
                    <WordChip key={w} word={w} source="wordnet" onSearch={noop} />
                  ))}
                </div>
              </section>
            </aside>
          )}
        </div>
      </div>
    </StructureProvider>
  )
}
