import { useStructure } from "@/components/definition/structure"
import { PART_META, type EntryPart, type PartKind } from "@/lib/microstructure"

const COLOR: Record<PartKind, string> = {
  cabeca: "var(--c-cabeca)",
  classe: "var(--c-classe)",
  etimologia: "var(--c-etimologia)",
  acepcoes: "var(--c-acepcoes)",
  exemplos: "var(--c-exemplos)",
  rubricas: "var(--c-rubricas)",
  remissoes: "var(--c-remissoes)",
  notas: "var(--c-notas)",
}

/**
 * The parts of this dictionary's entry, in its own order, as one track. It shows
 * only in Estrutura, where it is also the legend, and it appears in space Leitura
 * leaves empty, so the text below never moves. Each segment jumps to its part.
 */
export function SequenceStrip({
  parts,
  dictName,
  hot,
  onHot,
  onPick,
}: {
  parts: EntryPart[]
  dictName: string
  /** The component being pointed at. */
  hot: PartKind | null
  onHot: (k: PartKind | null) => void
  onPick: (k: PartKind) => void
}) {
  const { mode } = useStructure()
  const on = mode === "estrutura"
  return (
    <div className="seq-row">
      <nav
        aria-label={`Componentes deste verbete, na ordem do ${dictName}`}
        className="seq-nav"
        data-on={on || undefined}
        inert={!on}
      >
        <span className="seq-order" aria-hidden="true">
          Ordem do {dictName}
        </span>
        <ul className="seq">
          {parts.map((p) => (
            <li key={p.kind}>
              <button
                type="button"
                className="seq-chip"
                style={{ ["--chip-dot" as string]: COLOR[p.kind] }}
                data-current={hot === p.kind || undefined}
                title={`Ir para ${PART_META[p.kind].label}: ${PART_META[p.kind].hint}`}
                onPointerEnter={() => onHot(p.kind)}
                onPointerLeave={() => onHot(null)}
                onFocus={() => onHot(p.kind)}
                onBlur={() => onHot(null)}
                onClick={() => onPick(p.kind)}
              >
                <span className="seq-chip__swatch" aria-hidden="true" />
                {PART_META[p.kind].chip}
                {p.count !== undefined && <span className="seq-chip__n">{p.count}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
