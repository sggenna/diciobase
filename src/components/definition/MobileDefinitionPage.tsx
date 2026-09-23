import { useState, useEffect, useRef } from "react";
import SwipeToast from "@/SwipeToast";
import { slideUpStyle } from "@/lib/animation";
import { imgAudio, imgBookmark, imgShare } from "@/lib/assets";
import { DICT_COLOR } from "@/lib/data";
import { useFade } from "@/lib/hooks";
import { WordData } from "@/lib/types";

export function MobileDefinitionPage({
  wordData, onSearch, onBack, isLoggedIn, onOpenAuth,
}: {
  wordData: WordData; onSearch: (w: string) => void; onBack: () => void;
  isLoggedIn?: boolean; onOpenAuth?: (then?: () => void) => void;
}) {
  const [activeId, setActiveId] = useState(wordData.dicts[0].id);
  const [contentVis, setContentVis] = useState(true);
  const [saved, setSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [btnPop, setBtnPop] = useState(false);

  function handleSaveMobile() {
    if (!isLoggedIn) {
      onOpenAuth?.(() => {
        setSaved(true);
        setToastKey(k => k + 1);
        setBtnPop(true); setTimeout(() => setBtnPop(false), 400);
      });
      return;
    }
    const next = !saved;
    setSaved(next);
    if (next) { setToastKey(k => k + 1); setBtnPop(true); setTimeout(() => setBtnPop(false), 400); }
  }
  const pageVis = useFade(wordData.word);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActiveId(wordData.dicts[0].id); }, [wordData.word]);

  function switchDict(id: string) {
    if (id === activeId) return;
    setContentVis(false);
    setTimeout(() => {
      setActiveId(id);
      setContentVis(true);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 160);
  }

  function playAudio() {
    setAudioPlaying(true);
    setTimeout(() => setAudioPlaying(false), 1600);
  }

  const activeEntry = wordData.dicts.find(d => d.id === activeId) ?? wordData.dicts[0];
  const color = DICT_COLOR[activeId] ?? "#000";

  return (
    <div className="h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col overflow-hidden"
      style={{ ...slideUpStyle(pageVis), paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#fbf9f6] shrink-0">
        <button onClick={onBack}
          className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white border border-[#e0ddd6] active:scale-95 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white border border-[#e0ddd6] active:scale-95 transition-transform">
            <img src={imgShare} alt="" style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={handleSaveMobile}
            className="flex items-center gap-1.5 px-3.5 h-[38px] rounded-full"
            style={{
              background: saved ? "#1c1b19" : "#fff",
              border: saved ? "none" : "1px solid #e0ddd6",
              transform: btnPop ? "scale(1.1)" : "scale(1)",
              transition: "background 0.2s, border-color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
            <img src={imgBookmark} alt="" style={{
              width: 14, height: 14,
              filter: saved ? "none" : "invert(1)",
              transform: btnPop ? "scale(1.4) rotate(-10deg)" : "scale(1) rotate(0deg)",
              transition: "filter 0.2s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
            <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 12, color: saved ? "#fff" : "#1c1b19", transition: "color 0.2s" }}>
              {saved ? "Salvo ✓" : "Salvar"}
            </span>
          </button>
        </div>
        {toastKey > 0 && (
          <SwipeToast
            key={toastKey}
            open
            onClose={() => {}}
            title="Palavra salva!"
            description={`"${wordData.word}" adicionada às suas palavras`}
            background="#1c1b19"
            color="#f5f2eb"
            fuseColor="#3D6647"
            duration={3500}
            fuse="bottom"
            width={320}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7dc490" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
          />
        )}
      </div>

      {/* Word header */}
      <div className="px-5 pb-4 bg-[#fbf9f6] shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-['Poppins:ExtraBold'] text-[32px] text-[#1c1b19] leading-tight tracking-[-0.64px]">
              {wordData.word}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['Poppins:Regular'] text-[14px] text-[#8c8a82]">
                /{wordData.phonetic}/
              </span>
              <span className="px-2.5 py-0.5 rounded-[6px] bg-[#efece6] font-['Poppins:Medium'] text-[12px] text-[#4a4742]">
                {wordData.partOfSpeech}
              </span>
            </div>
          </div>
          <button onClick={playAudio}
            className="shrink-0 w-[48px] h-[48px] rounded-full bg-black flex items-center justify-center active:scale-95 transition-all duration-150"
            style={{ boxShadow: audioPlaying ? "0 0 0 6px rgba(0,0,0,0.12)" : "none" }}>
            <img src={imgAudio} alt="" style={{ width: 18, height: 18, filter: "invert(1)" }} />
          </button>
        </div>
      </div>

      {/* Dict switcher pills */}
      <div className="px-5 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {wordData.dicts.map(d => {
            const c = DICT_COLOR[d.id] ?? "#000";
            const isActive = d.id === activeId;
            return (
              <button key={d.id} onClick={() => switchDict(d.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[20px] font-['Poppins:SemiBold'] text-[12px] shrink-0 transition-all duration-200 active:scale-95"
                style={{
                  background: isActive ? c : "#fff",
                  color: isActive ? "#fff" : "#4a4742",
                  border: isActive ? "none" : "1px solid #e0ddd6",
                }}>
                <span className="size-1.5 rounded-full inline-block"
                  style={{ background: isActive ? "rgba(255,255,255,0.6)" : c }} />
                {d.shortName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#e0ddd6] mx-5 shrink-0" />

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        <div style={{
          opacity: contentVis ? 1 : 0,
          transform: contentVis ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}>
          {/* Mobile macrostructure: simplified single-column layout */}
          <div className="flex flex-col gap-6">
            {/* Source */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[24px] text-white font-['Poppins:SemiBold'] text-[11px]"
                style={{ background: color }}>
                <span className="size-1.5 rounded-full bg-white/60 inline-block" />
                {activeEntry.name}
              </span>
              <span className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82]">{activeEntry.tag}</span>
            </div>

            {/* Etymology */}
            {activeEntry.etymology && (
              <div className="flex flex-col gap-2">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Etimologia</span>
                <p className="font-['Poppins:Italic'] italic text-[13px] text-[#4a4742] leading-[1.6] border-l-2 border-[#d5d0c6] pl-4">
                  {activeEntry.etymology}
                </p>
              </div>
            )}

            {/* Definitions */}
            <div className="flex flex-col gap-2">
              <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Definição</span>
              <div className="flex flex-col gap-4">
                {activeEntry.senses.map(sense => (
                  <div key={sense.num} className="flex gap-3">
                    <span className="font-['Poppins:Bold'] text-[12px] text-[#8c8a82] shrink-0 w-5 pt-[2px]">{sense.num}.</span>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 items-start">
                        {sense.labels?.map(l => (
                          <span key={l} className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.5px] border border-[#c8c4bc] text-[#7e7676] rounded-[4px] px-1.5 py-0.5">
                            {l}
                          </span>
                        ))}
                        <p className="font-['Poppins:Regular'] text-[15px] text-[#1c1b19] leading-[1.65]">{sense.text}</p>
                      </div>
                      {sense.examples && sense.examples.length > 0 && (
                        <div className="border-l-2 border-[#d5d0c6] pl-3">
                          <p className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.8px] text-[#8c8a82] mb-1">
                            Exemplo de uso
                          </p>
                          {sense.examples.map((ex, i) => (
                            <p key={i} className="font-['Poppins:Italic'] italic text-[13px] text-[#7e7676] leading-[1.6]">{ex}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {activeEntry.notes && activeEntry.notes.length > 0 && (
              <div className="bg-white rounded-[12px] px-4 py-3 flex flex-col gap-1 border border-[#efece6]">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Notas</span>
                {activeEntry.notes.map((n, i) => (
                  <p key={i} className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]">{n}</p>
                ))}
              </div>
            )}

            {/* Synonyms */}
            {(activeEntry.synonyms?.length || wordData.synonyms.length) > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-[#e0ddd6]">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Sinônimos</span>
                <div className="flex flex-wrap gap-2">
                  {(activeEntry.synonyms?.length ? activeEntry.synonyms : wordData.synonyms).map(w => (
                    <button key={w} onClick={() => onSearch(w)}
                      className="px-3.5 py-1.5 rounded-[20px] bg-white border border-[#e0ddd6] font-['Poppins:Regular'] text-[13px] text-[#1c1b19] active:scale-95 transition-transform">
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {activeEntry.related && activeEntry.related.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Relacionadas</span>
                <div className="flex flex-wrap gap-2">
                  {activeEntry.related.map(w => (
                    <button key={w} onClick={() => onSearch(w)}
                      className="px-3.5 py-1.5 rounded-[20px] bg-[#efece6] font-['Poppins:Regular'] text-[13px] text-[#1c1b19] active:scale-95 transition-transform">
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Facts */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#e0ddd6] pb-6">
              <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Sobre a palavra</span>
              <div className="grid grid-cols-2 gap-3">
                {wordData.facts.map(f => (
                  <div key={f.label} className="bg-white rounded-[12px] p-3.5 border border-[#efece6]">
                    <span className="font-['Poppins:Regular'] text-[9px] uppercase tracking-[0.6px] text-[#8c8a82] block mb-1">{f.label}</span>
                    <span className="font-['Poppins:SemiBold'] text-[13px] text-[#1c1b19]">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
