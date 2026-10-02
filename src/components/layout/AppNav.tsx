import { useState } from "react"
import type * as React from "react"
import { imgLogoHero } from "@/lib/assets"

export function AppNav({
  onHome,
  onFavorites,
  onProfile,
  onTutorial,
  onSearch,
  searchValue,
  onSearchChange,
  isLoggedIn,
  hideSearch,
  initial = "M",
  avatarSrc,
}: {
  onHome: () => void
  onFavorites: () => void
  onProfile: () => void
  onTutorial?: () => void
  onSearch: (q: string) => void
  searchValue: string
  onSearchChange: (v: string) => void
  isLoggedIn?: boolean
  hideSearch?: boolean
  initial?: string
  avatarSrc?: string
}) {
  const [focused, setFocused] = useState(false)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchValue.trim().toLowerCase()
    if (q) onSearch(q)
  }
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        fontFamily: "var(--font-sf)",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-8 h-[52px] flex items-center gap-5">
        <button
          onClick={onHome}
          className="shrink-0 h-6 w-auto transition-opacity hover:opacity-60"
        >
          <img src={imgLogoHero} alt="Diciobase" className="h-full w-auto" />
        </button>
        {!hideSearch && (
          <form onSubmit={submit} className="flex-1 max-w-[480px]">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Pesquise uma palavra…"
                className="w-full h-[36px] pl-9 pr-4 rounded-sm bg-surface text-[13px] text-ink placeholder-muted outline-none transition-colors duration-200"
                style={{
                  boxShadow: focused
                    ? "0 0 0 1px rgba(0,0,0,0.14), 0 6px 18px rgba(0,0,0,0.08)"
                    : "none",
                  background: focused ? "#fff" : undefined,
                }}
              />
            </div>
          </form>
        )}
        <div className="flex items-center gap-5 ml-auto">
          {onTutorial && (
            <button
              onClick={onTutorial}
              className="text-[13px] text-ink hover:opacity-60 transition-opacity hidden sm:inline"
            >
              Como funciona
            </button>
          )}
          <button
            onClick={onFavorites}
            className="h-[34px] px-1 text-[13px] text-ink hover:opacity-60 transition-opacity flex items-center gap-1.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="hidden sm:inline">Salvos</span>
          </button>
          <button
            onClick={onProfile}
            aria-label="Conta"
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-opacity hover:opacity-60"
            style={{ background: isLoggedIn ? "var(--color-ink)" : "transparent" }}
          >
            {isLoggedIn ? (
              avatarSrc ? (
                <img src={avatarSrc} alt="" className="size-full rounded-full object-cover" />
              ) : (
                <span className="text-[13px] font-semibold text-on-ink">{initial}</span>
              )
            ) : (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
