import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react"
import { InfoTip } from "@/components/ui/Tips"
import { useSession } from "@/lib/session"
import { useIsWide } from "@/lib/hooks"
import { useToast } from "@/components/ui/Toast"
import { DictEntryView, EntryEtymology, EntryRemissoes, WordChip } from "@/components/definition/DictEntryView"
import { CitationCapsule } from "@/components/definition/CitationCapsule"
import { DictTabs } from "@/components/definition/DictTabs"
import { ModeToggle } from "@/components/definition/ModeToggle"
import { Part, StructureProvider, type ViewMode } from "@/components/definition/structure"
import { PronounceButton, type PronounceSource } from "@/components/definition/PronounceButton"
import { SaveButton } from "@/components/definition/SaveButton"
import { SequenceStrip } from "@/components/definition/SequenceStrip"
import { track } from "@/lib/analytics"
import { imgShare } from "@/lib/assets"
import { shareUrl } from "@/lib/router"
import { shareLink } from "@/lib/share"
import { DICT_ACCENT, DICT_META } from "@/lib/data"
import { resolveAnatomy } from "@/lib/anatomy"
import { entryParts, type PartKind } from "@/lib/microstructure"
import { buildPresence } from "@/lib/senseMatch"
import type { DictEntry, WordData } from "@/lib/types"

const plain = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
const MODE_KEY = "diciobase:entry-mode"

function loadMode(): ViewMode {
  try {
    return localStorage.getItem(MODE_KEY) === "estrutura" ? "estrutura" : "leitura"
  } catch {
    return "leitura"
  }
}

/**
 * The "also in" dots in the right margin of each definition. Preview without
 * them with ?dots=off.
 */
function readDots(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("dots") !== "off"
  } catch {
    return true
  }
}

