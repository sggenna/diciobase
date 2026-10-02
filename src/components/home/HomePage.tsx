import { lazy, Suspense, useState } from "react"
import type * as React from "react"
import { Footer } from "@/components/layout/Footer"
import { SUGGESTIONS } from "@/lib/data"

const Globe = lazy(() =>
  import("@/components/home/Globe").then((m) => ({ default: m.Globe })),
)

export function HomePage({
  onSearch,
}: {
  onSearch: (word: string) => void
}) {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    if (q) onSearch(q)
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-7 text-center">
        <div
          className="flex flex-col items-center w-full max-w-[680px]"
        >
          <h1
            className="text-ink"
            style={{
              fontSize: 48,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            Todos os dicionários.
            <br />
            <span className="text-muted">Em um só lugar.</span>
          </h1>

          <div
            className="relative w-full mt-5"
            style={{ aspectRatio: "720 / 440" }}
          >
            <Suspense fallback={null}>
              <div className="absolute inset-0">
                <Globe />
              </div>
            </Suspense>

            <form
              onSubmit={submit}
              className="absolute left-1/2 -translate-x-1/2 w-[75%] max-w-[480px]"
              style={{ top: "43.6%" }}
            >
              <div
                className="relative w-full flex items-center"
                style={{
                  height: 56,
                  borderRadius: 28,
                  paddingLeft: 20,
                  paddingRight: 6,
                  background: "rgba(255,255,255,0.78)",
                  backdropFilter: "saturate(180%) blur(20px)",
                  WebkitBackdropFilter: "saturate(180%) blur(20px)",
                  boxShadow: focused
                    ? "0 0 0 1px rgba(0,0,0,0.08), 0 14px 36px rgba(0,0,0,0.10)"
                    : "0 0 0 1px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="shrink-0"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M20 20l-4-4" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Pesquise uma palavra"
                  className="flex-1 h-full ml-3 bg-transparent text-ink placeholder-muted outline-none"
                  style={{ fontSize: 17, letterSpacing: "-0.02em" }}
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="shrink-0 flex items-center justify-center bg-ink text-on-ink transition-[background-color,scale] active:scale-[0.97]"
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19V5" />
                    <path d="M6 11l6-6 6 6" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div
            className="flex items-center justify-center gap-[18px] mt-2"
            style={{ fontSize: 17, letterSpacing: "-0.02em" }}
          >
            <span style={{ color: "var(--color-label-secondary)" }}>
              Experimente
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSearch(s)}
                className="text-ink font-medium hover:opacity-60 transition-opacity capitalize"
              >
                {s} ›
              </button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
