import { useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { fadeStyle } from "@/lib/animation"
import { imgBookmark } from "@/lib/assets"
import { FAV_FILTERS, FavFilter, SAVED_WORDS } from "@/lib/data"
import { useFade } from "@/lib/hooks"

export function FavoritesPage({ onSearch }: { onSearch: (w: string) => void }) {
  const vis = useFade("favorites")
  const [filter, setFilter] = useState<FavFilter>("Todas")
  const [query, setQuery] = useState("")

  const filtered = SAVED_WORDS.filter((w) => {
    const matchQ = !query || w.word.toLowerCase().includes(query.toLowerCase())
    const matchF =
      filter === "Todas" ||
      filter === "Recentes" ||
      (filter === "Adjetivos" && w.pos === "adj.") ||
      (filter === "Substantivos" && w.pos === "subst.")
    return matchQ && matchF
  })

  return (
    <div className="min-h-screen bg-white flex flex-col" style={fadeStyle(vis)}>
      <main className="flex-1 max-w-[900px] mx-auto w-full px-8 py-10 flex flex-col gap-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-['Poppins:Bold'] text-[36px] text-black tracking-[-1.4px]">
              Palavras Favoritas
            </h1>
            <p className="font-['Poppins:Regular'] text-[15px] text-[#7e7676] mt-1">
              Acompanhe as palavras que você mais gosta e estude suas
              definições.
            </p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e7676]"
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
              className="h-[40px] pl-9 pr-4 rounded-[10px] bg-[#b4b4b4] font-['Poppins:Regular'] text-[13px] outline-none w-[220px] placeholder-[#9e9b94]"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FAV_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-[20px] font-['Poppins:SemiBold'] text-[13px] transition-all duration-200"
              style={{
                background: filter === f ? "#000" : "#b4b4b4",
                color: filter === f ? "#fff" : "#4a4742",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col rounded-[16px] border border-black/8 overflow-hidden">
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-['Poppins:Regular'] text-[15px] text-[#7e7676]">
                Nenhuma palavra encontrada.
              </p>
            </div>
          )}
          {filtered.map((w, i) => (
            <div
              key={w.word}
              className="flex items-center justify-between px-6 py-5 hover:bg-[#fafaf9] transition-colors duration-150"
              style={{
                borderTop: i > 0 ? "1px solid rgba(0,0,0,0.06)" : undefined,
              }}
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-['Poppins:ExtraBold'] text-[20px] text-black">
                    {w.word}
                  </span>
                  <span className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82] uppercase tracking-[0.4px]">
                    {w.pos}
                  </span>
                </div>
                <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] line-clamp-1">
                  {w.snippet}
                </p>
                <p className="font-['Poppins:Regular'] text-[11px] text-[#9e9b94]">
                  Salvo {w.when}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <button
                  onClick={() => onSearch(w.word)}
                  className="px-4 py-2 rounded-[10px] border border-black/15 font-['Poppins:SemiBold'] text-[12px] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200"
                >
                  Ver Definição
                </button>
                <button className="size-8 flex items-center justify-center rounded-[8px] hover:bg-black/6 transition-colors">
                  <img
                    src={imgBookmark}
                    alt=""
                    className="size-4 opacity-50 hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
