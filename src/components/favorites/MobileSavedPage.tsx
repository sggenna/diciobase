import { useState } from "react"
import { slideUpStyle } from "@/lib/animation"
import { imgBookmark } from "@/lib/assets"
import { FAV_FILTERS, FAV_SORTS, FavFilter, FavSort, SAVED_WORDS } from "@/lib/data"
import { useFade } from "@/lib/hooks"

export function MobileSavedPage({
  onSearch,
  onGoHome,
}: {
  onSearch: (w: string) => void
  onGoHome: () => void
}) {
  const vis = useFade("mobile-saved")
  const [words] = useState(SAVED_WORDS)
  const [filter, setFilter] = useState<FavFilter>("Todas")
  const [sort, setSort] = useState<FavSort>("Mais recentes")
  const [query, setQuery] = useState("")

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
      className="min-h-[calc(100vh-64px)] bg-paper-warm flex flex-col"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 20px)" }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={slideUpStyle(vis, 0)}>
        <h1 className="font-['Poppins:Bold'] text-[26px] text-ink tracking-[-0.52px]">
          Salvos
        </h1>
        <p className="font-['Poppins:Regular'] text-[13px] text-muted mt-1">
          {words.length} palavras arquivadas para consulta rápida.
        </p>
      </div>

      {/* Search */}
      <div className="px-5 pb-4" style={slideUpStyle(vis, 0.06)}>
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
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
            placeholder="Buscar palavras salvas..."
            className="w-full h-[46px] pl-10 pr-4 rounded-md bg-white border border-border font-['Poppins:Regular'] text-[14px] text-ink placeholder-muted outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      {/* Filters */}
      <div
        className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar"
        style={slideUpStyle(vis, 0.1)}
      >
        {FAV_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl font-['Poppins:SemiBold'] text-[13px] transition-colors duration-200 active:scale-95 shrink-0"
            style={{
              background: filter === f ? "var(--color-ink)" : "#fff",
              color: filter === f ? "var(--color-on-ink)" : "var(--color-body)",
              border: filter === f ? "none" : "1px solid var(--color-border)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="px-5 pb-4 flex" style={slideUpStyle(vis, 0.12)}>
        <div className="flex gap-1 rounded-xl bg-white border border-border p-1">
          {FAV_SORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="px-3 py-1 rounded-lg font-['Poppins:Medium'] text-[12px] transition-colors duration-200"
              style={{
                background: sort === s ? "var(--color-surface)" : "transparent",
                color: sort === s ? "var(--color-ink)" : "var(--color-muted)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-6"
        style={slideUpStyle(vis, 0.14)}
      >
        {words.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-4">
            <p className="font-['Poppins:Regular'] text-[15px] text-muted">
              Nenhuma palavra salva ainda.
            </p>
            <button
              onClick={onGoHome}
              className="px-5 py-2.5 rounded-xl bg-ink text-on-ink font-['Poppins:SemiBold'] text-[13px] active:scale-95 transition-transform"
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
              className="px-5 py-2.5 rounded-xl border border-border-strong text-ink font-['Poppins:SemiBold'] text-[13px] active:scale-95 transition-transform"
            >
              Ver todas
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((w, i) => (
              <button
                key={w.word}
                onClick={() => onSearch(w.word)}
                className="flex items-center justify-between py-5 active:bg-surface transition-colors rounded-xs -mx-1 px-1"
                style={{
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid var(--color-surface)" : "none",
                }}
              >
                <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-['Poppins:Bold'] text-[18px] text-ink">
                      {w.word}
                    </span>
                    <span className="font-['Poppins:Regular'] text-[11px] text-muted">
                      {w.pos}
                    </span>
                  </div>
                  <p className="font-['Poppins:Regular'] text-[13px] text-body line-clamp-1 pr-4">
                    {w.snippet}
                  </p>
                </div>
                <div className="shrink-0 ml-3">
                  <img
                    src={imgBookmark}
                    alt=""
                    style={{ width: 18, height: 18, opacity: 0.4 }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
