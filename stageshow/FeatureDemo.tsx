import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
import { LayoutGroup, MotionConfig } from 'motion/react'
import { AuthModal } from '@/components/auth/AuthModal'
import { DictEntryView } from '@/components/definition/DictEntryView'
import { DictTabs } from '@/components/definition/DictTabs'
import { SaveButton } from '@/components/definition/SaveButton'
import { SequenceStrip } from '@/components/definition/SequenceStrip'
import { Part, StructureProvider, type ViewMode } from '@/components/definition/structure'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { DICT_ACCENT, DICT_COLOR } from '@/lib/data'
import { entryParts } from '@/lib/microstructure'
import { buildPresence } from '@/lib/senseMatch'
import type { DictEntry } from '@/lib/types'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Home } from './HeroTour'
import { SAUDADE } from './saudade'
import { SERTAO_DICTS } from './sertao'
import logo from '../public/assets/69911.svg?inline'
import './HeroTour.css'
import './FeatureDemo.css'

// The case study's feature visuals, each cropped to one feature. They use the app's components with real entries,
// except the two "before" states, which rebuild screens the app has since replaced.

const noop = () => {}
const names = Object.fromEntries(SAUDADE.dicts.map((d) => [d.id, d.shortName]))

/** The app's components don't name their parts, so the stage's cursor gets its targets from the page. */
function useTargets(dicts: DictEntry[]) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const tag = () => {
      el.querySelectorAll('[role="tab"]').forEach((tab, i) => {
        const id = dicts[i]?.id
        if (tab.getAttribute('data-target') !== `tab-${id}`) tab.setAttribute('data-target', `tab-${id}`)
        tab.setAttribute('data-cursor', 'pointer')
      })
      const dots = el.querySelector('[role="img"][aria-label^="Também em"]')
      if (dots && dots.getAttribute('data-target') !== 'dots') dots.setAttribute('data-target', 'dots')
    }
    tag()
    const watch = new MutationObserver(tag)
    watch.observe(el, { childList: true, subtree: true })
    return () => watch.disconnect()
  }, [dicts])
  return root
}

function Scope({ children, id = 'wikcionario', mode = 'leitura' }: { children: ReactNode; id?: string; mode?: ViewMode }) {
  return (
    <StructureProvider value={{ mode, hot: null, setHot: noop }}>
      <div className="dict-scope dbf-page" inert style={{ fontFamily: 'var(--font-sf)', '--dict-accent': DICT_ACCENT[id] } as CSSProperties}>
        {children}
      </div>
    </StructureProvider>
  )
}

const tab = (id: string) => ({ at: `tab-${id}`, x: 0.86, y: 0.78 })
const clickTab = async <S extends { dict: string }>(a: Act<S>, id: string, hold: number) => {
  await a.move(tab(id), { duration: 560 })
  await a.wait(60)
  await a.click()
  await a.set({ dict: id } as Partial<S>)
  await a.wait(hold)
}

/* ---- Search: accents don't matter ---- */

type Q = { q: string; focused: boolean }
const SAO = ['são', 'são-gonçalense', 'são-tomeense', 'são-joanense', 'são-joseense', 'São Paulo']

