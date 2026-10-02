import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useToast } from "@/components/ui/Toast"
import { PronounceButton } from "@/components/definition/PronounceButton"
import { SaveButton } from "@/components/definition/SaveButton"
import { slideUpStyle } from "@/lib/animation"
import { imgShare } from "@/lib/assets"
import { DICT_COLOR } from "@/lib/data"
import { useFade } from "@/lib/hooks"
import { dictVariants } from "@/lib/pageMotion"
import { WordData } from "@/lib/types"

export function MobileDefinitionPage({
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

  function handleSaveMobile() {
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

  const pageVis = useFade(wordData.word)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveId(wordData.dicts[0].id)
  }, [wordData.word])

  function switchDict(id: string) {
    if (id === activeId) return
    const from = wordData.dicts.findIndex((d) => d.id === activeId)
    const to = wordData.dicts.findIndex((d) => d.id === id)
    setDictDir(to > from ? 1 : -1)
    setActiveId(id)
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const activeEntry =
    wordData.dicts.find((d) => d.id === activeId) ?? wordData.dicts[0]

  return (
    <div
      className="h-[calc(100vh-64px)] bg-paper-warm flex flex-col overflow-hidden"
      style={{
        ...slideUpStyle(pageVis),
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-paper-warm shrink-0">
        <button
          onClick={onBack}
          className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white border border-border active:scale-[0.97] transition-transform"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white border border-border active:scale-[0.97] transition-transform">
            <img src={imgShare} alt="" style={{ width: 16, height: 16 }} />
          </button>
          <SaveButton
            saved={saved}
            onToggle={handleSaveMobile}
            height={38}
            radius="9999px"
            bg="#fff"
            border="var(--color-border)"
          />
        </div>
      </div>

      {/* Word header */}
      <div className="px-5 pb-4 bg-paper-warm shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-['Poppins:ExtraBold'] text-[32px] text-ink leading-tight tracking-[-0.64px]">
              {wordData.word}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['Poppins:Regular'] text-[14px] text-muted">
                /{wordData.phonetic}/
              </span>
              <span className="px-2.5 py-0.5 rounded-sm bg-surface font-['Poppins:Medium'] text-[12px] text-body">
                {wordData.partOfSpeech}
              </span>
            </div>
          </div>
          <PronounceButton
            word={wordData.word}
            variant="circle"
            height={48}
          />
        </div>
      </div>

      {/* Dict switcher pills */}
      <div className="px-5 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {wordData.dicts.map((d) => {
            const c = DICT_COLOR[d.id] ?? "var(--color-ink)"
            const isActive = d.id === activeId
            return (
              <button
                key={d.id}
                onClick={() => switchDict(d.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-['Poppins:SemiBold'] text-[12px] shrink-0 transition-[background-color,color,border-color,scale] duration-150 active:scale-[0.97]"
                style={{
                  background: isActive ? c : "#fff",
                  color: isActive ? "var(--color-on-ink)" : "var(--color-body)",
                  border: isActive ? "none" : "1px solid var(--color-border)",
                }}
              >
                <span
                  className="size-1.5 rounded-full inline-block"
                  style={{ background: isActive ? "rgba(255,255,255,0.6)" : c }}
                />
                {d.shortName}
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-border mx-5 shrink-0" />

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
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
          {/* Mobile macrostructure: simplified single-column layout */}
          <div className="flex flex-col gap-6">
            {/* Source */}
            <span className="font-['Poppins:Regular'] text-[11px] text-muted">
              {activeEntry.tag}
            </span>

            {/* Etymology */}
            {activeEntry.etymology && (
              <div className="flex flex-col gap-2">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-muted">
                  Etimologia
                </span>
                <p className="font-['Poppins:Italic'] italic text-[13px] text-body leading-[1.6] border-l-2 border-rule pl-4">
                  {activeEntry.etymology}
                </p>
              </div>
            )}

            {/* Definitions */}
            <div className="flex flex-col gap-2">
              <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-muted">
                Definição
              </span>
              <div className="flex flex-col gap-4">
                {activeEntry.senses.map((sense) => (
                  <div key={sense.num} className="flex gap-3">
                    <span className="font-['Poppins:Bold'] text-[12px] text-muted shrink-0 w-5 pt-[2px]">
                      {sense.num}.
                    </span>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 items-start">
                        {sense.labels?.map((l) => (
                          <span
                            key={l}
                            className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.5px] border border-border-strong text-muted rounded-xs px-1.5 py-0.5"
                          >
                            {l}
                          </span>
                        ))}
                        <p className="font-['Poppins:Regular'] text-[15px] text-ink leading-[1.65]">
                          {sense.text}
                        </p>
                      </div>
                      {sense.examples && sense.examples.length > 0 && (
                        <div className="border-l-2 border-rule pl-3">
                          <p className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.8px] text-muted mb-1">
                            Exemplo de uso
                          </p>
                          {sense.examples.map((ex, i) => (
                            <p
                              key={i}
                              className="font-['Poppins:Italic'] italic text-[13px] text-muted leading-[1.6]"
                            >
                              {ex}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {activeEntry.notes && activeEntry.notes.length > 0 && (
              <div className="bg-white rounded-md px-4 py-3 flex flex-col gap-1 border border-border">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-muted">
                  Notas
                </span>
                {activeEntry.notes.map((n, i) => (
                  <p
                    key={i}
                    className="font-['Poppins:Regular'] text-[13px] text-body leading-[1.6]"
                  >
                    {n}
                  </p>
                ))}
              </div>
            )}

            {/* Synonyms */}
            {(activeEntry.synonyms?.length || wordData.synonyms.length) > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-muted">
                  Sinônimos
                </span>
                <div className="flex flex-wrap gap-2">
                  {(activeEntry.synonyms?.length
                    ? activeEntry.synonyms
                    : wordData.synonyms
                  ).map((w) => (
                    <button
                      key={w}
                      onClick={() => onSearch(w)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-border font-['Poppins:Regular'] text-[13px] text-ink active:scale-[0.97] transition-transform"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {activeEntry.related && activeEntry.related.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-muted">
                  Relacionadas
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeEntry.related.map((w) => (
                    <button
                      key={w}
                      onClick={() => onSearch(w)}
                      className="px-3.5 py-1.5 rounded-xl bg-surface font-['Poppins:Regular'] text-[13px] text-ink active:scale-[0.97] transition-transform"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Facts */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border pb-6">
              <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-muted">
                Sobre a palavra
              </span>
              <div className="grid grid-cols-2 gap-3">
                {wordData.facts
                  .filter((f) => f.label !== "Separação Silábica")
                  .map((f) => (
                  <div
                    key={f.label}
                    className="bg-white rounded-md p-3.5 border border-border"
                  >
                    <span className="font-['Poppins:Regular'] text-[9px] uppercase tracking-[0.6px] text-muted block mb-1">
                      {f.label}
                    </span>
                    <span className="font-['Poppins:SemiBold'] text-[13px] text-ink">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
