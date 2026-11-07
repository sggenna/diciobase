import type { CSSProperties } from 'react'
import { Stage } from './kit/stage'
import { Bar, Window } from './kit/window'
import { Follow } from './kit/motion/Follow'
import type { Act } from './kit/act'
import type { Rect } from './kit/measure'
import './WordDemo.css'

// Diciobase: one word, every open dictionary. The word page for "saudade"
// switches from Wikcionário to Dicionário Aberto in place, the mark beside a
// sense says which other dictionary carries it, then OpenWordnet, then back
// to where it began. Senses and matches are the live API's for this word.

type Dict = 'wikcionario' | 'dicionario-aberto' | 'wordnet'
type S = { dict: Dict; tip: boolean }

const DICTS: { id: Dict; name: string; mark: string; accent: string }[] = [
  { id: 'wikcionario', name: 'Wikcionário', mark: 'W', accent: '#5E4592' },
  { id: 'dicionario-aberto', name: 'Dicionário Aberto', mark: 'A', accent: '#296C67' },
  { id: 'wordnet', name: 'OpenWordnet', mark: 'O', accent: '#5B5B60' },
]
const byId = Object.fromEntries(DICTS.map((d) => [d.id, d])) as Record<Dict, (typeof DICTS)[number]>

type Sense = { num: string; text: string; label?: string; also: Dict[] }

// GET /api/words/saudade, first senses of each tab; "also" is the app's own sense matching (src/lib/senseMatch.ts).
const ENTRIES: Record<Dict, Sense[]> = {
  wikcionario: [
    { num: '1', text: 'memória ou recordação grata de pessoas, familiares ou objetos', label: 'Substantivo feminino', also: [] },
    { num: '2', text: 'sentimento experimentado entre duas ou mais pessoas que estão distantes', label: 'Sentimento', also: [] },
  ],
  'dicionario-aberto': [
    {
      num: '1',
      text: 'Lembrança triste e suave de pessôas ou coisas distantes ou extintas, acompanhada do desejo de as tornar a possuir ou vêr presentes.',
      label: 'Substantivo feminino',
      also: ['wikcionario'],
    },
    { num: '2', text: 'Pesar, pela ausência de alguém que nos é querido.', also: [] },
  ],
  wordnet: [
    { num: '1', text: 'desejo (ou necessidade) não realizado e prolongado', label: 'Substantivo', also: [] },
    { num: '2', text: 'anseio por algo passado', label: 'Substantivo', also: [] },
  ],
}

const initial: S = { dict: 'wikcionario', tip: false }
const POSTER: S = { dict: 'dicionario-aberto', tip: true }
const REST = { wide: { x: 570, y: 178 }, compact: { x: 236, y: 150 } }

async function script(a: Act<S>) {
  await a.wait(800)

  // Another dictionary, same page
  await a.move({ at: 'tab-dicionario-aberto', x: 0.8, y: 0.82 })
  await a.wait(150)
  await a.click()
  await a.set({ dict: 'dicionario-aberto' })
  await a.wait(1400)

  // Which others carry this sense
  await a.move({ at: 'dots', x: 0.5, y: 0.7 })
  await a.set({ tip: true })
  a.mark('tip')
  await a.wait(2600)
  await a.set({ tip: false })

  // A third (only two tabs fit on a phone, so the story skips it there)
  if (a.layout === 'wide') {
    await a.move({ at: 'tab-wordnet', x: 0.8, y: 0.82 })
    await a.wait(150)
    await a.click()
    await a.set({ dict: 'wordnet' })
    await a.wait(1900)
  }

  // Back to the first: the click is the reset
  await a.move({ at: 'tab-wikcionario', x: 0.8, y: 0.82 })
  await a.wait(150)
  await a.click()
  await a.set({ dict: 'wikcionario' })
  await a.move('rest')
  await a.wait(500)
}

