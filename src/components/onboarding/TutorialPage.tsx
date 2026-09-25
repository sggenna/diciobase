import { useState } from "react"
import { TutorialMockupDefinition } from "@/components/onboarding/TutorialMockupDefinition"
import { TutorialMockupSaved } from "@/components/onboarding/TutorialMockupSaved"
import { TutorialMockupSearch } from "@/components/onboarding/TutorialMockupSearch"
import { imgLogoLight } from "@/lib/assets"
import { TUTORIAL_SLIDES } from "@/lib/data"

export function TutorialPage({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const [slideVis, setSlideVis] = useState(true)
  const total = TUTORIAL_SLIDES.length
  const slide = TUTORIAL_SLIDES[step]

  function goTo(i: number) {
    setSlideVis(false)
    setTimeout(() => {
      setStep(i)
      setSlideVis(true)
    }, 180)
  }

  const Mockup =
    slide.mockup === "search"
      ? TutorialMockupSearch
      : slide.mockup === "definition"
        ? TutorialMockupDefinition
        : TutorialMockupSaved

  return (
    <div className="min-h-screen bg-paper-warm flex flex-col">
      <nav className="px-10 py-5 flex items-center justify-between shrink-0">
        <img src={imgLogoLight} alt="Diciobase" className="h-9 w-auto" />
        <button
          onClick={onFinish}
          className="font-['Poppins:Medium'] text-[13px] text-muted hover:text-ink transition-colors px-4 py-2 rounded-sm hover:bg-black/5"
        >
          Pular
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center px-8 py-6">
        <div className="flex items-center gap-16 max-w-[1100px] w-full">
          {/* Browser mockup */}
          <div
            className="flex-1 flex flex-col rounded-lg overflow-hidden border border-border"
            style={{
              boxShadow: "var(--shadow-lg)",
              opacity: slideVis ? 1 : 0,
              transform: slideVis
                ? "translateY(0) scale(1)"
                : "translateY(12px) scale(0.98)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}
          >
            {/* Browser chrome */}
            <div className="bg-surface-hover flex items-center gap-3 px-4 py-3 shrink-0">
              <div className="flex gap-1.5">
                <div className="size-[10px] rounded-full bg-border-strong" />
                <div className="size-[10px] rounded-full bg-border-strong" />
                <div className="size-[10px] rounded-full bg-border-strong" />
              </div>
              <div className="flex-1 h-[22px] rounded-sm bg-white border border-border flex items-center px-3">
                <span className="font-['Poppins:Regular'] text-[10px] text-muted">
                  diciobase.com
                </span>
              </div>
            </div>
            {/* App content */}
            <div style={{ height: 380 }}>
              <Mockup />
            </div>
          </div>

          {/* Text panel */}
          <div
            className="w-[340px] shrink-0 flex flex-col gap-6"
            style={{
              opacity: slideVis ? 1 : 0,
              transform: slideVis ? "translateY(0)" : "translateY(8px)",
              transition:
                "opacity 0.28s ease 0.05s, transform 0.28s ease 0.05s",
            }}
          >
            {/* Dots */}
            <div className="flex gap-2">
              {TUTORIAL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-[3px] rounded-full transition-[width,background-color] duration-300"
                  style={{
                    width: i === step ? 28 : 10,
                    background: i === step ? "var(--color-ink)" : "var(--color-border-strong)",
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-['Poppins:Regular'] text-[11px] uppercase tracking-[1.2px] text-muted">
                {slide.label} / {String(total).padStart(2, "0")}
              </span>
              <h2 className="font-['Poppins:ExtraBold'] text-[36px] text-ink leading-tight tracking-[-1.4px]">
                {slide.title}
              </h2>
              <p className="font-['Poppins:Regular'] text-[16px] text-muted leading-[1.65]">
                {slide.body}
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              {step > 0 && (
                <button
                  onClick={() => goTo(step - 1)}
                  className="h-[48px] px-6 rounded-md border border-border-strong font-['Poppins:SemiBold'] text-[14px] text-ink hover:border-ink transition-colors"
                >
                  Anterior
                </button>
              )}
              {step < total - 1 ? (
                <button
                  onClick={() => goTo(step + 1)}
                  className="h-[48px] px-8 rounded-md bg-ink font-['Poppins:SemiBold'] text-[14px] text-on-ink hover:bg-[#333] transition-[background-color,transform] active:scale-[0.97]"
                >
                  Avançar
                </button>
              ) : (
                <button
                  onClick={onFinish}
                  className="h-[48px] px-8 rounded-md bg-ink font-['Poppins:SemiBold'] text-[14px] text-on-ink hover:bg-[#333] transition-[background-color,transform] active:scale-[0.97]"
                >
                  Começar agora
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
