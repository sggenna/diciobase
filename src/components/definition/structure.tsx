import { createContext, useContext, type CSSProperties, type ReactNode } from "react"
import { PART_META, type PartKind } from "@/lib/microstructure"

export type ViewMode = "leitura" | "estrutura"

interface StructureState {
  mode: ViewMode
  /** The component being pointed at (strip chip or entry part), if any. */
  hot: PartKind | null
  setHot: (k: PartKind | null) => void
}

const StructureContext = createContext<StructureState>({ mode: "leitura", hot: null, setHot: () => {} })
export const StructureProvider = StructureContext.Provider
export const useStructure = () => useContext(StructureContext)

/**
 * Marks a piece of an entry as one microstructure component. In Leitura nothing
 * shows. In Estrutura a 2px rule draws beside it and its label slides in from
 * the margin. Both are absolute and always mounted, so the text stays exactly
 * where it was: this is the point of the toggle.
 */
export function Part({
  kind,
  children,
  className = "",
  style,
  interactive = false,
  title,
  labels,
  order = 0,
  labelTop,
}: {
  kind: PartKind
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** The part holds buttons of its own, so it is not a tab stop itself. */
  interactive?: boolean
  /** Accessible name, e.g. "Acepção 2". */
  title?: string
  /** Margin labels. Each carries its own part's color; none means the rule alone. */
  labels?: { text: string; kind?: PartKind }[]
  /** Position in the top-to-bottom stagger as the labels arrive. */
  order?: number
  /** Nudges the label to sit on the block's first line. */
  labelTop?: number
}) {
  const { mode, hot, setHot } = useStructure()
  const structure = mode === "estrutura"
  const name = title ?? PART_META[kind].label
  return (
    <div
      data-part={kind}
      data-mode={mode}
      data-hot={hot === kind || undefined}
      className={`part ${className}`}
      style={{ ["--part-i" as string]: order, ...(labelTop !== undefined ? { ["--label-top" as string]: `${labelTop}px` } : {}), ...style }}
      tabIndex={structure && !interactive ? 0 : undefined}
      role={structure ? "group" : undefined}
      aria-label={structure ? name : undefined}
      // over/out (not enter/leave) so the innermost part under the pointer wins.
      onPointerOver={structure ? (e) => { e.stopPropagation(); setHot(kind) } : undefined}
      onPointerOut={structure ? (e) => { e.stopPropagation(); setHot(null) } : undefined}
      onFocus={structure ? (e) => { e.stopPropagation(); setHot(kind) } : undefined}
      onBlur={structure ? (e) => { e.stopPropagation(); setHot(null) } : undefined}
    >
      <span className="part__rule" aria-hidden="true" />
      {labels && labels.length > 0 && (
        <span className="part__labels" aria-hidden="true">
          {labels.map((l) => (
            <span key={l.text} className="part__label" data-part={l.kind ?? kind}>
              {l.text}
            </span>
          ))}
        </span>
      )}
      {children}
    </div>
  )
}
