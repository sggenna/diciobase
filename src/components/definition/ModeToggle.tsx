import { motion, useReducedMotion } from "motion/react"
import type { ViewMode } from "@/components/definition/structure"

const OPTIONS: { id: ViewMode; label: string }[] = [
  { id: "leitura", label: "Leitura" },
  { id: "estrutura", label: "Estrutura" },
]

/** Leitura: the calm reading view. Estrutura: the same entry, components marked. */
export function ModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const reduce = useReducedMotion()
  return (
    <div role="group" aria-label="Modo de visualização" data-tip="def-structure" className="mode-toggle shrink-0">
      {OPTIONS.map((o) => (
        <button key={o.id} type="button" aria-pressed={mode === o.id} onClick={() => onChange(o.id)}>
          {mode === o.id && (
            <motion.span
              layoutId="mode-thumb"
              className="mode-toggle__thumb"
              transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          {o.label}
        </button>
      ))}
    </div>
  )
}
