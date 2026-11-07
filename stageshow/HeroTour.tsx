import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react'
import { CitationCapsule } from '@/components/definition/CitationCapsule'
import { SyllableLine } from '@/components/definition/DefinitionPage'
import { DictEntryView, EntryEtymology, EntryRemissoes, WordChip } from '@/components/definition/DictEntryView'
import { DictTabs } from '@/components/definition/DictTabs'
import { ModeToggle } from '@/components/definition/ModeToggle'
import { PronounceButton } from '@/components/definition/PronounceButton'
import { SaveButton } from '@/components/definition/SaveButton'
import { SequenceStrip } from '@/components/definition/SequenceStrip'
import { Part, StructureProvider } from '@/components/definition/structure'
import { Headline } from '@/components/home/HomePage'
import { OrbitField } from '@/components/home/OrbitField'
import { AppNav } from '@/components/layout/AppNav'
import { Footer } from '@/components/layout/Footer'
import { InfoTip } from '@/components/ui/Tips'
import { resolveAnatomy } from '@/lib/anatomy'
import { imgShare } from '@/lib/assets'
import { DICT_ACCENT, DICT_COLOR, DICT_META, SUGGESTIONS } from '@/lib/data'
import { HERO_WORDS } from '@/lib/heroWords'
import { entryParts } from '@/lib/microstructure'
import { buildPresence } from '@/lib/senseMatch'
import type { WordData } from '@/lib/types'
import { Stage } from './kit/stage'
import { Camera } from './kit/motion/Camera'
import type { Act } from './kit/act'
import type { Rect } from './kit/measure'
import { NOSTALGIA, SAUDADE } from './saudade'
import './HeroTour.css'

// The case study's cover: a tour of the product's best flows on its real screens, where the homepage card tells one
// story. The orbit home slows as you focus its search; a word's entry changes with each dictionary; the dots show
// where dictionaries agree; a synonym's word glides up into its own entry. The screens are the app's own components.

type Screen = 'home' | 'saudade' | 'nostalgia'

type S = {
  screen: Screen
  q: string
  focused: boolean
  dict: string
  tip: boolean
  focus: Rect | null
  /** The next word's entry is mounted, so its tab counts tick over from this word's. */
  next: boolean
  /** Where the synonym's word was when it was clicked. */
  from: Rect | null
}

const initial: S = { screen: 'home', q: '', focused: false, dict: 'wikcionario', tip: false, focus: null, next: false, from: null }
// Reduced motion: one still that says the most, an entry and its dictionaries agreeing on a meaning.
const POSTER: S = { ...initial, screen: 'saudade', tip: true }

// A true desktop window, the size the orbit is solved for: much smaller and no arrangement of its cards fits.
const SIZE = { w: 1440, h: 900, compact: { below: 600, width: 358, height: 720 } }
// No panel: the screen fills the stage and the page behind it shows at its corners.
const GUTTER = { wide: 0, compact: 0 }
const HEADWORD = { wide: 72, compact: 48 }
const REST = { wide: { x: 960, y: 680 }, compact: { x: 250, y: 560 } }
const CHIP_FONT = 14

const WORD = 'saudade'
const RHYTHM = [120, 95, 130, 190, 90, 110, 150]
const TAB = (id: string) => ({ at: `tab-${id}`, x: 0.86, y: 0.78 })