function Search() {
  const script = async (a: Act<Q>) => {
    await a.wait(700)
    await a.move({ at: 'field', x: 0.72, y: 0.62 }, { duration: 700 })
    await a.wait(60)
    await a.click()
    await a.set({ focused: true })
    await a.wait(350)
    for (const [i, q] of ['s', 'sa', 'sao'].entries()) {
      await a.set({ q })
      await a.wait([170, 140, 200][i]!)
    }
    a.mark('list')
    await a.wait(2800)
    void a.move('rest', { duration: 600 })
    await a.set({ q: '', focused: false })
    await a.wait(800)
  }
  return (
    <Stage<Q> width={760} height={460} initial={{ q: '', focused: false }} poster={{ q: 'sao', focused: true }} script={script} play="loop" cursor={{ at: { x: 560, y: 240 }, idle: false }} className="dbf">
      {(s) => (
        <div className="dbf-scene dbf-search">
          <div className="hero-search">
            <div className="hero-search__field" data-target="field" data-cursor="ibeam" data-focused={s.focused || undefined}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="var(--color-muted)" strokeWidth="1.1" strokeLinecap="round" className="shrink-0" aria-hidden="true">
                <circle cx="7" cy="7" r="4.75" />
                <path d="M10.5 10.5l3.25 3.25" />
              </svg>
              <div className="relative flex items-center flex-1 min-w-0 h-full ml-4">
                <span className="dbt-typed">
                  {s.q}
                  {s.focused && <i className="dbt-caret" />}
                </span>
                {!s.q && (
                  <span aria-hidden="true" className="hero-search__placeholder">
                    Pesquise <em>uma palavra</em>
                  </span>
                )}
              </div>
            </div>
            <span className="hero-orb">
              <span className="hero-orb__dots" aria-hidden="true">
                <i style={{ background: DICT_COLOR.wikcionario, left: 7, top: 0 }} />
                <i style={{ background: DICT_COLOR['dicionario-aberto'], left: 0, top: 12 }} />
                <i style={{ background: DICT_COLOR.wordnet, left: 14, top: 12 }} />
              </span>
            </span>
            {/* The markup useSuggest renders, with the list the static data really returns for "sao" */}
            <ul className="dbf-list absolute left-0 right-0 top-full mt-2 z-30 overflow-hidden rounded-lg bg-white py-2 text-left" data-on={s.q === 'sao' || undefined} style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.12)' }}>
              <li className="px-4 pt-2 pb-2 text-muted" style={{ fontSize: 12.5 }}>
                Mostrando resultados para <span className="text-ink font-medium">são</span>
              </li>
              {SAO.map((w, i) => (
                <li key={w} className="px-4 py-3 text-ink" style={{ fontSize: 15, background: i === 0 ? 'var(--color-surface)' : 'transparent' }}>
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <span data-target="rest" style={{ position: 'absolute', left: 560, top: 240 }} />
        </div>
      )}
    </Stage>
  )
}

/* ---- Tabs and counts ---- */

type T = { dict: string }

function TabsPanel({ dicts, dict, presence }: { dicts: DictEntry[]; dict: string; presence: Map<string, string[]> }) {
  const root = useTargets(dicts)
  const entry = dicts.find((d) => d.id === dict)!
  return (
    <LayoutGroup>
      <Scope id={dict}>
        <div ref={root}>
          <div className="dbf-tabs">
            <DictTabs dicts={dicts} activeId={dict} onSelect={noop} />
          </div>
          <div className="dbf-body" key={dict}>
            <DictEntryView entry={entry} onSearch={noop} presence={presence} names={names} omit={['etimologia']} />
          </div>
        </div>
      </Scope>
    </LayoutGroup>
  )
}

function Tabs() {
  const presence = useMemo(() => buildPresence(SAUDADE.dicts), [])
  const script = async (a: Act<T>) => {
    await a.wait(900)
    await clickTab(a, 'dicionario-aberto', 1500)
    await clickTab(a, 'wordnet', 1500)
    await clickTab(a, 'wikcionario', 900)
    await a.move('rest', { duration: 500 })
    await a.wait(300)
  }
  return (
    <Stage<T> width={760} height={380} initial={{ dict: 'wikcionario' }} poster={{ dict: 'dicionario-aberto' }} script={script} play="loop" cursor={{ at: { x: 610, y: 150 }, idle: false }} className="dbf dbf--fade">
      {(s) => (
        <div className="dbf-scene">
          <TabsPanel dicts={SAUDADE.dicts} dict={s.dict} presence={presence} />
          <span data-target="rest" style={{ position: 'absolute', left: 610, top: 150 }} />
        </div>
      )}
    </Stage>
  )
}

/* ---- One meaning and who shares it ---- */

type D = { tip: boolean }

function Dots() {
  const presence = useMemo(() => buildPresence(SAUDADE.dicts), [])
  const entry = useMemo(() => {
    const w = SAUDADE.dicts[0]!
    return { ...w, etymology: undefined, senses: [w.senses[3]!] }
  }, [])
  const root = useTargets([])
  const script = async (a: Act<D>) => {
    await a.wait(900)
    await a.move({ at: 'dots', x: 0.5, y: 0.5 }, { duration: 760 })
    await a.set({ tip: true })
    await a.wait(2600)
    await a.set({ tip: false })
    await a.move('rest', { duration: 620 })
    await a.wait(500)
  }
  return (
    <Stage<D> width={760} height={220} initial={{ tip: false }} poster={{ tip: true }} script={script} play="loop" cursor={{ at: { x: 470, y: 188 }, idle: false }} className="dbf">
      {(s) => (
        <div className="dbf-scene">
          <Scope>
            <div ref={root} className="dbf-dots" data-tip-on={s.tip || undefined}>
              <DictEntryView entry={entry} onSearch={noop} presence={presence} names={names} />
            </div>
          </Scope>
          <span data-target="rest" style={{ position: 'absolute', left: 470, top: 188 }} />
        </div>
      )}
    </Stage>
  )
}

/* ---- Estrutura: before and after ---- */

const senses = SAUDADE.dicts[0]!.senses

/** The first Estrutura, rebuilt: there is no copy of it in the repo. Every part highlighted in the text, in its color. */
function EstruturaBefore() {
  const mark = (part: string, children: ReactNode) => (
    <mark className="dbf-mark" style={{ '--part': `var(--c-${part})` } as CSSProperties}>
      {children}
    </mark>
  )
  return (
    <Stage width={720} height={470} className="dbf">
      {() => (
        <div className="dbf-scene dbf-before">
          <div className="dict-scope" style={{ fontFamily: 'var(--font-serif)' }}>
            <div className="dbf-word">{mark('cabeca', 'saudade')}</div>
            <p className="dbf-class">{mark('classe', <i>substantivo feminino</i>)}</p>
            <p className="dbf-sense">
              {mark('acepcoes', '1')} {mark('acepcoes', senses[0]!.text)}
            </p>
            <p className="dbf-sense">
              {mark('acepcoes', '2')} {mark('rubricas', 'SENTIMENTO')} {mark('acepcoes', senses[1]!.text)}
            </p>
            <p className="dbf-sense">
              {mark('acepcoes', '5')} {mark('acepcoes', senses[4]!.text)}
            </p>
            <p className="dbf-sense">{mark('exemplos', <i>{senses[4]!.examples![0]}</i>)}</p>
          </div>
        </div>
      )}
    </Stage>
  )
}

function EstruturaAfter() {
  const entry = SAUDADE.dicts[0]!
  const parts = useMemo(() => entryParts(entry), [entry])
  const crop = useMemo(() => ({ ...entry, etymology: undefined, senses: entry.senses.slice(0, 3) }), [entry])
  const presence = useMemo(() => buildPresence(SAUDADE.dicts), [])
  return (
    <Stage width={720} height={470} className="dbf">
      {() => (
        <div className="dbf-scene dbf-after">
          <Scope mode="estrutura">
            <Part kind="cabeca" labels={[{ text: 'Cabeça' }]} order={0} labelTop={16}>
              <div className="dbf-word" style={{ fontFamily: 'var(--font-serif)' }}>
                saudade
              </div>
            </Part>
            <div className="dbf-classe">
              <Part kind="classe" labels={[{ text: 'Classe' }]} order={1} labelTop={4} className="w-fit">
                <span className="block italic text-meta" style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: '24px' }}>
                  substantivo feminino
                </span>
              </Part>
            </div>
            <SequenceStrip parts={parts} dictName={entry.shortName} hot={null} onHot={noop} onPick={noop} />
            <DictEntryView entry={crop} onSearch={noop} presence={presence} names={names} />
          </Scope>
        </div>
      )}
    </Stage>
  )
}

