import { useState } from "react"
import type * as React from "react"
import { useSuggest } from "@/components/ui/Suggest"

export function AppNav({
  onHome,
  onFavorites,
  onProfile,
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
  onSearch: (q: string) => void
  searchValue: string
  onSearchChange: (v: string) => void
  isLoggedIn?: boolean
  hideSearch?: boolean
  initial?: string
  avatarSrc?: string
}) {
  const [focused, setFocused] = useState(false)
  const suggest = useSuggest(searchValue, (w) => onSearch(w))
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
      <div className="max-w-[1056px] mx-auto px-6 h-[52px] flex items-center gap-6">
        <button
          onClick={onHome}
          aria-label="Diciobase"
          className="hit-area relative shrink-0 text-ink transition-opacity hover:opacity-60"
          style={{ fontFamily: "var(--font-serif)", fontSize: 21, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: "24px" }}
        >
          {/* Set like a headword at the top of an entry, with its syllables marked. */}
          <span aria-hidden="true">
            di<span className="wordmark-dot">·</span>cio<span className="wordmark-dot">·</span>ba<span className="wordmark-dot">·</span>se
          </span>
        </button>
        {!hideSearch && (
          <form onSubmit={submit} className="flex-1 max-w-[240px] ml-auto">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-muted"
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
                {...suggest.inputProps}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  setFocused(true)
                  suggest.inputProps.onFocus()
                }}
                onBlur={() => {
                  setFocused(false)
                  suggest.inputProps.onBlur()
                }}
                placeholder="Pesquisar"
                aria-label="Pesquisar palavra"
                className="w-full h-9 pl-9 pr-4 rounded-full border border-hairline bg-white text-[14px] text-ink placeholder-muted outline-none transition-[border-color] duration-200"
                style={{
                  borderColor: focused ? "var(--color-field-focus)" : undefined,
                }}
              />
              {suggest.list}
            </div>
          </form>
        )}
        <div className={`flex items-center gap-6 ${hideSearch ? "ml-auto" : ""}`}>
          <button
            data-tip="nav-salvos"
            onClick={onFavorites}
            className="h-9 px-1 text-[14px] font-medium text-ink hover:opacity-60 transition-opacity flex items-center"
          >
            Salvos
          </button>
          <button
            onClick={onProfile}
            aria-label="Conta"
            className="relative size-10 rounded-full flex items-center justify-center bg-transparent border border-hairline hover:border-[#c7c7cc] active:scale-[0.94] transition-[border-color,scale] duration-150"
          >
            {isLoggedIn ? (
              avatarSrc ? (
                <img src={avatarSrc} alt="" className="img-edge size-full rounded-full object-cover" />
              ) : (
                <span className="uppercase text-meta" style={{ fontSize: 15, fontWeight: 500, lineHeight: "20px" }}>
                  {initial}
                </span>
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
