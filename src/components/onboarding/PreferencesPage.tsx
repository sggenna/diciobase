import { useState } from "react";
import { fadeStyle } from "@/lib/animation";
import { imgLogoLight } from "@/lib/assets";
import { PREF_OPTIONS } from "@/lib/data";
import { useFade } from "@/lib/hooks";

export function PreferencesPage({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const vis = useFade("prefs");

  function toggle(opt: string) {
    setSelected(s => {
      const next = new Set(s);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col">
      <nav className="px-10 py-5 flex items-center justify-between shrink-0">
        <img src={imgLogoLight} alt="Diciobase" className="h-9 w-auto" />
        <button onClick={onContinue}
          className="font-['Poppins:Medium'] text-[13px] text-[#8c8a82] hover:text-black transition-colors">
          Pular
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px] flex flex-col gap-8" style={fadeStyle(vis)}>
          <div className="flex flex-col gap-2">
            <h1 className="font-['Poppins:ExtraBold'] text-[38px] text-[#1c1b19] tracking-[-1.5px] leading-tight">
              O que te interessa?
            </h1>
            <p className="font-['Poppins:Regular'] text-[15px] text-[#7e7676]">
              Personalize sua experiência. Escolha quantos quiser.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {PREF_OPTIONS.map(opt => {
              const on = selected.has(opt);
              return (
                <button key={opt} onClick={() => toggle(opt)}
                  className="px-5 py-2.5 rounded-[24px] font-['Poppins:Medium'] text-[14px] transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: on ? "#1c1b19" : "#fff",
                    color: on ? "#fff" : "#1c1b19",
                    border: on ? "1.5px solid #1c1b19" : "1.5px solid #d0ccc4",
                  }}>
                  {opt}
                </button>
              );
            })}
          </div>

          <button onClick={onContinue}
            className="w-full h-[52px] bg-[#1c1b19] rounded-[14px] font-['Poppins:SemiBold'] text-[15px] text-white hover:bg-black transition-all active:scale-[0.98]">
            Continuar
          </button>
        </div>
      </main>
    </div>
  );
}
