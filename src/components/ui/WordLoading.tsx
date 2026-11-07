/**
 * The entry page's own layout in gray, with the word already in place: the
 * page doesn't jump when the definitions arrive, and the reader sees what
 * they asked for from the first frame.
 */
export function WordLoading({ word }: { word: string }) {
  const bar = "rounded-xs bg-black/[0.06]"
  return (
    <div className="min-h-dvh bg-white" style={{ fontFamily: "var(--font-sf)" }} role="status" aria-live="polite">
      <span className="sr-only">Buscando “{word}” nos dicionários…</span>
      <div className="max-w-[1056px] mx-auto px-6" aria-hidden="true">
        <div className="pt-4 md:pt-16 pb-8">
          <div className="md:hidden h-10 mb-6" />
          <div className="flex items-end justify-between gap-4">
            <p data-headword className="text-ink break-words min-w-0" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(48px, 13vw, 72px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {word}
            </p>
            <div className="flex gap-2 shrink-0 pb-2">
              <div className="size-10 rounded-full bg-black/[0.05]" />
              <div className="size-10 rounded-full bg-black/[0.05]" />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 h-10">
            <div className={`${bar} h-4 w-24`} />
            <div className={`${bar} h-4 w-16`} />
            <div className={`${bar} h-4 w-20`} />
            <div className={`${bar} h-4 w-28`} />
          </div>
          <div className="flex items-center h-6">
            <div className={`${bar} h-4 w-36`} />
          </div>
        </div>

        <div className="h-12 flex items-center gap-8 border-b border-hairline">
          {[112, 148, 120].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-black/[0.08]" />
              <div className={`${bar} h-3.5`} style={{ width: w }} />
            </div>
          ))}
          <div className="max-md:hidden ml-auto h-9 w-40 rounded-sm bg-black/[0.04]" />
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,552px)_320px] lg:justify-between pt-[72px]">
          <div className="flex flex-col gap-6 animate-pulse">
            {[0.86, 0.62, 0.74, 0.9].map((w, i) => (
              <div key={i} className="flex">
                <div className={`${bar} h-3.5 w-3 mt-1.5 mr-3 sm:mr-5 shrink-0`} />
                <div className="flex-1 sm:flex-none sm:w-[480px] flex flex-col gap-3 pt-1">
                  <div className={`${bar} h-4`} style={{ width: `${w * 100}%` }} />
                  {i % 2 === 1 && <div className="rounded-xs bg-black/[0.04] h-4" style={{ width: `${w * 70}%` }} />}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex flex-col gap-8 animate-pulse">
            {[0, 1].map((i) => (
              <div key={i} className="pt-4 border-t border-hairline flex flex-col gap-3">
                <div className={`${bar} h-3 w-24`} />
                <div className="rounded-xs bg-black/[0.04] h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
