import type * as React from "react"
import { motion } from "motion/react"
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

export function MobileBottomNav({
  active,
  onChange,
}: {
  active: MobileTab
  onChange: (t: MobileTab) => void
}) {
  return (
    <nav
      aria-label="Navegação"
      className="fixed left-0 right-0 bottom-0 z-50 flex px-3"
      style={{
        fontFamily: "var(--font-sf)",
        height: "calc(64px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "rgba(249,249,251,0.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className="relative flex-1 flex flex-col items-center justify-center gap-[3px] pt-1 transition-[color,scale] duration-200 active:scale-[0.94]"
            style={{
              color: isActive ? "var(--color-ink)" : "#8e8e93",
              fontSize: 10,
              fontWeight: 500,
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-dot"
                className="absolute top-0 h-[2px] w-8 rounded-full bg-ink"
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <svg
              width="24"
              height="24"
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
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
