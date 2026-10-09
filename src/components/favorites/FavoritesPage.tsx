import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useToast } from "@/components/ui/Toast"
import { Footer } from "@/components/layout/Footer"
import { FAV_FILTERS, FAV_SORTS, FavFilter, FavSort, SAVED_WORDS } from "@/lib/data"

export function FavoritesPage({
  onSearch,
  onGoHome,
}: {
  onSearch: (w: string) => void
  onGoHome: () => void
}) {
  const [words, setWords] = useState(SAVED_WORDS)
  const [filter, setFilter] = useState<FavFilter>("Todas")
  const [sort, setSort] = useState<FavSort>("Mais recentes")
  const [query, setQuery] = useState("")

  const { toast } = useToast()

  function removeWord(word: string) {
    const index = words.findIndex((w) => w.word === word)
    if (index < 0) return
    const removed = words[index]
    setWords((ws) => ws.filter((w) => w.word !== word))
    toast({
      id: `remove-${word}`,
      title: "Removida dos Salvos",
      description: `“${word}” não está mais na sua lista.`,
      variant: "info",
      action: {
        label: "Desfazer",
        onClick: () =>
          setWords((ws) => {
            if (ws.some((w) => w.word === word)) return ws
            const next = [...ws]
            next.splice(Math.min(index, next.length), 0, removed)
            return next
          }),
      },
    })
  }

  const filtered = words
    .filter((w) => {
      const matchQ = !query || w.word.toLowerCase().includes(query.toLowerCase())
      const matchF =
        filter === "Todas" ||
        (filter === "Adjetivos" && w.pos === "adj.") ||
        (filter === "Substantivos" && w.pos === "subst.") ||
        (filter === "Verbos" && w.pos === "v.")
      return matchQ && matchF
    })
    .sort((a, b) => (sort === "A-Z" ? a.word.localeCompare(b.word, "pt-BR") : 0))

  return (
    <div
      className="min-h-screen bg-surface flex flex-col"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <main className="flex-1 max-w-[900px] mx-auto w-full px-5 md:px-8 pt-6 md:pt-10 pb-28 md:pb-16 flex flex-col gap-6 md:gap-8">
        <div className="flex items-end justify-between gap-4 md:gap-6 flex-wrap">
          <div>
            <h1
              className="text-ink"
              style={{ fontSize: "clamp(34px, 10vw, 44px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              Salvos.
            </h1>
            <p className="text-muted mt-2" style={{ fontSize: "clamp(15px, 4vw, 17px)" }}>
              Acompanhe as palavras que você mais gosta e estude suas definições.
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar palavra salva"
              className="h-[40px] pl-10 pr-4 rounded-full bg-white text-[14px] text-ink outline-none w-full sm:w-[240px] placeholder-muted"
              style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap max-w-[100vw] md:max-w-none">
            {FAV_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="shrink-0 px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors duration-200"
                style={{
                  background: filter === f ? "var(--color-ink)" : "#fff",
                  color: filter === f ? "var(--color-on-ink)" : "var(--color-label-secondary)",
                  boxShadow: filter === f ? "none" : "0 0 0 1px rgba(0,0,0,0.06)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-full bg-black/[0.05] p-1">
            {FAV_SORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className="px-3.5 py-1 rounded-full text-[13px] font-medium transition-colors duration-200"
                style={{
                  background: sort === s ? "#fff" : "transparent",
                  color: sort === s ? "var(--color-ink)" : "var(--color-muted)",
                  boxShadow: sort === s ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div
          className="relative flex flex-col rounded-2xl bg-white overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" }}
        >
          {words.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <p className="text-[15px] text-muted">Nenhuma palavra salva ainda.</p>
              <button
                onClick={onGoHome}
                className="px-5 py-2.5 rounded-full bg-ink text-on-ink text-[14px] font-medium transition-transform active:scale-[0.97]"
              >
                Pesquisar palavras
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <p className="text-[15px] text-muted">
                Nenhuma palavra encontrada com esse filtro.
              </p>
              <button
                onClick={() => setFilter("Todas")}
                className="px-5 py-2.5 rounded-full text-ink text-[14px] font-medium hover:bg-ink hover:text-on-ink transition-colors"
                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.12)" }}
              >
                Ver todas
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.map((w, i) => (
              <motion.div
                key={w.word}
                layout="position"
                exit={{
                  opacity: 0,
                  x: 28,
                  transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
                }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="group relative flex items-center justify-between gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 hover:bg-surface transition-colors duration-150"
                style={{
                  borderTop: i > 0 ? "1px solid rgba(0,0,0,0.06)" : undefined,
                }}
              >
                <button
                  onClick={() => onSearch(w.word)}
                  aria-label={`Ver definição de ${w.word}`}
                  className="absolute inset-0"
                />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-ink font-semibold" style={{ fontSize: 20, letterSpacing: "-0.02em" }}>
                      {w.word}
                    </span>
                    <span className="text-muted italic" style={{ fontSize: 13 }}>
                      {w.pos}
                    </span>
                  </div>
                  <p className="text-label-secondary line-clamp-1" style={{ fontSize: 14 }}>
                    {w.snippet}
                  </p>
                  <p className="text-muted" style={{ fontSize: 12 }}>
                    Salvo {w.when}
                  </p>
                </div>
                <span className="hidden sm:inline text-ink font-medium shrink-0" style={{ fontSize: 14 }}>
                  Ver definição ›
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeWord(w.word)
                  }}
                  aria-label={`Remover ${w.word} dos salvos`}
                  className="relative z-10 size-8 shrink-0 flex items-center justify-center rounded-full text-muted hover:text-danger hover:bg-danger-tint transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 14h10l1-14" />
                  </svg>
                </button>
              </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
