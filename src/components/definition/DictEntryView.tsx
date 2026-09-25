import { DICT_COLOR } from "@/lib/data"
import { DictEntry } from "@/lib/types"

export function DictEntryView({
  entry,
  onSearch,
}: {
  entry: DictEntry
  onSearch: (w: string) => void
}) {
  const color = DICT_COLOR[entry.id] ?? "#000"
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[24px] text-white font-['Poppins:SemiBold'] text-[12px]"
          style={{ background: color }}
        >
          <span className="size-1.5 rounded-full bg-white/60 inline-block" />
          {entry.name}
        </span>
        <span className="font-['Poppins:Regular'] text-[12px] text-[#8c8a82]">
          {entry.tag}
        </span>
      </div>

      {entry.etymology && (
        <div className="flex flex-col gap-2">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">
            Etimologia
          </span>
          <div className="border-l-2 border-[#d5d0c6] pl-4">
            <p className="font-['Poppins:Italic'] italic text-[14px] text-[#4a4742] leading-[1.6]">
              {entry.etymology}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676] mb-3 block">
          Definição
        </span>
        <div className="flex flex-col gap-5">
          {entry.senses.map((sense) => (
            <div key={sense.num} className="flex gap-4">
              <span className="font-['Poppins:Bold'] text-[12px] text-[#7e7676] shrink-0 w-5 pt-[3px]">
                {sense.num}.
              </span>
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2">
                  {sense.labels?.map((l) => (
                    <span
                      key={l}
                      className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.6px] border border-[#c8c4bc] text-[#7e7676] rounded-[4px] px-1.5 py-0.5 shrink-0"
                    >
                      {l}
                    </span>
                  ))}
                  <p className="font-['Poppins:Regular'] text-[15px] text-[#1c1b19] leading-[1.65]">
                    {sense.text}
                  </p>
                </div>
                {sense.subsenses && (
                  <div className="flex flex-col gap-2 pl-4 border-l border-[#e0ddd6]">
                    {sense.subsenses.map((sub) => (
                      <div key={sub.num} className="flex gap-3">
                        <span className="font-['Poppins:Medium'] text-[11px] text-[#9e9b94] shrink-0 pt-[2px]">
                          {sub.num}
                        </span>
                        <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]">
                          {sub.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {sense.examples && sense.examples.length > 0 && (
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#d5d0c6]">
                    {sense.examples.map((ex, i) => (
                      <p
                        key={i}
                        className="font-['Poppins:Italic'] italic text-[13px] text-[#7e7676] leading-[1.6]"
                      >
                        {ex}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {entry.notes && entry.notes.length > 0 && (
        <div className="bg-[#f4f4f4] rounded-[12px] px-5 py-4 flex flex-col gap-1">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">
            Notas
          </span>
          {entry.notes.map((n, i) => (
            <p
              key={i}
              className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]"
            >
              {n}
            </p>
          ))}
        </div>
      )}

      {entry.related && entry.related.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">
            Relacionadas
          </span>
          <div className="flex flex-wrap gap-2">
            {entry.related.map((w) => (
              <button
                key={w}
                onClick={() => onSearch(w)}
                className="px-3 py-1.5 rounded-[20px] border border-black/15 font-['Poppins:Regular'] text-[13px] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {entry.synonyms && entry.synonyms.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">
            Sinônimos neste dicionário
          </span>
          <div className="flex flex-wrap gap-2">
            {entry.synonyms.map((w) => (
              <button
                key={w}
                onClick={() => onSearch(w)}
                className="px-3 py-1.5 rounded-[20px] border border-black/15 font-['Poppins:Regular'] text-[13px] text-[#4a4742] hover:border-black hover:bg-black hover:text-white transition-all duration-200"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
