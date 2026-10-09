export function NotFoundPage({
  word,
  onBack,
}: {
  word: string
  onBack: () => void
}) {
  return (
    <div
      className="min-h-screen md:min-h-[calc(100vh-53px)] flex flex-col items-center justify-center gap-4 px-6 pb-24 md:pb-0 text-center bg-white"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <p
        className="text-ink break-words max-w-full"
        style={{
          fontSize: "clamp(34px, 10vw, 56px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        “{word}”
      </p>
      <p className="text-muted" style={{ fontSize: "clamp(16px, 4.2vw, 19px)" }}>
        Palavra não encontrada nos nossos dicionários.
      </p>
      <button
        onClick={onBack}
        className="mt-3 h-[48px] px-7 rounded-full bg-ink text-on-ink text-[16px] font-medium hover:bg-[#333] transition-[background-color,scale] active:scale-[0.97]"
      >
        Voltar à busca
      </button>
    </div>
  )
}
