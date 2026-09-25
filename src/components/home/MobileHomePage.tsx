import { useState } from "react"
import type * as React from "react"
import { slideUpStyle } from "@/lib/animation"
import { imgLogoDark2, imgSearchIcon } from "@/lib/assets"
import { RECENT_SEARCHES, SUGGESTIONS } from "@/lib/data"
import { useFade } from "@/lib/hooks"

export function MobileHomePage({
  onSearch,
}: {
  onSearch: (w: string) => void
}) {
  const vis = useFade("mobile-home")
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    if (q) onSearch(q)
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col px-6 justify-center"
      style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center mb-3"
        style={slideUpStyle(vis, 0)}
      >
        <img
          src={imgLogoDark2}
          alt="DICIOBASE"
          style={{ height: 44, width: "auto" }}
        />
      </div>

      {/* Tagline */}
      <p
        className="font-['Poppins:Regular'] text-[16px] text-[#1c1b19] text-center leading-[1.3] tracking-[-0.32px] mb-8 mt-2"
        style={slideUpStyle(vis, 0.06)}
      >
        Todos os dicionários em um só lugar.
      </p>

      {/* Search bar */}
      <form onSubmit={submit} style={slideUpStyle(vis, 0.1)}>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <img
              src={imgSearchIcon}
              alt=""
              style={{ width: 18, height: 18, opacity: 0.5 }}
            />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Pesquise alguma palavra..."
            className="w-full h-[50px] pl-[44px] pr-5 rounded-[25px] bg-white font-['Poppins:Regular'] text-[14px] text-[#1c1b19] placeholder-[#8c8a82] outline-none transition-all duration-200"
            style={{ border: `1.5px solid ${focused ? "#1c1b19" : "#c8c4bc"}` }}
          />
          {query && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white font-['Poppins:SemiBold'] text-[12px] px-4 py-2 rounded-[20px] active:scale-95 transition-transform"
            >
              Buscar
            </button>
          )}
        </div>
      </form>

      {/* Recents */}
      <div className="flex flex-col gap-3 mt-8" style={slideUpStyle(vis, 0.14)}>
        <p className="font-['Poppins:SemiBold'] text-[11px] text-[#8c8a82] uppercase tracking-[1px]">
          Pesquisas Recentes
        </p>
        <div className="flex flex-wrap gap-2">
          {RECENT_SEARCHES.map((w) => (
            <button
              key={w}
              onClick={() => onSearch(w.toLowerCase())}
              className="px-4 py-2 rounded-[20px] bg-white border border-[#efece6] font-['Poppins:Regular'] text-[13px] text-[#1c1b19] active:scale-95 transition-transform"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Explore suggestions */}
      <div className="flex flex-col gap-3 mt-8" style={slideUpStyle(vis, 0.18)}>
        <p className="font-['Poppins:SemiBold'] text-[11px] text-[#8c8a82] uppercase tracking-[1px]">
          Experimente
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSearch(s)}
              className="px-4 py-2 rounded-[20px] bg-[#1c1b19] font-['Poppins:Regular'] text-[13px] text-white active:scale-95 transition-transform capitalize"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
