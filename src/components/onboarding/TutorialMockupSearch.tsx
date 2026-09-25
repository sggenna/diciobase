export function TutorialMockupSearch() {
  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
        <div
          className="bg-ink rounded-xs"
          style={{ width: 72, height: 13 }}
        />
        <div className="flex-1 h-[26px] rounded-full bg-surface flex items-center px-3 gap-2">
          <div className="size-[8px] rounded-full bg-border-strong" />
          <div className="flex-1 h-[5px] rounded-full bg-border" />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div
          className="bg-ink rounded-xs"
          style={{ width: 140, height: 24 }}
        />
        <div
          className="h-[9px] rounded-full bg-border"
          style={{ width: 200 }}
        />
        <div className="w-full max-w-[280px] h-[44px] rounded-full border border-border-strong bg-white flex items-center px-4 gap-2.5">
          <div className="size-[12px] rounded-full bg-border-strong" />
          <div className="flex-1 h-[8px] rounded-full bg-surface" />
        </div>
        <div className="flex gap-2 mt-1">
          {["terreno", "casa", "carro"].map((w) => (
            <div
              key={w}
              className="px-3 py-1.5 rounded-full border border-border-strong font-['Poppins:Regular'] text-[11px] text-body"
            >
              {w}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
