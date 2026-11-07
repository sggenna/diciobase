import type * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { MobileTab } from "@/lib/types"

const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "pesquisar",
    label: "Pesquisar",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20.5 20.5-4.8-4.8" />
      </>
    ),
  },
  {
    id: "salvos",
    label: "Salvos",
    icon: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
  },
]

/**
 * A floating pill: icons only, with the current page open to show its name. It takes up the same 64px the
 * old bar did, so pages, toasts and the Home orbit keep their room.
 */
export function MobileBottomNav({
  active,
  onChange,
  showAccount = true,
}: {
  active: MobileTab
  /** Off on the static site, which has no accounts. */
  showAccount?: boolean
  onChange: (t: MobileTab) => void
}) {
  const reduced = useReducedMotion()
  const open = reduced ? { duration: 0.15 } : ({ type: "spring", duration: 0.34, bounce: 0.15 } as const)
  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center pointer-events-none"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <nav
        aria-label="Navegação"
        className="pointer-events-auto flex gap-1 p-1 rounded-2xl"
        style={{
          fontFamily: "var(--font-sf)",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 3px -1px rgba(0,0,0,0.1), 0 0 0 1px rgba(25,28,33,0.08)",
        }}
      >
        {tabs.filter((tab) => showAccount || tab.id !== "perfil").map((tab) => {
          const isActive = tab.id === active
          return (
            <motion.button
              key={tab.id}
              layout={!reduced}
              transition={open}
              data-tip={tab.id === "salvos" ? "nav-salvos" : undefined}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
              className="relative flex items-center justify-center h-11 min-w-12 px-3 rounded-xl transition-colors duration-200 active:scale-[0.96]"
              style={{ color: isActive ? "var(--color-ink)" : "var(--color-muted)", fontSize: 14, fontWeight: 500, lineHeight: "20px" }}
            >
              {isActive && <motion.span layoutId="tab-pill" transition={open} className="absolute inset-0 rounded-xl" style={{ background: "#f2f2f4" }} />}
              <svg
                className="relative shrink-0"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={isActive && tab.id === "salvos" ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isActive ? 2 : 1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {tab.icon}
              </svg>
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    aria-hidden="true"
                    className="relative overflow-hidden whitespace-nowrap"
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={open}
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}
