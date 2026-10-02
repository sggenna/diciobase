import type * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { type PageMotion, pageVariants } from "@/lib/pageMotion"

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
        onExitComplete={() => window.scrollTo({ top: 0 })}
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
