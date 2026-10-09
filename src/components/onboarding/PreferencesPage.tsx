import { useState } from "react"
import { imgLogoHero } from "@/lib/assets"
import { PREF_OPTIONS } from "@/lib/data"

export function PreferencesPage({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(opt: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(opt)) next.delete(opt)
      else next.add(opt)
      return next
    })
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <header className="px-5 md:px-8 h-[52px] flex items-center justify-between shrink-0">
        <img src={imgLogoHero} alt="Diciobase" className="h-5 w-auto" />
        <button
          onClick={onContinue}
          className="text-[14px] text-label-secondary hover:text-ink transition-colors"
        >
          Pular
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 md:px-6 py-10 md:py-12">
        <div className="w-full max-w-[560px] flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1
              className="text-ink"
              style={{
                fontSize: "clamp(32px, 9vw, 44px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
              }}
            >
              O que te interessa?
            </h1>
            <p className="text-muted" style={{ fontSize: "clamp(15px, 4vw, 17px)" }}>
              Personalize sua experiência. Escolha quantos quiser.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {PREF_OPTIONS.map((opt) => {
              const on = selected.has(opt)
              return (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  aria-pressed={on}
                  className="px-4 py-2.5 rounded-full text-[15px] font-medium transition-[background-color,color,box-shadow,scale] duration-200 active:scale-[0.97]"
                  style={{
                    background: on ? "var(--color-ink)" : "var(--color-surface)",
                    color: on ? "var(--color-on-ink)" : "var(--color-ink)",
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          <button
            onClick={onContinue}
            className="w-full h-[52px] rounded-full bg-ink text-[16px] font-medium text-on-ink hover:bg-[#333] transition-[background-color,scale] active:scale-[0.97]"
          >
            Continuar
          </button>
        </div>
      </main>
    </div>
  )
}