/* ---- Não consta ---- */

function Missing() {
  const presence = useMemo(() => buildPresence(SERTAO_DICTS), [])
  const script = async (a: Act<T>) => {
    await a.wait(1000)
    await clickTab(a, 'wordnet', 2800)
    await clickTab(a, 'wikcionario', 1100)
    await a.move('rest', { duration: 500 })
    await a.wait(300)
  }
  return (
    <Stage<T> width={760} height={300} initial={{ dict: 'wikcionario' }} poster={{ dict: 'wordnet' }} script={script} play="loop" cursor={{ at: { x: 610, y: 130 }, idle: false }} className="dbf dbf--fade">
      {(s) => (
        <div className="dbf-scene">
          <TabsPanel dicts={SERTAO_DICTS} dict={s.dict} presence={presence} />
          <span data-target="rest" style={{ position: 'absolute', left: 610, top: 130 }} />
        </div>
      )}
    </Stage>
  )
}

/* ---- Sign-up: before and after ---- */

function MiniEntry({ saved }: { saved: boolean }) {
  const entry = SAUDADE.dicts[0]!
  const presence = useMemo(() => buildPresence(SAUDADE.dicts), [])
  return (
    <LayoutGroup>
      <Scope>
        <div className="dbf-mini">
          <div className="flex items-end justify-between gap-4">
            <div className="dbf-word" style={{ fontFamily: 'var(--font-serif)' }}>
              saudade
            </div>
            <span className="inline-flex pb-2" data-target="save" data-cursor="pointer">
              <SaveButton saved={saved} onToggle={noop} showLabel={false} height={40} radius="9999px" bg="#ffffff" border="var(--color-hairline)" />
            </span>
          </div>
          <div className="dbf-tabs dbf-tabs--mini">
            <DictTabs dicts={SAUDADE.dicts} activeId="wikcionario" onSelect={noop} />
          </div>
          <div className="dbf-body">
            <DictEntryView entry={{ ...entry, etymology: undefined }} onSearch={noop} presence={presence} names={names} />
          </div>
        </div>
      </Scope>
    </LayoutGroup>
  )
}