const script = async (a: Act<S>) => {
  const wide = a.layout === 'wide'
  const gutter = GUTTER[a.layout]

  // 1. The orbit drifts; focusing the search slows it and sends the cards back
  await a.wait(1050)
  await a.move({ at: 'field', x: 0.72, y: 0.62 }, { duration: 700 })
  await a.wait(60)
  await a.click()
  await a.set({ focused: true })
  await a.wait(300)
  for (let i = 0; i < WORD.length; i++) {
    await a.set({ q: WORD.slice(0, i + 1) })
    await a.wait(RHYTHM[i]!)
  }
  await a.wait(200)
  a.mark('entry')
  await a.set({ screen: 'saudade' })
  await a.wait(700)

  // 2. One word, each dictionary's own entry. Each one's senses are its own, and the counts say so.
  await a.move(TAB('dicionario-aberto'), { duration: 520 })
  await a.wait(60)
  await a.click()
  await a.set({ dict: 'dicionario-aberto' })
  a.mark('dicts')
  await a.wait(780)
  if (wide) {
    await a.move(TAB('wordnet'), { duration: 440 })
    await a.wait(60)
    await a.click()
    await a.set({ dict: 'wordnet' })
    await a.wait(780)
    // OpenWordnet shares no meaning here, so back to the one whose dots are the story
    await a.move(TAB('wikcionario'), { duration: 520 })
    await a.wait(60)
    await a.click()
    await a.set({ dict: 'wikcionario' })
    await a.wait(260)
  } else {
    await a.wait(200)
  }

  // 3. Where dictionaries agree: in close, because the mark is eight pixels
  if (wide) {
    const dot = a.rect('dots', { layout: true })
    const frame = SIZE.w - gutter * 2
    const width = 1056
    const height = (width * (SIZE.h - gutter * 2)) / frame
    // The whole column, so the push-in crops nothing that is being read
    await a.set({ focus: { x: (frame - width) / 2, y: dot.y - gutter - height / 2, width, height } })
    a.mark('zoom')
    // The camera has to stop first: the dot is where the cursor aims when it sets off
    await a.wait(950)
  }
  await a.move({ at: 'dots', x: 0.5, y: 0.5 }, { duration: 340 })
  await a.set({ tip: true })
  a.mark('dots')
  await a.wait(1050)
  await a.set({ tip: false, focus: null })

  if (wide) {
    await a.wait(480)
    await a.move({ at: 'chip', x: 0.82, y: 0.62 }, { duration: 620 })
    await a.wait(60)
    await a.click()
    // The next entry mounts unseen, is measured, then rises out of the chip
    await a.set({ next: true, from: a.rect('chip-word') })
    await a.wait(40)
    a.mark('glide')
    await a.set({ screen: 'nostalgia' })
    // 4. Hold on where the word led
    await a.wait(1450)
  } else {
    await a.wait(700)
  }

  a.mark('home')
  void a.move('rest', { duration: 800 })
  await a.set({ screen: 'home', focused: false, q: '' })
  await a.wait(860)
  await a.snap({ ...initial })
  await a.wait(100)
}

export function HeroTour({ className = '' }: { className?: string }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Demonstração do Diciobase: na página inicial, a palavra saudade é buscada; o verbete muda com cada dicionário, os pontos mostram onde os dicionários concordam e o sinônimo nostalgia abre o próprio verbete."
    >
      <MotionConfig reducedMotion="user">
        <Stage<S>
          width={SIZE.w}
          height={SIZE.h}
          compact={SIZE.compact}
          initial={initial}
          poster={POSTER}
          script={script}
          play="loop"
          fill
          cursor={{ at: REST, idle: false }}
          className="dbt"
        >
          {(s, rect, layout) => <Scene s={s} rect={rect} layout={layout} />}
        </Stage>
      </MotionConfig>
    </div>
  )
}

const noop = () => {}

function Scene({ s, rect, layout }: { s: S; rect: (name: string) => Rect; layout: 'wide' | 'compact' }) {
  const head = rect('nostalgia-head')
  const from = s.from
  const flown =
    from && head.height
      ? `translate(${from.x - head.x}px, ${from.y + from.height / 2 - (head.y + head.height / 2)}px) scale(${CHIP_FONT / HEADWORD[layout]})`
      : undefined
  return (
    <div className="dbt-panel" data-screen={s.screen} style={{ '--gutter': `${GUTTER[layout]}px`, '--headword': `${HEADWORD[layout]}px` } as CSSProperties}>
      <div className="dbt-sheet" inert>
        <div className="dbt-nav">
          <AppNav onHome={noop} onFavorites={noop} onProfile={noop} onSearch={noop} searchValue="" onSearchChange={noop} />
        </div>
        <Home q={s.q} focused={s.focused} wide={layout === 'wide'} covered={s.screen !== 'home'} />
        <Camera focus={s.focus} pad={0} max={1.34} feather={0} duration={s.focus ? 900 : 1000} ease={[0.45, 0, 0.1, 1]}>
          <EntryScreen word={SAUDADE} name="saudade" on={s.screen === 'saudade'} dict={s.dict} tip={s.tip} layout={layout} />
          {s.next && <EntryScreen word={NOSTALGIA} name="nostalgia" on={s.screen === 'nostalgia'} dict="wikcionario" layout={layout} flown={s.screen === 'nostalgia' ? 'none' : flown} />}
        </Camera>
        {/* Pushed in, the crop dissolves into the page's white */}
        <span className="dbt-soft" data-on={s.focus ? true : undefined} />
      </div>
      <span data-target="rest" style={{ position: 'absolute', left: REST[layout].x, top: REST[layout].y }} />
    </div>
  )
}

