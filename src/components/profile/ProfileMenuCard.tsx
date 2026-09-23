import type * as React from "react";
import { Chevron } from "@/components/profile/Chevron";
import { MC } from "@/components/profile/profileTheme";

export function ProfileMenuCard({ rows }: { rows: { label: string; sub?: string; icon: React.ReactNode; badge?: number; action: () => void; danger?: boolean }[] }) {
  return (
    <div className="rounded-[22px] overflow-hidden" style={{ background: MC.bg }}>
      {rows.map((row, i) => (
        <button key={row.label} onClick={row.action}
          className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
          style={{ borderTop: i > 0 ? `1px solid ${MC.border}` : undefined }}
          onPointerEnter={e => (e.currentTarget.style.background = MC.row)}
          onPointerLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div className="shrink-0 w-9 h-9 rounded-[11px] flex items-center justify-center"
            style={{ background: row.danger ? MC.dangerBg : MC.iconBg, color: row.danger ? MC.danger : MC.text }}>
            {row.icon}
          </div>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: row.danger ? MC.danger : MC.text }}>{row.label}</span>
            {row.sub && <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 11, color: MC.sub }}>{row.sub}</span>}
          </div>
          {row.badge ? (
            <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#24456B" }}>
              <span style={{ fontFamily: "'Poppins:Bold'", fontSize: 10, color: "white" }}>{row.badge}</span>
            </div>
          ) : !row.danger ? <Chevron color={MC.sub} /> : null}
        </button>
      ))}
    </div>
  );
}
