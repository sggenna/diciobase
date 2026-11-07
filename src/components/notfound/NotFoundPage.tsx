import { useEffect, useState } from "react"
import type * as React from "react"
import { track } from "@/lib/analytics"
import { api } from "@/lib/api"
import { syllabify } from "@/lib/syllables"

/** Words that start like the one typed, trying shorter beginnings until something matches ("saudadi" → "saudad…"). */
function useNearby(word: string, enabled: boolean) {
  const [words, setWords] = useState<string[] | null>(null)
  useEffect(() => {
    if (!enabled) return
    const ctl = new AbortController()
    const chars = Array.from(word.trim())
    ;(async () => {
      for (let n = chars.length; n >= 3; n--) {
        try {
          const { results } = await api.words.suggest(chars.slice(0, n).join(""), ctl.signal)
          const found = results.filter((r) => r.toLowerCase() !== word.toLowerCase())
          if (found.length) return setWords(found.slice(0, 6))
        } catch {
          return setWords([])
        }
      }
      setWords([])
    })()
    return () => ctl.abort()
  }, [word, enabled])
  return words
}

export function NotFoundPage({
  word,
  onBack,
  onSearch,
  onRetry,
  unavailable = false,
}: {
  word: string
  onBack: () => void
  onSearch: (w: string) => void
  /** Looks the same word up again; offered when the dictionaries could not be reached. */
  onRetry: () => void
  /** The lookup service could not be reached, as opposed to the word not existing. */
  unavailable?: boolean
}) {
  const nearby = useNearby(word, !unavailable)
  useEffect(() => {
    if (!unavailable) track("search_no_result")
  }, [word, unavailable])
  const [draft, setDraft] = useState(word)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = draft.trim().toLowerCase()
    if (q) onSearch(q)
  }

  const syllables = syllabify(word)

  return (
    <div className="min-h-dvh bg-white" style={{ fontFamily: "var(--font-sf)" }} role={unavailable ? "alert" : "status"}>
      {/* Set like an entry, because it is one: the word you asked for, and what the dictionaries say about it. */}
      <div className="max-w-[1056px] mx-auto px-6 pb-24 md:pb-16">
        <header className="pt-4 md:pt-16 pb-8 border-b border-hairline">
          <button
            onClick={onBack}
            className="md:hidden flex items-center gap-1 -ml-1 mb-6 h-10 pr-3 text-ink active:opacity-60 transition-opacity"
            style={{ fontSize: 16 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            Voltar
          </button>
          <h1
            data-headword
            className="text-ink break-words"
            style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(48px, 13vw, 72px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            {word}
          </h1>
          {syllables && (
            <p className="pt-4 text-meta" style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: "24px" }}>
              {syllables.join("·")}
            </p>
          )}
          <p className="italic text-meta" style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: "24px" }}>
            {unavailable ? "consulta interrompida" : "sem registro"}
          </p>
        </header>

        <div className="pt-12 sm:w-[512px] max-w-full flex flex-col gap-8">
          <div className="flex items-start">
            <span className="shrink-0 w-6 sm:w-8 tabular-nums text-muted" style={{ fontSize: 13, fontWeight: 500, lineHeight: "27px" }}>
              1
            </span>
            <div className="min-w-0">
              <p className="text-ink" style={{ fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: "27px" }}>
                {unavailable ? "Não conseguimos falar com os dicionários agora." : "Esta palavra ainda não existe."}
              </p>
              <p className="text-meta" style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: "26px" }}>
                {unavailable ? "Sua busca não se perdeu: tente de novo em instantes." : "Pelo menos em nenhum dos dicionários que consultamos."}
              </p>
            </div>
          </div>

          {unavailable ? (
            <div className="flex gap-2">
              <button
                onClick={onRetry}
                className="h-12 px-6 rounded-full bg-ink text-on-ink text-[15px] font-medium hover:bg-ink-hover transition-[background-color,scale] active:scale-[0.97]"
              >
                Tentar de novo
              </button>
              <button
                onClick={onBack}
                className="h-12 px-6 rounded-full border border-hairline text-ink text-[15px] font-medium hover:border-ink transition-colors"
              >
                Voltar
              </button>
            </div>
          ) : (
            <>
              {/* Near spellings first: most misses are a typo or a missing accent. */}
              <div className="min-h-[72px] flex flex-col gap-3" aria-live="polite">
                {nearby === null ? (
                  <div className="flex gap-2" aria-hidden="true">
                    {[72, 88, 64].map((w, i) => (
                      <div key={i} className="h-10 rounded-full bg-black/[0.05] animate-pulse" style={{ width: w }} />
                    ))}
                  </div>
                ) : nearby.length > 0 ? (
                  <>
                    <h2 className="sec-label">Talvez você procure</h2>
                    <div className="flex flex-wrap gap-2">
                      {nearby.map((w) => (
                        <button
                          key={w}
                          onClick={() => onSearch(w)}
                          className="h-10 px-4 rounded-full border border-hairline text-ink hover:border-ink active:scale-[0.97] transition-[border-color,scale]"
                          style={{ fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: "24px" }}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-label-secondary" style={{ fontSize: 14, lineHeight: "20px" }}>
                    Confira a grafia, os acentos, ou tente a forma no singular ou no infinitivo.
                  </p>
                )}
              </div>

              <form onSubmit={submit} className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Pesquisar outra palavra"
                  className="flex-1 min-w-0 h-12 px-5 rounded-full border border-hairline bg-white text-ink text-[17px] focus:border-field-focus transition-[border-color]"
                  style={{ fontFamily: "var(--font-serif)" }}
                />
                <button
                  type="submit"
                  className="h-12 px-6 rounded-full bg-ink text-on-ink text-[15px] font-medium hover:bg-ink-hover transition-[background-color,scale] active:scale-[0.97]"
                >
                  Buscar
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
