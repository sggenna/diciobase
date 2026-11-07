import type * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { type PageMotion, pageVariants } from "@/lib/pageMotion"
import { takeScrollTarget } from "@/lib/router"

export function PageTransition({
  pageKey,
  motion: pageMotion,
  children,
}: {
  pageKey: string
  motion: PageMotion
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-clip">
      <AnimatePresence
        mode="wait"
        initial={false}
        custom={pageMotion}
        onExitComplete={() => {
          const y = takeScrollTarget()
          // Coming back with Back/Forward: land where the page was left, once it has mounted and has its height.
          if (y > 0) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" })))
          else window.scrollTo({ top: 0 })
        }}
      >
        <motion.div
          key={pageKey}
          custom={pageMotion}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{ transformOrigin: "50% 0%" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
