import { fadeStyle } from "@/lib/animation";
import { useFade } from "@/lib/hooks";

export function NotFoundPage({ word, onBack }: { word: string; onBack: () => void }) {
  const vis = useFade("notfound-" + word);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={fadeStyle(vis)}>
      <p className="font-['Poppins:ExtraBold'] text-[48px] text-black">"{word}"</p>
      <p className="font-['Poppins:Regular'] text-[18px] text-[#7e7676]">Palavra não encontrada nos nossos dicionários.</p>
      <button onClick={onBack}
        className="bg-black text-white font-['Poppins:SemiBold'] text-[14px] px-6 py-3 rounded-[12px] hover:bg-[#333] transition-all active:scale-95">
        Voltar à busca
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE APP
