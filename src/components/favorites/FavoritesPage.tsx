import { useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { fadeStyle } from "@/lib/animation"
import { imgBookmark } from "@/lib/assets"
import { FAV_FILTERS, FAV_SORTS, FavFilter, FavSort, SAVED_WORDS } from "@/lib/data"
import { useFade } from "@/lib/hooks"

export function FavoritesPage({
  onSearch,
  onGoHome,
}: {
  onSearch: (w: string) => void
  onGoHome: () => void
}) {
  const vis = useFade("favorites")
  const [words, setWords] = useState(SAVED_WORDS)
  const [filter, setFilter] = useState<FavFilter>("Todas")
  const [sort, setSort] = useState<FavSort>("Mais recentes")
  const [query, setQuery] = useState("")

  function removeWord(word: string) {
    setWords((ws) => ws.filter((w) => w.word !== word))
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
    <div className="min-h-screen bg-white flex flex-col" style={fadeStyle(vis)}>
      <main className="flex-1 max-w-[900px] mx-auto w-full px-8 py-10 flex flex-col gap-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-['Poppins:Bold'] text-[36px] text-ink tracking-[-1.4px]">
              Salvos
            </h1>
            <p className="font-['Poppins:Regular'] text-[15px] text-muted mt-1">
              Acompanhe as palavras que você mais gosta e estude suas
              definições.
            </p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar palavra salva…"
              className="h-[40px] pl-9 pr-4 rounded-sm bg-surface font-['Poppins:Regular'] text-[13px] outline-none w-[220px] placeholder-muted"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {FAV_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-xl font-['Poppins:SemiBold'] text-[13px] transition-colors duration-200"
                style={{
                  background: filter === f ? "var(--color-ink)" : "var(--color-surface)",
                  color: filter === f ? "var(--color-on-ink)" : "var(--color-body)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl bg-surface p-1">
            {FAV_SORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className="px-3 py-1 rounded-lg font-['Poppins:Medium'] text-[12px] transition-colors duration-200"
                style={{
                  background: sort === s ? "#fff" : "transparent",
                  color: sort === s ? "var(--color-ink)" : "var(--color-muted)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-lg border border-black/8 overflow-hidden">
          {words.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <p className="font-['Poppins:Regular'] text-[15px] text-muted">
                Nenhuma palavra salva ainda.
              </p>
              <button
                onClick={onGoHome}
                className="px-5 py-2.5 rounded-xl bg-ink text-on-ink font-['Poppins:SemiBold'] text-[13px] transition-transform active:scale-[0.97]"
              >
                Pesquisar palavras
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <p className="font-['Poppins:Regular'] text-[15px] text-muted">
                Nenhuma palavra encontrada com esse filtro.
              </p>
              <button
                onClick={() => setFilter("Todas")}
                className="px-5 py-2.5 rounded-xl border border-black/15 text-ink font-['Poppins:SemiBold'] text-[13px] hover:bg-ink hover:text-on-ink transition-colors"
              >
                Ver todas
              </button>
            </div>
          ) : (
            filtered.map((w, i) => (
              <div
                key={w.word}
                className="group relative flex items-center justify-between px-6 py-5 hover:bg-surface-hover transition-colors duration-150"
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
                    <span className="font-['Poppins:ExtraBold'] text-[20px] text-ink">
                      {w.word}
                    </span>
                    <span className="font-['Poppins:Regular'] text-[11px] text-muted uppercase tracking-[0.4px]">
                      {w.pos}
                    </span>
                  </div>
                  <p className="font-['Poppins:Regular'] text-[13px] text-body line-clamp-1">
                    {w.snippet}
                  </p>
                  <p className="font-['Poppins:Regular'] text-[11px] text-muted">
                    Salvo {w.when}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeWord(w.word)
                  }}
                  aria-label={`Remover ${w.word} dos salvos`}
                  className="relative z-10 size-8 shrink-0 ml-4 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-black/6 transition-opacity"
                >
                  <img
                    src={imgBookmark}
                    alt=""
                    className="size-4 opacity-60 hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