/** HomePage's markup, with the app's turning headline and its orbit; the query belongs to the stage. */
export function Home({ q, focused, wide, covered, insetTop = wide ? 52 : 0 }: { q: string; focused: boolean; wide: boolean; covered: boolean; insetTop?: number }) {
  const hero = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  useEffect(() => {
    if (covered) return
    const turn = window.setInterval(() => setIndex((i) => (i + 1) % HERO_WORDS.length), 2800)
    return () => window.clearInterval(turn)
  }, [covered])
  useEffect(() => {
    const word = HERO_WORDS[index]!
    let n = 0
    setTyped('')
    const typing = window.setInterval(() => {
      setTyped(word.slice(0, ++n))
      if (n >= word.length) window.clearInterval(typing)
    }, 55)
    return () => window.clearInterval(typing)
  }, [index])

  return (
    <div ref={hero} className="home-hero dbt-home" data-covered={covered || undefined} style={{ fontFamily: 'var(--font-sf)' }}>
      <main className="home-hero__center">
        <Headline index={index} />
        <div data-orbit-obstacle="busca" className="hero-search">
          <div className="hero-search__field" data-target="field" data-cursor="ibeam" data-focused={focused || undefined}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="var(--color-muted)" strokeWidth="1.1" strokeLinecap="round" className="shrink-0" aria-hidden="true">
              <circle cx="7" cy="7" r="4.75" />
              <path d="M10.5 10.5l3.25 3.25" />
            </svg>
            <div className="relative flex items-center flex-1 min-w-0 h-full ml-4">
              <span className="dbt-typed">
                {q}
                {focused && <i className="dbt-caret" />}
              </span>
              {!q && (
                <span aria-hidden="true" className="hero-search__placeholder">
                  Pesquise <em>{typed}</em>
                </span>
              )}
            </div>
            {wide && (
              <kbd aria-hidden="true" className="flex shrink-0 items-center h-7 px-2 rounded-sm border border-hairline text-meta" style={{ fontFamily: 'var(--font-sf)', fontSize: 13, fontWeight: 500 }}>
                ⌘K
              </kbd>
            )}
          </div>
          <span className="hero-orb">
            <span className="hero-orb__dots" aria-hidden="true">
              <i style={{ background: DICT_COLOR.wikcionario, left: 7, top: 0 }} />
              <i style={{ background: DICT_COLOR['dicionario-aberto'], left: 0, top: 12 }} />
              <i style={{ background: DICT_COLOR.wordnet, left: 14, top: 12 }} />
            </span>
          </span>
        </div>
        <div data-orbit-obstacle="sugestões" className="hero-chips">
          <span className="text-muted" style={{ fontSize: 13, lineHeight: '20px' }}>
            Experimente
          </span>
          {SUGGESTIONS.map((w) => (
            <button key={w} className="h-9 px-4 rounded-full bg-white border border-hairline text-ink" style={{ fontSize: 14, fontWeight: 500, lineHeight: '20px' }}>
              {w}
            </button>
          ))}
        </div>
      </main>
      <OrbitField container={hero} focused={focused} onOpen={noop} insetTop={insetTop} paused={covered} />
      <div className="relative z-10">
        <Footer compact />
      </div>
    </div>
  )
}

const plain = (w: string) => w.toLowerCase()

