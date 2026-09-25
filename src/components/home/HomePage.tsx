import { useState } from "react"
import type * as React from "react"
import { Footer } from "@/components/layout/Footer"
import { fadeStyle } from "@/lib/animation"
import { imgHeart, imgLogoHero, imgLogoLight } from "@/lib/assets"
import { SUGGESTIONS } from "@/lib/data"
import { useFade } from "@/lib/hooks"

export function HomePage({
  onSearch,
  onOpenAuth,
}: {
  onSearch: (word: string) => void
  onOpenAuth?: () => void
}) {
  const vis = useFade("home")
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    if (q) onSearch(q)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-10 py-5 flex items-center justify-between">
        <img src={imgLogoLight} alt="Diciobase" className="h-10 w-auto" />
        <div className="flex items-center gap-5">
          <button
            onClick={onOpenAuth}
            className="size-8 flex items-center justify-center rounded-full bg-surface-hover hover:bg-border transition-colors border border-border"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
          <img
            src={imgHeart}
            alt="Favoritos"
            className="size-7 object-contain cursor-pointer hover:opacity-60 transition-opacity"
          />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
        <div
          className="flex flex-col items-center gap-8 w-full max-w-[680px]"
          style={fadeStyle(vis)}
        >
          <img src={imgLogoHero} alt="DICIOBASE" className="h-20 w-auto" />

          <p className="font-['Poppins:Regular'] text-[26px] text-ink tracking-[-0.72px] text-center leading-tight">
            Todos os dicionários em um lugar.
          </p>

          <form onSubmit={submit} className="w-full flex flex-col gap-5">
            <div
              className="relative w-full"
              style={{
                filter: focused
                  ? "drop-shadow(0 6px 24px rgba(0,0,0,0.12))"
                  : "none",
                transition: "filter 0.3s ease",
              }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Pesquise algo"
                className="w-full h-[60px] px-7 rounded-full border font-['Poppins:Light'] text-[22px] text-ink tracking-[-1.2px] placeholder-muted bg-white outline-none transition-colors duration-250"
                style={{ borderColor: focused ? "var(--color-ink)" : "var(--color-muted)" }}
              />
              {query && (
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-ink text-on-ink font-['Poppins:SemiBold'] text-[13px] px-5 py-2.5 rounded-2xl hover:bg-[#333] transition-[background-color,transform] active:scale-95"
                >
                  Buscar
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-['Poppins:Regular'] text-[15px] text-black/70">
                Comece com:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSearch(s)}
                    className="px-4 py-1.5 rounded-2xl border border-black/20 font-['Poppins:Regular'] text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-on-ink transition-colors duration-200 capitalize"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