export function DefinitionPage({
  wordData,
  typed,
  onSearch,
  onBack,
  isLoggedIn,
  onOpenAuth,
}: {
  wordData: WordData
  /** What the person typed, to explain when we showed a differently spelled word. */
  typed?: string
  onSearch: (w: string) => void
  onBack: () => void
  isLoggedIn?: boolean
  onOpenAuth?: (then?: () => void, word?: string) => void
}) {
  const session = useSession()
  // The dictionaries this reader switched off in their profile stay hidden; never all of them.
  const toggles = session.settings?.dicts
  const dicts = useMemo(() => {
    const on = wordData.dicts.filter((d) => toggles?.[d.id as keyof typeof toggles] !== false)
    return on.length ? on : wordData.dicts
  }, [wordData.dicts, toggles])
  const [activeId, setActiveId] = useState(dicts[0]!.id)
  const [mode, setMode] = useState<ViewMode>(loadMode)
  const [hover, setHover] = useState<PartKind | null>(null)
  const [flash, setFlash] = useState<PartKind | null>(null)
  const flashTimer = useRef<number>(0)
  const showDots = useMemo(readDots, [])
  const reduce = useReducedMotion()
  // On desktop the etymology sits in the side column, so the whole entry fits on one screen.
  const wide = useIsWide()
  const saved = session.isSaved(wordData.word)
  const [voice, setVoice] = useState<PronounceSource | null>(null)
  const { toast } = useToast()

  function notifySaved(next: boolean) {
    if (next) {
      track("word_save")
      toast({
        id: `save-${wordData.word}`,
        title: "Palavra salva",
        description: `“${wordData.word}” foi adicionada aos seus Salvos.`,
      })
    } else {
      toast({
        id: `save-${wordData.word}`,
        title: "Removida dos Salvos",
        description: `“${wordData.word}” não está mais na sua lista.`,
        variant: "info",
        action: {
          label: "Desfazer",
          onClick: () => {
            void session.saveWord(wordData.word).then((ok) => ok && notifySaved(true))
          },
        },
      })
    }
  }

  async function handleSave() {
    if (!isLoggedIn) {
      onOpenAuth?.(() => {
        void session.saveWord(wordData.word).then((ok) => ok && notifySaved(true))
      }, wordData.word)
      return
    }
    const ok = saved ? await session.unsaveWord(wordData.word) : await session.saveWord(wordData.word)
    if (ok) notifySaved(!saved)
  }

  async function handleShare() {
    const word = wordData.word
    const url = shareUrl(word)
    const outcome = await shareLink({ title: `${word} · Diciobase`, url })
    if (outcome === "copied") {
      toast({ id: "share", title: "Link copiado", description: `Cole onde quiser para compartilhar “${word}”.` })
    } else if (outcome === "failed") {
      toast({ id: "share", title: "Não foi possível copiar o link", description: url, variant: "info" })
    }
  }

  useEffect(() => {
    setActiveId(dicts[0]!.id)
    track("word_view")
  }, [wordData.word])

  useEffect(() => {
    if (!dicts.some((d) => d.id === activeId)) setActiveId(dicts[0]!.id)
  }, [dicts, activeId])

  useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  function switchDict(id: string) {
    if (id === activeId) return
    track("dictionary_switch", { dictionary: id })
    setActiveId(id)
    setHover(null)
    setFlash(null)
  }

  function changeMode(m: ViewMode) {
    if (m === "estrutura" && m !== mode) track("estrutura_open")
    setMode(m)
    setHover(null)
    try {
      localStorage.setItem(MODE_KEY, m)
    } catch {
      /* ignore */
    }
  }

  const activeEntry: DictEntry = dicts.find((d) => d.id === activeId) ?? dicts[0]!
  const parts = useMemo(() => entryParts(activeEntry), [activeEntry])
  const hot: PartKind | null = hover ?? flash

  const pick = useCallback(
    (k: PartKind) => {
      setFlash(k)
      window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlash(null), 1600)
      const el = document.querySelector<HTMLElement>(`[data-part="${k}"]`)
      el?.scrollIntoView({ block: k === "cabeca" || k === "classe" ? "start" : "center", behavior: reduce ? "auto" : "smooth" })
    },
    [reduce],
  )

  const anatomy = useMemo(() => resolveAnatomy(wordData), [wordData])
  const about = wordData.facts
  const multi = dicts.length > 1
  const presence = useMemo(() => (multi && showDots ? buildPresence(dicts) : undefined), [multi, showDots, dicts])
  const names = useMemo(() => Object.fromEntries(dicts.map((d) => [d.id, d.shortName])), [dicts])
  const spelledDifferently =
    !!typed && typed.normalize("NFC").toLowerCase() !== wordData.word.normalize("NFC").toLowerCase() && plain(typed) === plain(wordData.word)
  // Curated words carry their syllables in `phonetic`; the syllable line replaces it.
  const showPhonetic =
    !!wordData.phonetic && !(anatomy && plain(wordData.phonetic).replace(/[^a-z]/g, "") === plain(wordData.word).replace(/[^a-z]/g, ""))

  const accent = DICT_ACCENT[activeId] ?? "#35593e"
  const scope = { "--dict-accent": accent } as CSSProperties
  const t300 = reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }

  // The plural joins the meta line; only what the head doesn't say stays in the side column.
  const plural = about.find((f) => f.label === "Plural")?.value
  const otherFacts = about.filter((f) => f.label !== "Plural")
  const ownSynonyms = new Set([...(activeEntry.synonyms ?? []), ...(activeEntry.related ?? [])].map((w) => w.toLowerCase()))
  // Synonyms from the other bases, without the ones this dictionary already lists beside them.
  const otherSynonyms = wordData.synonyms.filter((w) => !ownSynonyms.has(w.toLowerCase()))
  const sourceOf = (w: string) => wordData.dicts.find((d) => d.synonyms?.includes(w) || d.related?.includes(w))?.id ?? (wordData.dicts.some((d) => d.id === "wordnet") ? "wordnet" : undefined)
  const hasRemissoes = ownSynonyms.size > 0
  const historic = DICT_META[activeId]?.historic
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: t300 },
    exit: { opacity: 0, transition: reduce ? { duration: 0 } : { duration: 0.2 } },
  }
  const aside = "pt-4 border-t border-hairline flex flex-col gap-4"

  return (
    <MotionConfig reducedMotion="user">
      <StructureProvider value={{ mode, hot, setHot: setHover }}>
        <div className="dict-scope min-h-dvh bg-white" style={{ fontFamily: "var(--font-sf)", ...scope }}>
          <div className="max-w-[1056px] mx-auto px-6 pb-24 md:pb-16">
            {/* Head: one strict hierarchy, the same on every dictionary. */}
            <header className="pt-4 md:pt-16 pb-8">
              <button
                onClick={onBack}
                className="md:hidden flex items-center gap-1 -ml-1 mb-6 h-10 pr-3 text-ink active:opacity-60 transition-opacity"
                style={{ fontSize: 16 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
                Voltar
              </button>
              {spelledDifferently && (
                <p className="mb-8 text-meta" style={{ fontSize: 14, lineHeight: "24px" }} role="status">
                  Mostrando resultados para <span className="font-medium text-ink">{wordData.word}</span>
                </p>
              )}
              <Part kind="cabeca" labels={[{ text: "Cabeça" }]} order={0} labelTop={28} className="max-xl:mt-6">
                <div className="flex items-end justify-between gap-4">
                  <h1
                    data-headword
                    className="text-ink min-w-0 break-words"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(48px, 13vw, 72px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}
                  >
                    {wordData.word}
                  </h1>
                  <div className="relative flex items-center gap-2 shrink-0 pb-2">
                    <span data-tip="def-save" className="inline-flex">
                      <SaveButton saved={saved} onToggle={handleSave} showLabel={false} height={40} radius="9999px" bg="#ffffff" border="var(--color-hairline)" />
                    </span>
                    <CitationCapsule word={wordData.word} dicts={dicts} activeId={activeEntry.id} />
                    <button
                      type="button"
                      aria-label="Compartilhar"
                      onClick={handleShare}
                      className="focus-soft flex items-center justify-center rounded-full border bg-white border-hairline hover:border-ink active:scale-[0.96] transition-[border-color,scale] duration-200"
                      style={{ width: 40, height: 40 }}
                    >
                      <img src={imgShare} alt="" className="size-[16px]" />
                    </button>
                  </div>
                </div>
                {/* The meta line: 16px dark gray, one baseline. */}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-4 text-meta" style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: "24px" }}>
                  {showPhonetic && (
                    <span className="whitespace-nowrap" title={wordData.phoneticSource ? `Pronúncia registrada: ${wordData.phoneticSource}` : undefined}>
                      {wordData.phonetic}
                    </span>
                  )}
                  <span data-tip="def-pronounce" className="inline-flex self-center mr-2">
                    <PronounceButton word={wordData.word} variant="inline" onSource={setVoice} />
                  </span>
                  {anatomy && <SyllableLine syllables={anatomy.syllables} stress={anatomy.stress} />}
                  {anatomy?.stressKind && <span>{anatomy.stressKind}</span>}
                  {plural && <span>plural {plural}</span>}
                  {anatomy?.computed && (
                    <span className="self-center inline-flex" style={{ fontFamily: "var(--font-sf)" }}>
                      <InfoTip term="Calculado" />
                    </span>
                  )}
                </div>
                {voice && <VoiceCredit source={voice} />}
              </Part>
              <Part kind="classe" title="Classe gramatical" labels={[{ text: "Classe" }]} order={1} labelTop={4} className="w-fit">
                <span className="block italic text-meta" style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: "24px" }}>
                  {wordData.partOfSpeech}
                </span>
              </Part>
            </header>

            {/* One row of controls: the dictionaries lead, the mode sits at the right edge. Stays in view under the nav, so long entries can switch dictionary from anywhere. */}
            <div className="sticky top-0 md:top-[53px] z-30 bg-white -mx-6 px-6 md:mx-0 md:px-0 border-b border-hairline">
              <div className="flex flex-col md:flex-row md:items-center md:gap-6 md:h-12">
                <div className="h-12 md:h-full md:flex-1 md:min-w-0 max-md:border-b max-md:border-hairline">
                  <DictTabs dicts={dicts} activeId={activeId} onSelect={switchDict} tip={multi} />
                </div>
                <div className="py-2 md:py-0 shrink-0 md:ml-auto">
                  <ModeToggle mode={mode} onChange={changeMode} />
                </div>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-[minmax(0,552px)_320px] lg:justify-between lg:items-start">
              <div className="min-w-0">
                <SequenceStrip parts={parts} dictName={activeEntry.shortName} hot={hot} onHot={setHover} onPick={pick} />
                {historic && !wide && (
                  <p className="mb-6 text-meta" style={{ fontSize: 14, lineHeight: "20px" }}>
                    Texto de 1913, na grafia original.
                  </p>
                )}
                <div className="relative">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={activeId} {...fade}>
                      <DictEntryView entry={activeEntry} onSearch={onSearch} presence={presence} names={names} omit={wide ? ["etimologia"] : undefined} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* The side column earns its place: it stays in view, every section opens with the same label. */}
              <aside className="mt-12 lg:mt-[72px] lg:sticky lg:top-[118px] flex flex-col gap-8">
                {wide && activeEntry.etymology && (
                  <section key={`etym-${activeId}`} className={aside}>
                    <EntryEtymology entry={activeEntry} />
                  </section>
                )}

                {otherFacts.length > 0 && (
                  <section data-tip="def-facts" className={aside}>
                    {otherFacts.map((f) => (
                      <div key={f.label} className="flex flex-col gap-2">
                        <span className="sec-label info-host flex items-center gap-2 w-fit">
                          {f.label}
                          <InfoTip term={f.label} />
                        </span>
                        <span className="text-ink" style={{ fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: "27px" }}>
                          {f.value}
                        </span>
                      </div>
                    ))}
                  </section>
                )}

                {hasRemissoes && (
                  <section key={activeId} className={aside}>
                    <EntryRemissoes entry={activeEntry} onSearch={onSearch} />
                  </section>
                )}

                {otherSynonyms.length > 0 && (
                  <section className={aside}>
                    <h2 className="sec-label">Sinônimos em outras bases</h2>
                    <div className="flex flex-wrap gap-2">
                      {otherSynonyms.map((w) => (
                        <WordChip key={w} word={w} source={sourceOf(w)} onSearch={onSearch} />
                      ))}
                    </div>
                  </section>
                )}

                {historic && wide && (
                  <section className={aside}>
                    <h2 className="sec-label">Fonte</h2>
                    <p className="text-ink" style={{ fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: "27px" }}>
                      Texto de 1913, na grafia original
                    </p>
                  </section>
                )}
              </aside>
            </div>
          </div>
        </div>
      </StructureProvider>
    </MotionConfig>
  )
}

