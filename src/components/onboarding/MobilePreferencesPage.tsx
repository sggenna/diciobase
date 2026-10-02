import { useState } from "react"
import { slideUpStyle } from "@/lib/animation"
import { PREF_OPTIONS } from "@/lib/data"
import { useFade } from "@/lib/hooks"

export function MobilePreferencesPage({
  onContinue,
}: {
  onContinue: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const vis = useFade("mobile-prefs")

  function toggle(opt: string) {
    setSelected((s) => {
      const next = new Set(s)
      next.has(opt) ? next.delete(opt) : next.add(opt)
      return next
    })
  }

  return (
    <div
      className="min-h-screen bg-paper-warm flex flex-col px-5"
      style={{
        paddingTop: "env(safe-area-inset-top, 24px)",
        paddingBottom: "env(safe-area-inset-bottom, 24px)",
      }}
    >
      <div className="flex justify-end pt-4 pb-2" style={slideUpStyle(vis, 0)}>
        <button
          onClick={onContinue}
          className="font-['Poppins:Medium'] text-[13px] text-muted"
        >
          Pular
        </button>
      </div>

      <div
        className="flex flex-col gap-2 pt-4 pb-7"
        style={slideUpStyle(vis, 0.06)}
      >
        <h1 className="font-['Poppins:ExtraBold'] text-[28px] text-ink tracking-[-0.56px] leading-tight">
          O que te interessa?
        </h1>
        <p className="font-['Poppins:Regular'] text-[14px] text-muted leading-[1.6]">
          Personalize sua experiência. Escolha quantos quiser.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2.5 flex-1"
        style={slideUpStyle(vis, 0.1)}
      >
        {PREF_OPTIONS.map((opt) => {
          const on = selected.has(opt)
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="px-4 py-2.5 rounded-xl font-['Poppins:Medium'] text-[13px] transition-[background-color,color,border-color,scale] duration-150 active:scale-[0.97]"
              style={{
                background: on ? "var(--color-ink)" : "#fff",
                color: on ? "var(--color-on-ink)" : "var(--color-ink)",
                border: on
                  ? "1.5px solid var(--color-ink)"
                  : "1.5px solid var(--color-border-strong)",
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <button
        onClick={onContinue}
        className="mt-8 w-full h-[54px] bg-ink rounded-lg font-['Poppins:SemiBold'] text-[15px] text-on-ink active:scale-[0.97] transition-transform"
        style={slideUpStyle(vis, 0.16)}
      >
        Continuar
      </button>
    </div>
  )
}
