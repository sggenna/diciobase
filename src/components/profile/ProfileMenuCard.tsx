import type * as React from "react"
import { Chevron } from "@/components/profile/Chevron"
import { P } from "@/components/profile/profileTheme"

export function ProfileMenuCard({
  rows,
}: {
  rows: {
    label: string
    sub?: string
    icon: React.ReactNode
    badge?: number
    action: () => void
    danger?: boolean
  }[]
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: P.card }}>
      {rows.map((row, i) => (
        <button
          key={row.label}
          onClick={row.action}
          className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
          style={{ borderTop: i > 0 ? `1px solid ${P.border}` : undefined }}
          onPointerEnter={(e) => (e.currentTarget.style.background = P.cardAlt)}
          onPointerLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center"
            style={{
              background: row.danger ? P.dangerBg : P.avatarBg,
              color: row.danger ? P.danger : P.text,
            }}
          >
            {row.icon}
          </div>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span
              style={{
                fontFamily: "'Poppins:Medium'",
                fontSize: 14,
                color: row.danger ? P.danger : P.text,
              }}
            >
              {row.label}
            </span>
            {row.sub && (
              <span
                style={{
                  fontFamily: "'Poppins:Regular'",
                  fontSize: 11,
                  color: P.sub,
                }}
              >
                {row.sub}
              </span>
            )}
          </div>
          {row.badge ? (
            <div
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-accent)" }}
            >
              <span
                style={{
                  fontFamily: "'Poppins:Bold'",
                  fontSize: 10,
                  color: "var(--color-on-ink)",
                }}
              >
                {row.badge}
              </span>
            </div>
          ) : !row.danger ? (
            <Chevron color={P.sub} />
          ) : null}
        </button>
      ))}
    </div>
  )
}
