import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion } from "motion/react"
import { SourceDot } from "@/components/definition/SourceDots"
import { peekWord } from "@/lib/words"
import type { WordData } from "@/lib/types"

const WIDTH = 280
const MARGIN = 12

/** The word's first definition, so a synonym can be checked without leaving the entry you're reading. */
export function WordPreview({ id, word, source, anchor }: { id: string; word: string; source?: string; anchor: DOMRect }) {
  const [data, setData] = useState<WordData | null | undefined>(undefined)
  useEffect(() => {
    let live = true
    void peekWord(word).then((d) => live && setData(d))
    return () => {
      live = false
    }
  }, [word])

  const withText = data?.dicts.filter((d) => d.senses.length) ?? []
  const dict = withText.find((d) => d.id === source) ?? withText[0]
  const left = Math.max(MARGIN, Math.min(window.innerWidth - WIDTH - MARGIN, anchor.left + anchor.width / 2 - WIDTH / 2))
  const above = anchor.top > 180

  return createPortal(
    <motion.div
      id={id}
      role="tooltip"
      initial={{ opacity: 0, y: above ? 4 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="word-preview"
      style={{ left, width: WIDTH, ...(above ? { bottom: window.innerHeight - anchor.top + 8 } : { top: anchor.bottom + 8 }) }}
    >
      <p className="word-preview__word">{word}</p>
      {data === undefined ? (
        <div className="flex flex-col gap-2 mt-2" aria-hidden="true">
          <div className="h-3 rounded-xs bg-black/[0.06] w-full" />
          <div className="h-3 rounded-xs bg-black/[0.06] w-2/3" />
        </div>
      ) : dict ? (
        <>
          <p className="word-preview__def">{dict.senses[0]!.text}</p>
          <p className="word-preview__src">
            <SourceDot id={dict.id} />
            {dict.shortName}
          </p>
        </>
      ) : (
        <p className="word-preview__def">Sem definição nos dados abertos.</p>
      )}
    </motion.div>,
    document.body,
  )
}