/** Who is speaking: the name and licence are what these recordings ask in return, and a synthetic voice says it is one. */
function VoiceCredit({ source }: { source: PronounceSource }) {
  const style = { fontFamily: "var(--font-sf)", fontSize: 12, lineHeight: "18px" }
  if (source.kind === "synthetic") {
    return (
      <p className="pt-1 text-muted" style={style}>
        Voz sintetizada do seu dispositivo. Ainda não há gravação desta palavra.
      </p>
    )
  }
  const { speaker, region, license, page } = source.recording
  return (
    <p className="pt-1 text-muted" style={style}>
      <a href={page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink transition-colors">
        {["Gravação", speaker && `de ${speaker}`].filter(Boolean).join(" ")}
      </a>
      {[region, license, "Wikimedia Commons"].filter(Boolean).map((part) => ` · ${part}`).join("")}
    </p>
  )
}

/** ter·re·no, with the stressed syllable bold and underlined: plain inline text, so letters keep their natural spacing. */
function SyllableLine({ syllables, stress }: { syllables: string[]; stress?: number }) {
  const label = `Separação silábica: ${syllables.join("-")}${stress !== undefined ? `. Sílaba tônica: ${syllables[stress]}` : ""}`
  return (
    <span aria-label={label} role="text">
      {syllables.map((s, i) => (
        <span key={i} aria-hidden="true">
          {i > 0 && "·"}
          {i === stress ? (
            <span className="text-ink" style={{ fontWeight: 600, textDecoration: "underline", textDecorationThickness: 1, textUnderlineOffset: 3 }}>
              {s}
            </span>
          ) : (
            s
          )}
        </span>
      ))}
    </span>
  )
}
