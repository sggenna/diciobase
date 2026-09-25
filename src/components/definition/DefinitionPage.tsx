import { useState, useEffect, useRef } from "react"
import SwipeToast from "@/SwipeToast"
import { DictEntryView } from "@/components/definition/DictEntryView"
import { fadeStyle } from "@/lib/animation"
import { imgAudio, imgBookmark, imgShare } from "@/lib/assets"
import { DICT_COLOR } from "@/lib/data"
import { useFade } from "@/lib/hooks"
import { WordData } from "@/lib/types"

export function DefinitionPage({
  wordData,
  onSearch,
  onBack,
  isLoggedIn,
  onOpenAuth,
}: {
  wordData: WordData
  onSearch: (w: string) => void
  onBack: () => void
  isLoggedIn?: boolean
  onOpenAuth?: (then?: () => void) => void
}) {
  const [activeId, setActiveId] = useState(wordData.dicts[0].id)
  const [contentVis, setContentVis] = useState(true)
  const [saved, setSaved] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const [btnPop, setBtnPop] = useState(false)

  function handleSave() {
    if (!isLoggedIn) {
      onOpenAuth?.(() => {
        setSaved(true)
        setToastKey((k) => k + 1)
        setBtnPop(true)
        setTimeout(() => setBtnPop(false), 400)
      })
      return
    }
    const next = !saved
    setSaved(next)
    if (next) {
      setToastKey((k) => k + 1)
      setBtnPop(true)
      setTimeout(() => setBtnPop(false), 400)
    }
  }
  const pageVis = useFade(wordData.word)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveId(wordData.dicts[0].id)
  }, [wordData.word])

  function switchDict(id: string) {
    if (id === activeId) return
    setContentVis(false)
    setTimeout(() => {
      setActiveId(id)
      setContentVis(true)
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }, 160)
  }

  function playAudio() {
    setAudioPlaying(true)
    setTimeout(() => setAudioPlaying(false), 1600)
  }

  const activeEntry =
    wordData.dicts.find((d) => d.id === activeId) ?? wordData.dicts[0]
  const color = DICT_COLOR[activeId] ?? "#000"

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={fadeStyle(pageVis)}
    >
      <main
        className="flex-1 flex overflow-hidden"
        style={{ height: "calc(100vh - 64px)", marginTop: 64 }}
      >
        <aside className="w-[280px] shrink-0 border-r border-black/8 flex flex-col overflow-y-auto hidden md:flex">
          <div className="px-6 pt-8 pb-5 border-b border-black/8">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-['Poppins:ExtraBold'] text-[34px] text-black leading-tight">
                {wordData.word}
              </h1>
              {wordData.gender && (
                <span className="font-['Poppins:Regular'] text-[12px] text-[#7e7676] border border-[#c8c4bc] px-2 py-0.5 rounded-[4px]">
                  {wordData.gender}
                </span>
              )}
            </div>
            <p className="font-['Poppins:Regular'] text-[14px] text-[#7e7676] mt-1">
              [ {wordData.phonetic} ]
            </p>
            <p className="font-['Poppins:Medium'] text-[12px] text-[#9e9b94] uppercase tracking-[0.5px] mt-1">
              {wordData.partOfSpeech}
            </p>
          </div>

          <div className="mx-4 mt-6 mb-4 bg-[#b4b4b4] rounded-[16px] p-5 flex flex-col gap-3">
            {wordData.facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <span className="font-['Poppins:Regular'] text-[9px] uppercase tracking-[0.6px] text-[#7e7676]">
                  {f.label}
                </span>
                <span className="font-['Poppins:SemiBold'] text-[13px] text-[#1c1b19]">
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-5 border-b border-black/8 flex items-center justify-between gap-4 shrink-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3 flex-wrap md:hidden">
                <span className="font-['Poppins:ExtraBold'] text-[28px] text-black">
                  {wordData.word}
                </span>
                <span className="font-['Poppins:Medium'] text-[12px] text-black uppercase tracking-[0.5px]">
                  {wordData.partOfSpeech}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-['Poppins:Regular'] text-[15px] text-[#7e7676] hidden md:inline">
                  [ {wordData.phonetic} ]
                </span>
                <button
                  onClick={playAudio}
                  className="flex items-center gap-2 bg-[#b4b4b4] hover:bg-[#ede9e0] px-3 py-1.5 rounded-[8px] transition-all duration-200"
                >
                  <img
                    src={imgAudio}
                    alt=""
                    className="size-[13px]"
                    style={{
                      transform: audioPlaying ? "scale(1.25)" : "scale(1)",
                      transition: "transform 0.2s",
                    }}
                  />
                  <span className="font-['Poppins:SemiBold'] text-[11px] text-black">
                    {audioPlaying ? "Reproduzindo…" : "Ouvir pronúncia"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 h-[42px] rounded-[12px]"
                style={{
                  background: saved ? "#1c1b19" : "#b4b4b4",
                  border: saved ? "none" : "1px solid #c8c4bc",
                  transform: btnPop ? "scale(1.08)" : "scale(1)",
                  transition:
                    "background 0.2s, border-color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <img
                  src={imgBookmark}
                  alt=""
                  className="size-[15px]"
                  style={{
                    filter: saved ? "none" : "invert(1)",
                    transform: btnPop
                      ? "scale(1.35) rotate(-10deg)"
                      : "scale(1) rotate(0deg)",
                    transition:
                      "filter 0.2s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Poppins:SemiBold'",
                    fontSize: 13,
                    color: saved ? "#fff" : "#1c1b19",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                  }}
                >
                  {saved ? "Salvo ✓" : "Salvar"}
                </span>
              </button>
              <button className="flex items-center justify-center w-[42px] h-[42px] rounded-[12px] border border-[#c8c4bc] hover:border-black transition-all duration-200">
                <img src={imgShare} alt="" className="size-[16px]" />
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
                color="#b4b4b4"
                fuseColor="#3D6647"
                duration={3500}
                fuse="bottom"
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7dc490"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
            )}
          </div>

          <div className="px-8 py-3 border-b border-black/8 flex items-center gap-2 flex-wrap shrink-0">
            <span className="font-['Poppins:Regular'] text-[11px] text-[#7e7676] uppercase tracking-[0.6px] mr-1">
              Fonte
            </span>
            {wordData.dicts.map((d) => {
              const c = DICT_COLOR[d.id] ?? "#000"
              const isActive = d.id === activeId
              return (
                <button
                  key={d.id}
                  onClick={() => switchDict(d.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] transition-all duration-200 font-['Poppins:SemiBold'] text-[12px]"
                  style={{
                    background: isActive ? c : "#b4b4b4",
                    color: isActive ? "#fff" : "#4a4742",
                  }}
                >
                  <span
                    className="size-1.5 rounded-full inline-block shrink-0"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.6)" : c,
                    }}
                  />
                  {d.shortName}
                </button>
              )
            })}
          </div>

          <div ref={contentRef} className="flex-1 overflow-y-auto px-8 py-8">
            <div
              style={{
                opacity: contentVis ? 1 : 0,
                transform: contentVis ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.18s ease, transform 0.18s ease",
              }}
            >
              <DictEntryView entry={activeEntry} onSearch={onSearch} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
