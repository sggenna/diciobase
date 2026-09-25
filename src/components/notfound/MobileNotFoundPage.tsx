import { slideUpStyle } from "@/lib/animation"
import { useFade } from "@/lib/hooks"

export function MobileNotFoundPage({
  word,
  onBack,
}: {
  word: string
  onBack: () => void
}) {
  const vis = useFade("mobile-notfound-" + word)
  return (
    <div
      className="h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col items-center justify-center px-6 gap-5"
      style={slideUpStyle(vis)}
    >
      <div className="text-center">
        <p className="font-['Poppins:ExtraBold'] text-[36px] text-[#1c1b19] tracking-[-0.72px] mb-2">
          "{word}"
        </p>
        <p className="font-['Poppins:Regular'] text-[15px] text-[#8c8a82]">
          Palavra não encontrada nos nossos dicionários.
        </p>
      </div>
      <button
        onClick={onBack}
        className="bg-[#1c1b19] text-white font-['Poppins:SemiBold'] text-[14px] px-6 py-3.5 rounded-[14px] active:scale-95 transition-transform"
      >
        Voltar à busca
      </button>
    </div>
  )
}