/** The separate page saving used to send you to, from git (420c47d, MobileAuthPage): the word is gone, and the page is all there is. */
function OldSignupPage() {
  const field = 'w-full h-[52px] px-4 flex items-center rounded-md border border-border bg-white text-[15px] text-muted'
  return (
    <div className="dbf-oldpage bg-paper-warm" style={{ fontFamily: "'Poppins:Regular', var(--font-sf)" }}>
      <div className="flex flex-col items-center gap-3 mb-8">
        <img src={logo} alt="" style={{ height: 40, width: 'auto' }} />
        <p className="text-[14px] text-muted text-center" style={{ lineHeight: 1.5, maxWidth: 240 }}>
          O seu dicionário português, sempre ao seu alcance.
        </p>
      </div>
      <div className="bg-surface rounded-lg p-[4px] flex mb-6">
        <span className="flex-1 h-[44px] flex items-center justify-center rounded-md text-[15px] text-muted" style={{ fontFamily: "'Poppins:SemiBold'" }}>
          Entrar
        </span>
        <span className="flex-1 h-[44px] flex items-center justify-center rounded-md text-[15px] text-ink bg-white" style={{ fontFamily: "'Poppins:SemiBold'", boxShadow: 'var(--shadow-sm)' }}>
          Criar conta
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <span className={field}>nome@exemplo.com</span>
        <span className={field}>Seu nome</span>
        <span className={field}>••••••••••••</span>
      </div>
      <div className="w-full h-[54px] mt-6 flex items-center justify-center bg-ink rounded-lg text-[16px] text-on-ink" style={{ fontFamily: "'Poppins:SemiBold'" }}>
        Criar conta
      </div>
    </div>
  )
}

type U = { page: boolean }

function SignupBefore() {
  const script = async (a: Act<U>) => {
    await a.wait(1100)
    await a.move({ at: 'save', x: 0.72, y: 0.7 }, { duration: 760 })
    await a.wait(80)
    await a.click()
    // No transition: it was a different page
    await a.snap({ page: true })
    await a.move('rest', { duration: 500 })
    await a.wait(3000)
    await a.snap({ page: false })
    await a.wait(200)
  }
  return (
    <Stage<U> width={760} height={600} initial={{ page: false }} poster={{ page: true }} script={script} play="loop" cursor={{ at: { x: 620, y: 300 }, idle: false }} className="dbf dbf--fade">
      {(s) => (
        <div className="dbf-scene">
          <MiniEntry saved={false} />
          {s.page && <OldSignupPage />}
          <span data-target="rest" style={{ position: 'absolute', left: 620, top: 300 }} />
        </div>
      )}
    </Stage>
  )
}

