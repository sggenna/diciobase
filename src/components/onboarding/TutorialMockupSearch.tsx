export function TutorialMockupSearch() {
  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f0ede6]">
        <div
          className="bg-[#1c1b19] rounded-[3px]"
          style={{ width: 72, height: 13 }}
        />
        <div className="flex-1 h-[26px] rounded-full bg-[#f4f4f4] flex items-center px-3 gap-2">
          <div className="size-[8px] rounded-full bg-[#c0bcb4]" />
          <div className="flex-1 h-[5px] rounded-full bg-[#e0ddd6]" />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div
          className="bg-[#1c1b19] rounded-[4px]"
          style={{ width: 140, height: 24 }}
        />
        <div
          className="h-[9px] rounded-full bg-[#e0ddd6]"
          style={{ width: 200 }}
        />
        <div className="w-full max-w-[280px] h-[44px] rounded-full border border-[#c0bcb4] bg-white flex items-center px-4 gap-2.5">
          <div className="size-[12px] rounded-full bg-[#d0ccc4]" />
          <div className="flex-1 h-[8px] rounded-full bg-[#efece6]" />
        </div>
        <div className="flex gap-2 mt-1">
          {["terreno", "casa", "carro"].map((w) => (
            <div
              key={w}
              className="px-3 py-1.5 rounded-full border border-[#c0bcb4] font-['Poppins:Regular'] text-[11px] text-[#4a4742]"
            >
              {w}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
