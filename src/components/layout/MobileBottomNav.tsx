import type * as React from "react"
import { MobileTab } from "@/lib/types"

export function MobileBottomNav({
  active,
  onChange,
}: {
  active: MobileTab
  onChange: (t: MobileTab) => void
}) {
  const tabs: {
    id: MobileTab
    label: string
    icon: (active: boolean) => React.ReactNode
  }[] = [
    {
      id: "pesquisar",
      label: "Pesquisar",
      icon: (a) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={a ? "white" : "rgba(255,255,255,0.45)"}
          strokeWidth={a ? 2.2 : 1.8}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7.5" />
          <path d="m20.5 20.5-4.8-4.8" />
        </svg>
      ),
    },
    {
      id: "salvos",
      label: "Salvos",
      icon: (a) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={a ? "white" : "none"}
          stroke={a ? "white" : "rgba(255,255,255,0.45)"}
          strokeWidth={a ? 2 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: (a) => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={a ? "white" : "rgba(255,255,255,0.45)"}
          strokeWidth={a ? 2.2 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
    >
      <nav
        className="flex items-center gap-1 px-2 py-2 rounded-[100px]"
        style={{
          background: "#1c1b19",
          boxShadow: "0 8px 32px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex items-center gap-2 rounded-[100px] transition-all duration-200"
              style={{
                padding: isActive ? "10px 18px" : "10px 14px",
                background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.transform = "scale(0.93)"
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              {tab.icon(isActive)}
              {isActive && (
                <span
                  style={{
                    fontFamily: "'Poppins:SemiBold'",
                    fontSize: 13,
                    color: "white",
                    letterSpacing: "-0.2px",
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
