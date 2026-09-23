import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { Footer } from "@/components/layout/Footer";
import { TutorialMockupDefinition } from "@/components/onboarding/TutorialMockupDefinition";
import { TutorialMockupSaved } from "@/components/onboarding/TutorialMockupSaved";
import { TutorialMockupSearch } from "@/components/onboarding/TutorialMockupSearch";
import { fadeStyle } from "@/lib/animation";
import { imgLogoDark, imgLogoHero, imgLogoLight } from "@/lib/assets";
import { useFade } from "@/lib/hooks";

export function LandingPage({
  defaultModal,
  onAuth,
}: {
  defaultModal?: "login" | "signup";
  onAuth: () => void;
}) {
  const [modal, setModal] = useState<"login" | "signup" | null>(defaultModal ?? null);
  const heroVis = useFade("hero");

  const FEATURES = [
    {
      accent: "#3D6647",
      title: "Pesquise em segundos",
      body: "Digite qualquer palavra e obtenha definições completas de múltiplos dicionários em uma única tela.",
      mockup: TutorialMockupSearch,
    },
    {
      accent: "#24456B",
      title: "Compare definições",
      body: "Veja lado a lado como Aurélio, Houaiss e Michaelis descrevem a mesma palavra.",
      mockup: TutorialMockupDefinition,
    },
    {
      accent: "#7A6520",
      title: "Salve o que importa",
      body: "Marque palavras para revisitar depois. Seu vocabulário cresce com você.",
      mockup: TutorialMockupSaved,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[rgba(251,249,246,0.88)] border-b border-[#e8e4dc]"
        style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-[1100px] mx-auto px-8 h-16 flex items-center justify-between">
          <img src={imgLogoLight} alt="DICIOBASE" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModal("login")}
              className="h-9 px-5 rounded-full font-['Poppins:Medium'] text-[14px] text-[#1c1b19] hover:bg-black/5 transition-colors">
              Entrar
            </button>
            <button
              onClick={() => setModal("signup")}
              className="h-9 px-5 rounded-full bg-[#1c1b19] font-['Poppins:SemiBold'] text-[14px] text-white hover:bg-black/80 transition-colors">
              Criar conta
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28"
        style={fadeStyle(heroVis)}>
        <img src={imgLogoHero} alt="DICIOBASE" className="h-20 w-auto mb-8" />
        <h1 className="font-['Poppins:ExtraBold'] text-[56px] text-[#1c1b19] tracking-[-2px] leading-none max-w-[640px]">
          Todos os dicionários.<br />Uma só busca.
        </h1>
        <p className="mt-5 font-['Poppins:Regular'] text-[18px] text-[#6b6760] max-w-[480px] leading-relaxed">
          Consulte Aurélio, Houaiss e Michaelis simultaneamente e descubra a riqueza da língua portuguesa.
        </p>
        <div className="mt-10 flex items-center gap-3">
          <button
            onClick={() => setModal("signup")}
            className="h-12 px-8 rounded-full bg-[#1c1b19] font-['Poppins:SemiBold'] text-[15px] text-white hover:bg-black/80 transition-all duration-200 active:scale-[0.97] shadow-lg shadow-black/10">
            Começar gratuitamente
          </button>
          <button
            onClick={() => setModal("login")}
            className="h-12 px-7 rounded-full border border-[#d5d1c9] font-['Poppins:Medium'] text-[15px] text-[#1c1b19] hover:bg-black/5 transition-colors">
            Já tenho conta
          </button>
        </div>
        {/* Word count badge */}
        <div className="mt-8 flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#e8e4dc] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#3D6647]" />
          <span className="font-['Poppins:Medium'] text-[13px] text-[#6b6760]">
            +500.000 verbetes em 3 dicionários
          </span>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#e8e4dc]" />

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-center font-['Poppins:SemiBold'] text-[11px] uppercase tracking-[2px] text-[#a09c94] mb-3">
            Funcionalidades
          </p>
          <h2 className="text-center font-['Poppins:ExtraBold'] text-[38px] text-[#1c1b19] tracking-[-1px] mb-16">
            Feito para quem ama palavras
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {FEATURES.map((f, i) => {
              const MockupComp = f.mockup;
              return (
                <div key={i} className="flex flex-col gap-5">
                  {/* mini browser mockup */}
                  <div className="w-full aspect-[4/3] rounded-[20px] overflow-hidden border border-[#e0ddd6] shadow-md">
                    <div className="h-8 bg-[#f0ede6] flex items-center px-3 gap-1.5 border-b border-[#e0ddd6]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e0ddd6]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e0ddd6]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e0ddd6]" />
                    </div>
                    <div className="h-[calc(100%-32px)]">
                      <MockupComp />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 -mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: f.accent }} />
                    <span className="font-['Poppins:SemiBold'] text-[11px] uppercase tracking-[1.5px]" style={{ color: f.accent }}>
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-['Poppins:Bold'] text-[20px] text-[#1c1b19] tracking-[-0.3px]">
                    {f.title}
                  </h3>
                  <p className="font-['Poppins:Regular'] text-[14px] text-[#6b6760] leading-relaxed -mt-2">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[#1c1b19] py-20 px-6">
        <div className="max-w-[600px] mx-auto flex flex-col items-center text-center gap-6">
          <img src={imgLogoDark} alt="DICIOBASE" className="h-8 w-auto" />
          <h2 className="font-['Poppins:ExtraBold'] text-[36px] text-white tracking-[-1px] leading-tight">
            Amplie seu vocabulário hoje
          </h2>
          <p className="font-['Poppins:Regular'] text-[15px] text-white/60 leading-relaxed">
            Crie sua conta gratuita e acesse os três maiores dicionários do português em um só lugar.
          </p>
          <button
            onClick={() => setModal("signup")}
            className="h-12 px-8 rounded-full bg-white font-['Poppins:SemiBold'] text-[15px] text-[#1c1b19] hover:bg-[#f0ede6] transition-all duration-200 active:scale-[0.97]">
            Criar conta gratuita
          </button>
        </div>
      </section>

      <Footer />

      {/* Modal */}
      {modal && (
        <AuthModal
          defaultMode={modal}
          onAuth={onAuth}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
