import { slideUpStyle } from "@/lib/animation";
import { DICT_COLOR } from "@/lib/data";
import { useFade } from "@/lib/hooks";

export function MobileDictionariesPage() {
  const vis = useFade("mobile-dicts");
  const dicts = [
    { id: "aurelio",  name: "Dicionário Aurélio",  tag: "Versão 2026",       desc: "O mais consultado dicionário da língua portuguesa, com mais de 200 mil verbetes." },
    { id: "houaiss",  name: "Dicionário Houaiss",  tag: "Edição Integral",   desc: "Referência acadêmica com etimologias detalhadas e dados linguísticos completos." },
    { id: "michaelis",name: "Michaelis",            tag: "Dicionário Escolar",desc: "Ideal para estudantes, com linguagem acessível e exemplos do cotidiano." },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col px-5"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="pt-8 pb-6" style={slideUpStyle(vis, 0)}>
        <h1 className="font-['Poppins:Bold'] text-[26px] text-[#1c1b19] tracking-[-0.52px]">Dicionários</h1>
        <p className="font-['Poppins:Regular'] text-[13px] text-[#8c8a82] mt-1">3 fontes indexadas</p>
      </div>

      <div className="flex flex-col gap-3" style={slideUpStyle(vis, 0.06)}>
        {dicts.map((d, i) => {
          const c = DICT_COLOR[d.id] ?? "#000";
          return (
            <div key={d.id} className="bg-white rounded-[18px] p-5 border border-[#efece6]"
              style={{ ...slideUpStyle(vis, 0.06 + i * 0.06) }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: c }} />
                <div>
                  <p className="font-['Poppins:SemiBold'] text-[15px] text-[#1c1b19]">{d.name}</p>
                  <p className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82]">{d.tag}</p>
                </div>
              </div>
              <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]">{d.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
