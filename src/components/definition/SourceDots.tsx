import { DICT_ACCENT } from "@/lib/data"

/** A dictionary's dot: the same 8px mark and color in the tabs, chips and "Também em". */
export function SourceDot({ id, size = 8 }: { id: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: DICT_ACCENT[id] ?? "var(--color-muted)" }}
    />
  )
}

const list = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`)

/**
 * "Também em": one dot per *other* dictionary that carries this sense, in the
 * same slot on every line, with the same tooltip. Hover or focus names them.
 */
export function SourceDots({ ids, names }: { ids: string[]; names: Record<string, string> }) {
  if (ids.length === 0) return null
  const label = `Também em ${list(ids.map((id) => names[id] ?? id))}`
  return (
    <span className="group relative inline-flex items-center">
      <span tabIndex={0} role="img" aria-label={label} className="focus-soft hit-area relative inline-flex items-center gap-1 rounded-full cursor-default">
        {ids.map((id) => (
          <SourceDot key={id} id={id} />
        ))}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute -right-3 bottom-full mb-2 z-20 flex items-center h-8 px-3 whitespace-nowrap rounded-[6px] bg-ink text-white opacity-0 translate-y-1 transition-[opacity,translate] duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
        style={{ fontFamily: "var(--font-sf)", fontSize: 13, lineHeight: "20px" }}
      >
        {label}
      </span>
    </span>
  )
}
