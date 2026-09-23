import { useState } from "react";
import { TutorialMockupDefinition } from "@/components/onboarding/TutorialMockupDefinition";
import { TutorialMockupSaved } from "@/components/onboarding/TutorialMockupSaved";
import { TutorialMockupSearch } from "@/components/onboarding/TutorialMockupSearch";
import { TUTORIAL_SLIDES } from "@/lib/data";

export function MobileTutorialPage({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [slideVis, setSlideVis] = useState(true);
  const slide = TUTORIAL_SLIDES[step];
  const total = TUTORIAL_SLIDES.length;

  function goTo(i: number) {
    setSlideVis(false);
    setTimeout(() => { setStep(i); setSlideVis(true); }, 150);
  }

  const Mockup = slide.mockup === "search"
    ? TutorialMockupSearch
    : slide.mockup === "definition"
    ? TutorialMockupDefinition
    : TutorialMockupSaved;

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div className="flex gap-2">
          {TUTORIAL_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="h-[3px] rounded-full transition-all duration-300"
              style={{ width: i === step ? 24 : 8, background: i === step ? "#1c1b19" : "#c8c4bc" }} />
          ))}
        </div>
        <button onClick={onFinish}
          className="font-['Poppins:Medium'] text-[13px] text-[#8c8a82]">
          Pular
        </button>
      </div>

      {/* Mockup area */}
      <div className="px-5 pt-3 pb-5 shrink-0"
        style={{
          opacity: slideVis ? 1 : 0,
          transform: slideVis ? "translateY(0) scale(1)" : "translateY(8px) scale(0.97)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}>
        {/* Phone-like frame */}
        <div className="rounded-[20px] overflow-hidden border border-[#e0ddd6]"
          style={{ height: 300, boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}>
          <Mockup />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 px-5 flex flex-col justify-between pb-6"
        style={{
          opacity: slideVis ? 1 : 0,
          transform: slideVis ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.24s ease 0.06s, transform 0.24s ease 0.06s",
        }}>
        <div className="flex flex-col gap-2">
          <span className="font-['Poppins:Regular'] text-[10px] uppercase tracking-[1px] text-[#8c8a82]">
            {slide.label} / {String(total).padStart(2, "0")}
          </span>
          <h2 className="font-['Poppins:ExtraBold'] text-[26px] text-[#1c1b19] leading-tight tracking-[-0.52px]">
            {slide.title}
          </h2>
          <p className="font-['Poppins:Regular'] text-[14px] text-[#7e7676] leading-[1.65]">
            {slide.body}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => goTo(step - 1)}
              className="h-[52px] px-5 rounded-[14px] border border-[#c8c4bc] font-['Poppins:SemiBold'] text-[14px] text-[#1c1b19] active:scale-95 transition-transform">
              Anterior
            </button>
          )}
          {step < total - 1 ? (
            <button onClick={() => goTo(step + 1)}
              className="flex-1 h-[52px] rounded-[14px] bg-[#1c1b19] font-['Poppins:SemiBold'] text-[15px] text-white active:scale-[0.97] transition-transform">
              Avançar
            </button>
          ) : (
            <button onClick={onFinish}
              className="flex-1 h-[52px] rounded-[14px] bg-[#1c1b19] font-['Poppins:SemiBold'] text-[15px] text-white active:scale-[0.97] transition-transform">
              Começar agora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
