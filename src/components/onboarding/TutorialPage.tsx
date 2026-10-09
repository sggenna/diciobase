import { useState } from "react"

const STEPS = [
  {
    title: "Busque de forma inteligente",
    body: "Pesquise uma única vez e veja resultados indexados instantaneamente dos melhores dicionários acadêmicos e informais.",
  },
  {
    title: "Compare definições",
    body: "Veja a variação semântica entre diferentes fontes lexicográficas e selecione o significado perfeito para o seu contexto.",
  },
  {
    title: "Escute a pronúncia nativa",
    body: "Esclareça dúvidas silábicas e de acentuação fonética tocando no reprodutor de áudio integrado de cada palavra.",
  },
  {
    title: "Crie sua biblioteca",
    body: "Marque com estrela as palavras preferidas e agrupe-as em coleções personalizadas para estudar quando quiser.",
  },
]

export function TutorialPage({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const total = STEPS.length

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <main className="flex-1 w-full max-w-[980px] mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-12 md:pb-16 flex flex-col items-center text-center">
        <h1
          className="text-ink"
          style={{ fontSize: "clamp(32px, 9vw, 48px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.08 }}
        >
          Como funciona o Diciobase.
        </h1>
        <p className="text-muted mt-3 max-w-[520px]" style={{ fontSize: "clamp(15px, 4vw, 17px)" }}>
          Um guia rápido de {total} etapas para transformar sua experiência com
          o idioma português.
        </p>

        <div className="flex gap-2 mt-6 md:mt-8" role="tablist" aria-label="Etapas">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              role="tab"
              aria-selected={i === step}
              aria-label={`Etapa ${i + 1}: ${s.title}`}
              onClick={() => setStep(i)}
              className="h-[3px] rounded-full transition-[width,background-color] duration-300"
              style={{
                width: 40,
                background: i <= step ? "var(--color-ink)" : "var(--color-border-strong)",
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full mt-8 md:mt-10 text-left">
          {STEPS.map((s, i) => {
            const active = i === step
            return (
              <button
                key={s.title}
                onClick={() => setStep(i)}
                aria-current={active ? "step" : undefined}
                className="flex flex-col gap-3 rounded-2xl p-5 text-left transition-[background-color,box-shadow,translate] duration-300 lg:min-h-[220px]"
                style={{
                  background: active ? "#fff" : "transparent",
                  boxShadow: active
                    ? "0 0 0 1px rgba(0,0,0,0.05), 0 16px 40px -12px rgba(0,0,0,0.14)"
                    : "none",
                  translate: active ? "0 -4px" : "0 0",
                }}
              >
                <span
                  className="font-medium"
                  style={{
                    fontSize: 13,
                    color: active ? "var(--color-ink)" : "var(--color-muted)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="font-semibold"
                  style={{
                    fontSize: 19,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    color: active ? "var(--color-ink)" : "var(--color-label-secondary)",
                  }}
                >
                  {s.title}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: active ? "var(--color-label-secondary)" : "var(--color-muted)",
                  }}
                >
                  {s.body}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between w-full mt-8 md:mt-10">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="h-[44px] px-6 rounded-full bg-black/[0.06] text-ink text-[15px] font-medium transition-[opacity,scale] active:scale-[0.97] disabled:opacity-0 disabled:pointer-events-none"
          >
            Anterior
          </button>
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={onFinish}
              className="text-[15px] text-label-secondary hover:text-ink transition-colors"
            >
              Pular<span className="hidden sm:inline"> tutorial</span>
            </button>
            <button
              onClick={() =>
                step < total - 1 ? setStep(step + 1) : onFinish()
              }
              className="h-[44px] px-7 rounded-full bg-ink text-on-ink text-[15px] font-medium hover:bg-[#333] transition-[background-color,scale] active:scale-[0.97]"
            >
              {step < total - 1 ? "Avançar" : "Começar agora"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