/** DefinitionPage's page, with its state in the stage's hands. The app's components don't name their parts, so they get their targets here. */
function EntryScreen({ word, name, on, dict, tip, layout, flown }: { word: WordData; name: string; on: boolean; dict: string; tip?: boolean; layout: 'wide' | 'compact'; flown?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const group = useId()
  const entry = word.dicts.find((d) => d.id === dict) ?? word.dicts[0]!
  const wide = layout === 'wide'
  const parts = useMemo(() => entryParts(entry), [entry])
  const anatomy = useMemo(() => resolveAnatomy(word), [word])
  const presence = useMemo(() => buildPresence(word.dicts), [word])
  const names = useMemo(() => Object.fromEntries(word.dicts.map((d) => [d.id, d.shortName])), [word])
  const own = new Set([...(entry.synonyms ?? []), ...(entry.related ?? [])].map(plain))
  const others = word.synonyms.filter((w) => !own.has(plain(w)))
  const sourceOf = (w: string) => word.dicts.find((d) => d.synonyms?.includes(w) || d.related?.includes(w))?.id ?? 'wordnet'
  const historic = DICT_META[entry.id]?.historic

  useEffect(() => {
    if (name !== 'saudade') return
    const el = root.current!
    const tag = () => {
      const put = (target: string, node: Element | null | undefined) => {
        el.querySelectorAll(`[data-target="${target}"]`).forEach((n) => n !== node && n.removeAttribute('data-target'))
        if (node && node.getAttribute('data-target') !== target) node.setAttribute('data-target', target)
      }
      el.querySelectorAll('[role="tab"]').forEach((tab, i) => {
        const id = word.dicts[i]?.id
        if (tab.getAttribute('data-target') !== `tab-${id}`) tab.setAttribute('data-target', `tab-${id}`)
        tab.setAttribute('data-cursor', 'pointer')
      })
      put('dots', el.querySelector('[role="img"][aria-label^="Também em"]'))
      const chip = [...el.querySelectorAll('.dbt-aside button')].find((b) => b.textContent?.trim() === 'nostalgia')
      put('chip', chip)
      put('chip-word', chip?.lastElementChild)
    }
    tag()
    const watch = new MutationObserver(tag)
    watch.observe(el, { childList: true, subtree: true })
    return () => watch.disconnect()
  }, [name, word])

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  return (
    <LayoutGroup id={group}>
      <StructureProvider value={{ mode: 'leitura', hot: null, setHot: noop }}>
        <div ref={root} className="dict-scope dbt-entry" data-on={on || undefined} data-name={name} data-tip-on={tip || undefined} style={{ fontFamily: 'var(--font-sf)', '--dict-accent': DICT_ACCENT[entry.id] } as CSSProperties}>
          <div className="dbt-column">
            <header className="dbt-header">
              <Part kind="cabeca">
                <div className="flex items-end justify-between gap-4">
                  <div className="dbt-headword-box" data-target={`${name}-head`}>
                    <h1 data-headword className="dbt-headword text-ink" style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, transform: flown }}>
                      {word.word}
                    </h1>
                  </div>
                  <div className="relative flex items-center gap-2 shrink-0 pb-2">
                    <SaveButton saved={false} onToggle={noop} showLabel={false} height={40} radius="9999px" bg="#ffffff" border="var(--color-hairline)" />
                    {wide && <CitationCapsule word={word.word} dicts={word.dicts} activeId={entry.id} />}
                    <span className="flex items-center justify-center rounded-full border bg-white border-hairline" style={{ width: 40, height: 40 }}>
                      <img src={imgShare} alt="" className="size-[16px]" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-4 text-meta" style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: '24px' }}>
                  {wide && <span className="whitespace-nowrap">{word.phonetic}</span>}
                  <span className="inline-flex self-center mr-2">
                    <PronounceButton word={word.word} variant="inline" />
                  </span>
                  {anatomy && <SyllableLine syllables={anatomy.syllables} stress={anatomy.stress} />}
                  {anatomy?.stressKind && <span>{anatomy.stressKind}</span>}
                  {wide && <span>plural {word.facts[0]!.value}</span>}
                  {wide && (
                    <span className="self-center inline-flex" style={{ fontFamily: 'var(--font-sf)' }}>
                      <InfoTip term="Calculado" />
                    </span>
                  )}
                </div>
              </Part>
              <Part kind="classe" title="Classe gramatical" className="w-fit">
                <span className="block italic text-meta" style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: '24px' }}>
                  {word.partOfSpeech}
                </span>
              </Part>
            </header>

            <div className="dbt-controls">
              <div className="dbt-tabs">
                <DictTabs dicts={word.dicts} activeId={entry.id} onSelect={noop} tip />
              </div>
              <div className="dbt-mode">
                <ModeToggle mode="leitura" onChange={noop} />
              </div>
            </div>

            <div className="dbt-body">
              <div className="min-w-0">
                <SequenceStrip parts={parts} dictName={entry.shortName} hot={null} onHot={noop} onPick={noop} />
                <div className="relative">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={entry.id} {...fade}>
                      <DictEntryView entry={entry} onSearch={noop} presence={presence} names={names} omit={wide ? ['etimologia'] : undefined} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              {wide && (
                <aside className="dbt-aside flex flex-col gap-8">
                  {entry.etymology && (
                    <section key={`etym-${entry.id}`} className="pt-4 border-t border-hairline flex flex-col gap-4">
                      <EntryEtymology entry={entry} />
                    </section>
                  )}
                  {own.size > 0 && (
                    <section key={entry.id} className="pt-4 border-t border-hairline flex flex-col gap-4">
                      <EntryRemissoes entry={entry} onSearch={noop} />
                    </section>
                  )}
                  {others.length > 0 && (
                    <section className="pt-4 border-t border-hairline flex flex-col gap-4">
                      <h2 className="sec-label">Sinônimos em outras bases</h2>
                      <div className="flex flex-wrap gap-2">
                        {others.map((w) => (
                          <WordChip key={w} word={w} source={sourceOf(w)} onSearch={noop} />
                        ))}
                      </div>
                    </section>
                  )}
                  {historic && (
                    <section className="pt-4 border-t border-hairline flex flex-col gap-4">
                      <h2 className="sec-label">Fonte</h2>
                      <p className="text-ink" style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: '27px' }}>
                        Texto de 1913, na grafia original
                      </p>
                    </section>
                  )}
                </aside>
              )}
            </div>
          </div>
        </div>
      </StructureProvider>
    </LayoutGroup>
  )
}
