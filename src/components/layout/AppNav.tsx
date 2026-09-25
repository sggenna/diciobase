import { useState } from "react"
import type * as React from "react"
import { imgLogoLight } from "@/lib/assets"

export function AppNav({
  onHome,
  onFavorites,
  onProfile,
  onSearch,
  searchValue,
  onSearchChange,
  isLoggedIn,
  hideSearch,
}: {
  onHome: () => void
  onFavorites: () => void
  onProfile: () => void
  onSearch: (q: string) => void
  searchValue: string
  onSearchChange: (v: string) => void
  isLoggedIn?: boolean
  hideSearch?: boolean
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
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-8 h-[60px] flex items-center gap-5">
        <button
          onClick={onHome}
          className="shrink-0 h-8 w-auto transition-opacity hover:opacity-60"
        >
          <img src={imgLogoLight} alt="Diciobase" className="h-full w-auto" />
        </button>
        {!hideSearch && (
          <form onSubmit={submit} className="flex-1 max-w-[480px]">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9e9b94]"
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
                className="w-full h-[36px] pl-9 pr-4 rounded-[9px] bg-[#f4f4f4] font-['Poppins:Regular'] text-[13px] text-black placeholder-[#9e9b94] outline-none transition-all duration-200"
                style={{ boxShadow: focused ? "0 0 0 2px #1c1b19" : "none" }}
              />
            </div>
          </form>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onFavorites}
            className="h-[34px] px-3.5 rounded-[9px] font-['Poppins:Medium'] text-[13px] text-[#4a4742] hover:bg-[#f4f4f4] hover:text-black transition-all flex items-center gap-1.5"
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
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center hover:bg-black transition-colors ml-1"
            style={{ background: isLoggedIn ? "#1c1b19" : "#e8e4dc" }}
          >
            {isLoggedIn ? (
              <span className="font-['Poppins:Bold'] text-[13px] text-white">
                M
              </span>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b6760"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