export default function WordDemo() {
  return (
    <Stage
      width={720}
      height={452}
      compact={{ below: 600, width: 358, height: 358 }}
      initial={initial}
      poster={POSTER}
      script={script}
      greys="cool"
      cursor={{ at: REST }}
      className="dcb"
    >
      {(s, rect, layout) => {
        const wide = layout === 'wide'
        const tab = rect(`tab-${s.dict}`)
        const line: Rect | null = tab.width ? { x: tab.x, y: tab.y + tab.height - 2, width: tab.width, height: 2 } : null
        return (
          <>
            <Window url="diciobase.com.br/saudade" urlShape="pill" className="dcb-window">
              <div className="dcb-page" style={{ '--dict-accent': byId[s.dict].accent } as CSSProperties}>
                <Head wide={wide} />
                <div className="dcb-main">

                  <div className="dcb-controls">
                    <div className="dcb-tabs" role="tablist">
                      {(wide ? DICTS : DICTS.slice(0, 2)).map((d) => (
                        <div
                          key={d.id}
                          className="dcb-tab"
                          data-target={`tab-${d.id}`}
                          data-cursor="pointer"
                          data-active={s.dict === d.id || undefined}
                        >
                          <span className="dcb-mark" style={{ background: d.accent }}>{d.mark}</span>
                          <span className="dcb-tab-label">
                            <span className="dcb-tab-bold" aria-hidden>{d.name}</span>
                            <span className="dcb-tab-text">{d.name}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dcb-heading">
                    Acepções
                    <span className="dcb-historic" data-show={s.dict === 'dicionario-aberto' || undefined}>
                      {wide ? 'Texto de 1913, na grafia original' : '1913, grafia original'}
                    </span>
                  </div>
                  <div className="dcb-entries">
                    {DICTS.map((d) => (
                      <Entry key={d.id} senses={ENTRIES[d.id]} on={s.dict === d.id} tip={s.tip} accent={d.accent} />
                    ))}
                  </div>
                </div>

                {wide && (
                  <aside className="dcb-aside">
                    <div className="dcb-facts">
                      <Bar w={92} h={7} tone={4} />
                      <Bar w={64} h={5} tone={2} style={{ marginTop: 18 }} />
                      <Bar w={84} h={7} tone={3} style={{ marginTop: 9 }} />
                      <Bar w={56} h={5} tone={2} style={{ marginTop: 18 }} />
                      <Bar w={70} h={7} tone={3} style={{ marginTop: 9 }} />
                    </div>
                  </aside>
                )}
              </div>
            </Window>

            <Follow to={line} className="dcb-underline" style={{ background: byId[s.dict].accent }} />
            <span data-target="rest" style={{ position: 'absolute', left: REST[layout].x, top: REST[layout].y }} />
          </>
        )
      }}
    </Stage>
  )
}

function Head({ wide }: { wide: boolean }) {
  return (
    <div className="dcb-head">
      <div className="dcb-cabeca">
        <div className="dcb-word">saudade</div>
        <div className="dcb-sub">
          <span className="dcb-syll">
            sau·<b>da</b>·de
          </span>
          {wide && <span className="dcb-kind">paroxítona</span>}
          {wide && <span className="dcb-computed">calculado</span>}
          {wide && <span className="dcb-ipa">/saw.ˈda.dʒi/</span>}
          <span className="dcb-pronounce" aria-hidden>
            <svg className="dcb-bars" width="18" height="14" viewBox="0 0 18 14">
              {[0.4, 0.75, 0.5, 1, 0.6].map((h, i) => (
                <rect key={i} x={i * 4} y={(14 - h * 14) / 2} width="2" height={h * 14} rx="1" />
              ))}
            </svg>
            {wide && 'Ouvir pronúncia'}
          </span>
        </div>
      </div>
      <div className="dcb-actions">
        <span className="dcb-round dcb-save" aria-hidden>
          <svg width="15" height="15" viewBox="0 0 18 18">
            <path d="M13.8112 2.68935C13.5299 2.40804 13.1483 2.25 12.7504 2.25H5.24957C4.8517 2.25 4.47013 2.40804 4.18879 2.68935C3.90745 2.97066 3.7494 3.35219 3.7494 3.75003V15.0002C3.74944 15.1316 3.78398 15.2606 3.84955 15.3744C3.91512 15.4882 4.00944 15.5828 4.12305 15.6487C4.23666 15.7146 4.3656 15.7496 4.49695 15.75C4.6283 15.7504 4.75747 15.7164 4.87153 15.6512L8.25591 13.7177C8.48254 13.5883 8.73901 13.5202 9 13.5202C9.26099 13.5202 9.51746 13.5883 9.74408 13.7177L13.1285 15.6512C13.2425 15.7164 13.3717 15.7504 13.503 15.75C13.6344 15.7496 13.7633 15.7146 13.8769 15.6487C13.9906 15.5828 14.0849 15.4882 14.1504 15.3744C14.216 15.2606 14.2506 15.1316 14.2506 15.0002V3.75003C14.2506 3.35219 14.0925 2.97066 13.8112 2.68935Z" />
          </svg>
        </span>
        <span className="dcb-round" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path
              d="M6.44238 10.1324L11.5649 13.1177M11.5574 4.88199L6.44238 7.86723M15.75 3.74958C15.75 4.99232 14.7426 5.99976 13.5 5.99976C12.2574 5.99976 11.25 4.99232 11.25 3.74958C11.25 2.50684 12.2574 1.4994 13.5 1.4994C14.7426 1.4994 15.75 2.50684 15.75 3.74958ZM6.75 9C6.75 10.2427 5.74264 11.2502 4.5 11.2502C3.25736 11.2502 2.25 10.2427 2.25 9C2.25 7.75726 3.25736 6.74982 4.5 6.74982C5.74264 6.74982 6.75 7.75726 6.75 9ZM15.75 14.2504C15.75 15.4932 14.7426 16.5006 13.5 16.5006C12.2574 16.5006 11.25 15.4932 11.25 14.2504C11.25 13.0077 12.2574 12.0002 13.5 12.0002C14.7426 12.0002 15.75 13.0077 15.75 14.2504Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </div>
  )
}

function Entry({ senses, on, tip, accent }: { senses: Sense[]; on: boolean; tip: boolean; accent: string }) {
  return (
    <div className="dcb-entry" data-on={on || undefined} aria-hidden={!on} style={{ '--entry-accent': accent } as CSSProperties}>
      {senses.map((sense, i) => (
        <div key={sense.num} className="dcb-sense">
          <span className="dcb-num">{sense.num}</span>
          <div className="dcb-sense-body">
            {sense.label && <span className="dcb-label">{sense.label}</span>}
            <div className="dcb-def">{sense.text}</div>
          </div>
          <span className="dcb-also" data-target={on && i === 0 ? 'dots' : undefined}>
            {sense.also.map((id) => (
              <i key={id} style={{ background: byId[id].accent }}>{byId[id].mark}</i>
            ))}
            {i === 0 && (
              <span className="dcb-tip" data-show={(on && tip) || undefined}>
                Também em: {sense.also.map((id) => byId[id].name).join(', ')}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
