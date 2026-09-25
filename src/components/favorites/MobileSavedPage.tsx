import { useState } from "react"
import { slideUpStyle } from "@/lib/animation"
import { imgBookmark } from "@/lib/assets"
import { MOB_FAV_FILTERS, MobFavFilter, SAVED_WORDS } from "@/lib/data"
import { useFade } from "@/lib/hooks"

export function MobileSavedPage({
  onSearch,
}: {
  onSearch: (w: string) => void
}) {
  const vis = useFade("mobile-saved")
  const [filter, setFilter] = useState<MobFavFilter>("Todas")
  const [query, setQuery] = useState("")

  const filtered = SAVED_WORDS.filter((w) => {
    const matchQ = !query || w.word.toLowerCase().includes(query.toLowerCase())
    const matchF =
      filter === "Todas" ||
      (filter === "Adjetivos" && w.pos === "adj.") ||
      (filter === "Substantivos" && w.pos === "subst.")
    return matchQ && matchF
  })

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 20px)" }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={slideUpStyle(vis, 0)}>
        <h1 className="font-['Poppins:Bold'] text-[26px] text-[#1c1b19] tracking-[-0.52px]">
          Palavras salvas
        </h1>
        <p className="font-['Poppins:Regular'] text-[13px] text-[#8c8a82] mt-1">
          {SAVED_WORDS.length} palavras arquivadas para consulta rápida.
        </p>
      </div>

      {/* Search */}
      <div className="px-5 pb-4" style={slideUpStyle(vis, 0.06)}>
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8a82]"
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
            className="w-full h-[46px] pl-10 pr-4 rounded-[12px] bg-white border border-[#e0ddd6] font-['Poppins:Regular'] text-[14px] text-[#1c1b19] placeholder-[#8c8a82] outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 pb-4 flex gap-2" style={slideUpStyle(vis, 0.1)}>
        {MOB_FAV_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-[20px] font-['Poppins:SemiBold'] text-[13px] transition-all duration-200 active:scale-95"
            style={{
              background: filter === f ? "#1c1b19" : "#fff",
              color: filter === f ? "#fff" : "#4a4742",
              border: filter === f ? "none" : "1px solid #e0ddd6",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-6"
        style={slideUpStyle(vis, 0.12)}
      >
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-['Poppins:Regular'] text-[15px] text-[#8c8a82]">
              Nenhuma palavra encontrada.
            </p>
          </div>
        )}
        <div className="flex flex-col">
          {filtered.map((w, i) => (
            <button
              key={w.word}
              onClick={() => onSearch(w.word)}
              className="flex items-center justify-between py-5 active:bg-[#efece6] transition-colors rounded-[4px] -mx-1 px-1"
              style={{
                borderBottom:
                  i < filtered.length - 1 ? "1px solid #efece6" : "none",
              }}
            >
              <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-['Poppins:Bold'] text-[18px] text-[#1c1b19]">
                    {w.word}
                  </span>
                  <span className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82]">
                    {w.pos}
                  </span>
                </div>
                <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] line-clamp-1 pr-4">
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
      </div>
    </div>
  )
}
