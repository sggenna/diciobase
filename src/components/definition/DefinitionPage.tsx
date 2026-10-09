import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useToast } from "@/components/ui/Toast"
import { DictEntryView } from "@/components/definition/DictEntryView"
import { PronounceButton } from "@/components/definition/PronounceButton"
import { SaveButton } from "@/components/definition/SaveButton"
import { imgShare } from "@/lib/assets"
import { DICT_COLOR } from "@/lib/data"
import { dictVariants } from "@/lib/pageMotion"
import { WordData } from "@/lib/types"

export function DefinitionPage({
  wordData,
  onSearch,
  onBack,
  isLoggedIn,
  onOpenAuth,
}: {
  wordData: WordData
  onSearch: (w: string) => void
  onBack: () => void
  isLoggedIn?: boolean
  onOpenAuth?: (then?: () => void) => void
}) {
  const [activeId, setActiveId] = useState(wordData.dicts[0].id)
  const [dictDir, setDictDir] = useState(1)
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  function notifySaved(next: boolean) {
    if (next) {
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
            setSaved(true)
            notifySaved(true)
          },
        },
      })
    }
  }

  function handleSave() {
    if (!isLoggedIn) {
      onOpenAuth?.(() => {
        setSaved(true)
        notifySaved(true)
      })
      return
    }
    const next = !saved
    setSaved(next)
    notifySaved(next)
  }


  useEffect(() => {
    setActiveId(wordData.dicts[0].id)
  }, [wordData.word])

  function switchDict(id: string) {
    if (id === activeId) return
    const from = wordData.dicts.findIndex((d) => d.id === activeId)
    const to = wordData.dicts.findIndex((d) => d.id === id)
    setDictDir(to > from ? 1 : -1)
    setActiveId(id)
  }

  const activeEntry =
    wordData.dicts.find((d) => d.id === activeId) ?? wordData.dicts[0]
  const facts = wordData.facts.filter((f) => f.label !== "Separação Silábica")

  return (
    <div
      className="min-h-screen bg-surface"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-5 md:pt-10 pb-28 md:pb-[72px]">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-0.5 -ml-1 mb-4 h-9 pr-3 text-ink active:opacity-60 transition-opacity"
          style={{ fontSize: 16 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Voltar
        </button>
        <div className="relative flex items-start justify-between gap-4 md:gap-6 mb-8 md:mb-10">
          <div>
            <span className="text-muted" style={{ fontSize: 15 }}>
              {wordData.partOfSpeech}
            </span>
            <h1
              className="text-ink"
              style={{
                fontSize: "clamp(40px, 12vw, 56px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                marginTop: 4,
              }}
            >
              {wordData.word}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-muted" style={{ fontSize: 15 }}>
                {wordData.phonetic}
              </span>
              <PronounceButton word={wordData.word} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SaveButton
              saved={saved}
              onToggle={handleSave}
              showLabel={false}
              height={44}
              radius="9999px"
            />
            <button
              className="flex items-center justify-center rounded-full border border-border-strong hover:border-ink transition-colors duration-200"
              style={{ width: 44, height: 44 }}
            >
              <img src={imgShare} alt="" className="size-[16px]" />
            </button>
          </div>
        </div>

        <div className="grid gap-10 md:gap-12 md:grid-cols-[1fr_220px]">
          <div className="min-w-0 scroll-mt-24">
            <div
              role="tablist"
              aria-label="Fonte do dicionário"
              className="flex gap-6 md:gap-7 border-b border-border mb-6 md:mb-8 overflow-x-auto no-scrollbar"
            >
              {wordData.dicts.map((d) => {
                const c = DICT_COLOR[d.id] ?? "var(--color-ink)"
                const isActive = d.id === activeId
                return (
                  <button
                    key={d.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => switchDict(d.id)}
                    className="relative shrink-0 flex items-center gap-2 pb-3 transition-colors duration-200"
                    style={{
                      fontSize: 15,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--color-ink)" : "var(--color-muted)",
                    }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: c }}
                    />
                    {d.shortName}
                    {isActive && (
                      <motion.span
                        layoutId="dict-underline"
                        className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full"
                        style={{ background: c }}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="overflow-x-clip">
              <AnimatePresence mode="wait" initial={false} custom={dictDir}>
                <motion.div
                  key={activeId}
                  custom={dictDir}
                  variants={dictVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <DictEntryView entry={activeEntry} onSearch={onSearch} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <aside>
            <h2
              className="text-muted uppercase mb-4"
              style={{ fontSize: 13, letterSpacing: "0.04em" }}
            >
              Sobre a palavra
            </h2>
            <dl className="border-t border-border-strong">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col gap-0.5 py-3 border-b border-border"
                >
                  <dt className="text-muted" style={{ fontSize: 12 }}>
                    {f.label}
                  </dt>
                  <dd
                    className="text-ink font-semibold"
                    style={{ fontSize: 15 }}
                  >
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {wordData.synonyms.length > 0 && (
          <div className="mt-8 md:mt-10 pt-8 border-t border-border">
            <h2
              className="text-muted uppercase mb-4"
              style={{ fontSize: 13, letterSpacing: "0.04em" }}
            >
              Sinônimos
            </h2>
            <div className="flex flex-wrap gap-2">
              {wordData.synonyms.map((w) => (
                <button
                  key={w}
                  onClick={() => onSearch(w)}
                  className="rounded-full bg-surface text-ink hover:bg-ink hover:text-on-ink transition-colors duration-200"
                  style={{ fontSize: 14, padding: "8px 16px" }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
