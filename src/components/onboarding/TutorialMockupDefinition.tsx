export function TutorialMockupDefinition() {
  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f0ede6]">
        <div className="bg-[#1c1b19] rounded-[3px]" style={{ width: 72, height: 13 }} />
        <div className="flex-1 h-[22px] rounded-full bg-[#f5f2eb]" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-[#f0ede6] flex flex-col shrink-0" style={{ width: "32%" }}>
          <div className="px-4 py-3 border-b border-[#f0ede6]">
            <div className="font-['Poppins:ExtraBold'] text-[15px] text-[#1c1b19]">efêmero</div>
            <div className="h-[5px] w-[55px] bg-[#e0ddd6] rounded-full mt-1.5" />
          </div>
          {[{ name:"Aurélio", c:"#3D6647" }, { name:"Houaiss", c:"#24456B" }, { name:"Michaelis", c:"#7A6520" }].map((d, i) => (
            <div key={d.name} className="px-4 py-2.5 border-b border-[#f0ede6]"
              style={{ background: i === 0 ? "#f5f2eb" : "white" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="size-[6px] rounded-full shrink-0" style={{ background: d.c }} />
                <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 10, color: "#1c1b19" }}>{d.name}</span>
              </div>
              <div className="h-[5px] rounded-full bg-[#e0ddd6]" style={{ width: i === 0 ? "88%" : "65%" }} />
            </div>
          ))}
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col gap-2">
          <div className="flex gap-1.5">
            {[{ name:"Aurélio", c:"#3D6647" }].map(d => (
              <div key={d.name} className="px-2.5 py-1 rounded-full text-white text-[9px]"
                style={{ background: d.c, fontFamily: "'Poppins:SemiBold'" }}>{d.name}</div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {[100, 88, 72].map((w, i) => (
              <div key={i} className="h-[5px] rounded-full bg-[#e0ddd6]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-2 h-[5px] w-[45%] rounded-full bg-[#c8c4bc]" />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {["fugaz","transitório","passageiro"].map(w => (
              <div key={w} className="px-2 py-0.5 rounded-full border border-[#c8c4bc] text-[9px] font-['Poppins:Regular'] text-[#4a4742]">{w}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
