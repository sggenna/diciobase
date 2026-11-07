import { useState } from "react"
import type * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { useToast } from "@/components/ui/Toast"
import { Footer } from "@/components/layout/Footer"
import { FAV_FILTERS, FAV_SORTS, FavFilter, FavSort, SUGGESTIONS } from "@/lib/data"
import { useSession } from "@/lib/session"
import { timeAgo } from "@/lib/time"

const POS_SHORT = { n: "subst.", v: "v.", a: "adj.", r: "adv." } as const
const POS_FILTER = { Substantivos: "n", Adjetivos: "a", Verbos: "v" } as const

// Controls appear only when they have something to act on.
const SEARCH_FROM = 6
const SORT_FROM = 2

export function FavoritesPage({
  onSearch,
  onGoHome,
  onOpenAuth,
}: {
  onSearch: (w: string) => void
  onGoHome: () => void
  onOpenAuth: () => void
}) {
  const session = useSession()
  const authed = session.status === "authed"
  const loaded = session.status !== "loading" && (!authed || session.savedLoaded)
  const words = session.saved.map((s) => ({
    word: s.word,
    pos: s.pos ? POS_SHORT[s.pos] : "",
    code: s.pos,
    snippet: s.gloss ?? "Toque para ver a definição completa.",
    when: timeAgo(s.savedAt),
  }))
  const [filter, setFilter] = useState<FavFilter>("Todas")
  const [sort, setSort] = useState<FavSort>("Mais recentes")
  const [query, setQuery] = useState("")

  const { toast } = useToast()

  async function removeWord(word: string) {
    if (!(await session.unsaveWord(word))) return
    toast({
      id: `remove-${word}`,
      title: "Removida dos Salvos",
      variant: "info",
      action: { label: "Desfazer", onClick: () => void session.saveWord(word) },
    })
  }

  // A filter is offered only for the classes the list actually has, and only when there are two or more.
  const kinds = new Set(words.map((w) => w.code).filter(Boolean))
  const filters = FAV_FILTERS.filter((f) => f === "Todas" || kinds.has(POS_FILTER[f as keyof typeof POS_FILTER]))
  const showFilters = filters.length > 2
  const showSort = words.length >= SORT_FROM
  const showSearch = words.length >= SEARCH_FROM
  const activeFilter = showFilters ? filter : "Todas"
  const activeQuery = showSearch ? query : ""

  const filtered = words
    .filter((w) => {
      const matchQ = !activeQuery || w.word.toLowerCase().includes(activeQuery.toLowerCase())
      const matchF = activeFilter === "Todas" || w.code === POS_FILTER[activeFilter as keyof typeof POS_FILTER]
      return matchQ && matchF
    })
    .sort((a, b) => (sort === "A-Z" ? a.word.localeCompare(b.word, "pt-BR") : 0))

  const empty = loaded && (!authed || words.length === 0)

  return (
    <div className="min-h-dvh bg-white flex flex-col" style={{ fontFamily: "var(--font-sf)" }}>
      <main className="flex-1 max-w-[1056px] mx-auto w-full px-6 pt-6 md:pt-16 pb-28 md:pb-16 flex flex-col gap-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="w-full md:w-auto text-center md:text-left">
            <h1 className="text-ink" style={{ fontFamily: "var(--font-sf)", fontSize: "clamp(40px, 10vw, 56px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
              Salvos
            </h1>
            {/* The empty state already explains the page; the subtitle only describes a list that exists. */}
            {!empty && (
              <p className="text-meta mt-2 text-balance md:text-wrap" style={{ fontFamily: "var(--font-sf)", fontSize: 17, lineHeight: "27px" }}>
                As palavras que você guardou para consultar.
              </p>
            )}
          </div>
          {showSearch && (
            <div className="relative w-full md:w-[240px]">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar palavra salva"
                aria-label="Buscar palavra salva"
                className="h-10 pl-10 pr-4 rounded-full border border-hairline bg-white text-[16px] md:text-[14px] text-ink outline-none w-full placeholder-muted focus:border-field-focus transition-[border-color]"
              />
            </div>
          )}
        </div>

        {(showFilters || showSort) && (
          <div data-tip="fav-filters" className="flex items-center justify-between gap-4 flex-wrap border-b border-hairline min-h-12">
            <div className="flex gap-6 overflow-x-auto no-scrollbar self-stretch" role="group" aria-label="Filtrar por classe">
              {showFilters &&
                filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    aria-pressed={activeFilter === f}
                    className="relative shrink-0 h-12 text-[14px] transition-colors duration-200 hover:text-ink"
                    style={{ fontWeight: activeFilter === f ? 500 : 400, color: activeFilter === f ? "var(--color-ink)" : "var(--color-muted)" }}
                  >
                    {f}
                    {activeFilter === f && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink" />}
                  </button>
                ))}
            </div>
            {showSort && (
              <div className="seg-control my-1.5 ml-auto" role="group" aria-label="Ordenar">
                {FAV_SORTS.map((s) => (
                  <button key={s} onClick={() => setSort(s)} aria-pressed={sort === s}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!loaded ? (
          <div className="flex flex-col -mt-8" aria-busy="true" aria-label="Carregando palavras salvas">
            {[112, 84, 128].map((w, i) => (
              <div key={i} className="py-5 border-b border-hairline flex flex-col md:flex-row gap-3 md:gap-6 animate-pulse">
                <div className="h-6 rounded-xs bg-black/[0.06] md:mr-[calc(240px-var(--w))] shrink-0" style={{ width: w, ["--w" as string]: `${w}px` }} />
                <div className="h-4 w-3/4 md:w-[420px] rounded-xs bg-black/[0.05] mt-1" />
              </div>
            ))}
          </div>
        ) : empty ? (
          <EmptyState
            title={authed ? "Nenhuma palavra salva ainda" : "Suas palavras salvas ficam aqui"}
            body={
              authed
                ? "Toque no marcador ao lado de uma palavra para guardá-la. Ela aparece aqui para você consultar quando quiser."
                : "Entre na sua conta para guardar palavras e consultá-las depois, em qualquer aparelho."
            }
          >
            {authed ? (
              <>
                <PrimaryButton onClick={onGoHome}>Pesquisar uma palavra</PrimaryButton>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-meta mr-2" style={{ fontSize: 14 }}>
                    ou comece por
                  </span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSearch(s)}
                      className="h-10 px-4 rounded-full border border-hairline text-ink hover:border-ink transition-colors"
                      style={{ fontFamily: "var(--font-serif)", fontSize: 17 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <PrimaryButton onClick={onOpenAuth}>Entrar</PrimaryButton>
            )}
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState
            ruled={!(showFilters || showSort)}
            title={activeQuery ? `Nenhuma palavra salva com “${activeQuery}”` : "Nenhuma palavra nesta classe"}
            body={activeQuery ? "Confira a grafia ou procure a palavra nos dicionários." : "Escolha outra classe ou veja a lista inteira."}
          >
            <div className="flex flex-wrap gap-2">
              {activeQuery && <PrimaryButton onClick={() => onSearch(activeQuery)}>Pesquisar “{activeQuery}”</PrimaryButton>}
              <button
                onClick={() => {
                  setQuery("")
                  setFilter("Todas")
                }}
                className="h-10 px-5 rounded-full border border-hairline text-ink text-[14px] font-medium hover:border-ink transition-colors"
              >
                Ver todas
              </button>
            </div>
          </EmptyState>
        ) : (
          <div className={`relative flex flex-col ${showFilters || showSort ? "-mt-8" : "border-t border-hairline"}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.map((w, i) => (
                <motion.div
                  key={w.word}
                  data-tip={i === 0 ? "fav-row" : undefined}
                  layout="position"
                  exit={{ opacity: 0, x: 28, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative flex flex-col md:flex-row md:items-baseline gap-1 md:gap-0 py-5 pr-10 border-b border-hairline"
                >
                  {/* The whole row opens the word; the remove button sits above it. */}
                  <button onClick={() => onSearch(w.word)} aria-label={`Ver definição de ${w.word}`} className="absolute inset-0" />
                  <div className="flex items-baseline gap-2 md:w-[240px] md:shrink-0 md:pr-6 min-w-0">
                    <span className="text-ink truncate group-hover:underline underline-offset-4 decoration-1" style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500, lineHeight: "32px", letterSpacing: "-0.02em" }}>
                      {w.word}
                    </span>
                    {w.pos && (
                      <span className="italic text-meta shrink-0" style={{ fontFamily: "var(--font-serif)", fontSize: 15 }}>
                        {w.pos}
                      </span>
                    )}
                  </div>
                  <p className="text-ink line-clamp-2 md:w-[480px] md:shrink-0" style={{ fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: "27px" }}>
                    {w.snippet}
                  </p>
                  <p className="text-muted md:ml-auto md:pl-6 min-w-0 whitespace-nowrap truncate" title={`Salvo ${w.when}`} style={{ fontSize: 13, lineHeight: "20px" }}>
                    {w.when}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeWord(w.word)
                    }}
                    aria-label={`Remover ${w.word} dos salvos`}
                    className="hit-area absolute right-0 top-5 md:top-6 z-10 size-8 flex items-center justify-center rounded-full text-muted hover:text-danger transition-[color,scale] duration-150 active:scale-[0.94]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M6 6l1 14h10l1-14" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function EmptyState({ title, body, ruled = true, children }: { title: string; body: string; ruled?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`flex flex-col items-start gap-4 max-w-[552px] ${ruled ? "border-t border-hairline pt-8" : ""}`}>
      <div className="flex flex-col gap-2">
        <p className="text-ink" style={{ fontFamily: "var(--font-sf)", fontSize: 22, fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.02em" }}>
          {title}
        </p>
        <p className="text-meta" style={{ fontFamily: "var(--font-sf)", fontSize: 17, lineHeight: "27px" }}>
          {body}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 mt-2">{children}</div>
    </div>
  )
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="h-12 px-6 rounded-full bg-ink text-on-ink text-[15px] font-medium hover:bg-ink-hover transition-[background-color,scale] active:scale-[0.97]"
    >
      {children}
    </button>
  )
}
