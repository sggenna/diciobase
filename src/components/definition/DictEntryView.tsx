import { DictEntry } from "@/lib/types"

export function DictEntryView({
  entry,
  onSearch,
}: {
  entry: DictEntry
  onSearch: (w: string) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <span className="text-[12px] text-muted">{entry.tag}</span>

      {entry.etymology && (
        <div className="flex flex-col gap-2">
          <span
            id={`${entry.id}-etimologia`}
            tabIndex={-1}
            className="font-semibold text-[10px] uppercase tracking-[0.9px] text-muted outline-none"
          >
            Etimologia
          </span>
          <div className="border-l-2 border-rule pl-4">
            <p className="italic text-[14px] text-body leading-[1.6] max-w-[65ch]">
              {entry.etymology}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[10px] uppercase tracking-[0.9px] text-muted mb-3 block">
          Definição
        </span>
        <div className="flex flex-col gap-5">
          {entry.senses.map((sense) => (
            <div
              key={sense.num}
              id={`${entry.id}-sentido-${sense.num}`}
              tabIndex={-1}
              className="flex gap-4 outline-none"
            >
              <span className="font-bold text-[12px] text-muted shrink-0 w-5 pt-[3px]">
                {sense.num}.
              </span>
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2">
                  {sense.labels?.map((l) => (
                    <span
                      key={l}
                      className="font-semibold text-[9px] uppercase tracking-[0.6px] border border-border-strong text-muted rounded-xs px-1.5 py-0.5 shrink-0"
                    >
                      {l}
                    </span>
                  ))}
                  <p className="text-[15px] text-ink leading-[1.65] max-w-[65ch]">
                    {sense.text}
                  </p>
                </div>
                {sense.subsenses && (
                  <div className="flex flex-col gap-2 pl-4 border-l border-border">
                    {sense.subsenses.map((sub) => (
                      <div key={sub.num} className="flex gap-3">
                        <span className="font-medium text-[11px] text-muted shrink-0 pt-[2px]">
                          {sub.num}
                        </span>
                        <p className="text-[13px] text-body leading-[1.6] max-w-[65ch]">
                          {sub.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {sense.examples && sense.examples.length > 0 && (
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-rule">
                    {sense.examples.map((ex, i) => (
                      <p
                        key={i}
                        className="italic text-[13px] text-muted leading-[1.6] max-w-[65ch]"
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
        <div className="bg-surface rounded-md px-5 py-4 flex flex-col gap-1">
          <span className="font-semibold text-[10px] uppercase tracking-[0.9px] text-muted">
            Notas
          </span>
          {entry.notes.map((n, i) => (
            <p key={i} className="text-[13px] text-body leading-[1.6] max-w-[65ch]">
              {n}
            </p>
          ))}
        </div>
      )}

      {entry.related && entry.related.length > 0 && (
        <div
          id={`${entry.id}-relacionadas`}
          tabIndex={-1}
          className="flex flex-col gap-3 outline-none"
        >
          <span className="font-semibold text-[10px] uppercase tracking-[0.9px] text-muted">
            Relacionadas
          </span>
          <div className="flex flex-wrap gap-2">
            {entry.related.map((w) => (
              <button
                key={w}
                onClick={() => onSearch(w)}
                className="px-3 py-1.5 rounded-xl border border-black/15 text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-on-ink transition-colors duration-200"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {entry.synonyms && entry.synonyms.length > 0 && (
        <div
          id={`${entry.id}-sinonimos`}
          tabIndex={-1}
          className="flex flex-col gap-3 outline-none"
        >
          <span className="font-semibold text-[10px] uppercase tracking-[0.9px] text-muted">
            Sinônimos neste dicionário
          </span>
          <div className="flex flex-wrap gap-2">
            {entry.synonyms.map((w) => (
              <button
                key={w}
                onClick={() => onSearch(w)}
                className="px-3 py-1.5 rounded-xl border border-black/15 text-[13px] text-body hover:border-ink hover:bg-ink hover:text-on-ink transition-colors duration-200"
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
