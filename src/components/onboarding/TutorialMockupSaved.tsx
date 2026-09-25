export function TutorialMockupSaved() {
  const words = [
    { word: "merencória", pos: "adj." },
    { word: "vellichor", pos: "subst." },
    { word: "petrichor", pos: "subst." },
  ]
  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f0ede6]">
        <div
          className="bg-[#1c1b19] rounded-[3px]"
          style={{ width: 72, height: 13 }}
        />
        <div className="flex-1 h-[22px] rounded-full bg-[#f4f4f4]" />
      </div>
      <div className="px-5 pt-4 pb-2">
        <div className="font-['Poppins:Bold'] text-[16px] text-[#1c1b19]">
          Palavras Favoritas
        </div>
        <div className="h-[5px] w-[160px] rounded-full bg-[#e0ddd6] mt-1.5" />
        <div className="h-[28px] rounded-[8px] border border-[#e0ddd6] bg-[#f4f4f4] flex items-center px-3 gap-2 mt-3">
          <div className="size-[8px] rounded-full bg-[#c0bcb4]" />
          <div className="flex-1 h-[5px] rounded-full bg-[#e0ddd6]" />
        </div>
        <div className="flex gap-2 mt-2">
          {["Todas", "Adjetivos", "Substantivos"].map((f, i) => (
            <div
              key={f}
              className="px-2.5 py-1 rounded-full text-[9px] font-['Poppins:SemiBold']"
              style={{
                background: i === 0 ? "#1c1b19" : "#f4f4f4",
                color: i === 0 ? "#fff" : "#4a4742",
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col px-5">
        {words.map((w, i) => (
          <div
            key={w.word}
            className="flex items-center justify-between py-2.5"
            style={{ borderTop: i > 0 ? "1px solid #efece6" : undefined }}
          >
            <div>
              <span className="font-['Poppins:Bold'] text-[13px] text-[#1c1b19]">
                {w.word}{" "}
              </span>
              <span
                style={{
                  fontFamily: "'Poppins:Regular'",
                  fontSize: 9,
                  color: "#8c8a82",
                }}
              >
                {w.pos}
              </span>
              <div className="h-[5px] w-[120px] rounded-full bg-[#e0ddd6] mt-1" />
            </div>
            <div className="size-[14px] rounded-[3px] border border-[#c8c4bc]" />
          </div>
        ))}
      </div>
    </div>
  )
}
