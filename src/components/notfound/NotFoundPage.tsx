
export function NotFoundPage({
  word,
  onBack,
}: {
  word: string
  onBack: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <p className="font-['Poppins:ExtraBold'] text-[48px] text-ink">
        "{word}"
      </p>
      <p className="font-['Poppins:Regular'] text-[18px] text-muted">
        Palavra não encontrada nos nossos dicionários.
      </p>
      <button
        onClick={onBack}
        className="bg-ink text-on-ink font-['Poppins:SemiBold'] text-[14px] px-6 py-3 rounded-md hover:bg-[#333] transition-[background-color,scale] active:scale-[0.97]"
      >
        Voltar à busca
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE APP