type M = { modal: boolean; saved: boolean }

const type = async (a: Act<M>, selector: string, text: string, gap = 42) => {
  const input = document.querySelector<HTMLInputElement>(selector)
  if (!input) return
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  input.focus()
  for (let i = 1; i <= text.length; i++) {
    set.call(input, text.slice(0, i))
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await a.wait(gap)
  }
}

function SignupAfter() {
  const say = useRef<(saved: boolean) => void>(noop)
  const script = async (a: Act<M>) => {
    await a.wait(900)
    await a.move({ at: 'save', x: 0.72, y: 0.7 }, { duration: 720 })
    await a.wait(70)
    await a.click()
    await a.set({ modal: true })
    await a.wait(650)
    await type(a, 'input[autocomplete="name"], .dbf-scene form input[type="text"]', 'Marina')
    await type(a, '.dbf-scene form input[type="email"]', 'marina@ufba.br')
    await type(a, '.dbf-scene form input[type="password"]', 'dicionarios')
    document.querySelector('.dbf-scene form button[type="submit"]')?.setAttribute('data-target', 'submit')
    await a.move({ at: 'submit', x: 0.7, y: 0.65 }, { duration: 500 })
    await a.wait(70)
    await a.click()
    // The word saves the moment you're done, and you never left it
    await a.set({ modal: false, saved: true })
    say.current(true)
    await a.move('rest', { duration: 600 })
    await a.wait(2000)
    await a.set({ saved: false })
    await a.wait(300)
  }
  return (
    <ToastProvider>
      <Stage<M> width={760} height={600} initial={{ modal: false, saved: false }} poster={{ modal: true, saved: false }} script={script} play="loop" cursor={{ at: { x: 620, y: 300 }, idle: false }} className="dbf dbf--fade dbf--modal">
        {(s) => (
          <div className="dbf-scene">
            <Saved say={say} />
            <MiniEntry saved={s.saved} />
            {s.modal && <AuthModal defaultMode="signup" word="saudade" onSubmit={() => Promise.resolve()} onClose={noop} />}
            <span data-target="rest" style={{ position: 'absolute', left: 620, top: 300 }} />
          </div>
        )}
      </Stage>
    </ToastProvider>
  )
}

function Saved({ say }: { say: { current: (saved: boolean) => void } }) {
  const { toast } = useToast()
  say.current = () => toast({ id: 'save-saudade', title: 'Palavra salva', description: '“saudade” foi adicionada aos seus Salvos.' })
  return null
}

/* ---- The orbit home ---- */

type O = { focused: boolean }

function Orbit() {
  const script = async (a: Act<O>) => {
    await a.wait(2600)
    await a.move({ at: 'field', x: 0.72, y: 0.62 }, { duration: 800 })
    await a.wait(70)
    await a.click()
    await a.set({ focused: true })
    await a.wait(2800)
    void a.move('rest', { duration: 800 })
    await a.set({ focused: false })
    await a.wait(900)
  }
  return (
    <Stage<O> width={1440} height={900} initial={{ focused: false }} poster={{ focused: false }} script={script} play="loop" cursor={{ at: { x: 980, y: 660 }, idle: false }} className="dbt">
      {(s) => (
        <div className="dbt-panel" data-screen="home" style={{ '--gutter': '0px', '--headword': '72px' } as CSSProperties}>
          <div className="dbt-sheet" inert>
            <Home q="" focused={s.focused} wide covered={false} insetTop={0} />
          </div>
          <span data-target="rest" style={{ position: 'absolute', left: 980, top: 660 }} />
        </div>
      )}
    </Stage>
  )
}

const SCENES: Record<string, () => ReactNode> = {
  search: Search,
  tabs: Tabs,
  dots: Dots,
  'estrutura-before': EstruturaBefore,
  'estrutura-after': EstruturaAfter,
  missing: Missing,
  'signup-before': SignupBefore,
  'signup-after': SignupAfter,
  orbit: Orbit,
}

export function FeatureDemo({ feature }: { feature: string }) {
  const Scene = SCENES[feature]
  if (!Scene) return null
  return (
    <MotionConfig reducedMotion="user">
      <Scene />
    </MotionConfig>
  )
}
