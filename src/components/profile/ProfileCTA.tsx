import { P } from "@/components/profile/profileTheme";

export function ProfileCTA({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className="w-full h-[50px] rounded-[16px] transition-all duration-200 active:scale-[0.98]"
      style={{
        fontFamily: "'Poppins:SemiBold'", fontSize: 15,
        background: danger ? P.dangerBg : P.text,
        color: danger ? P.danger : "#1c1b19",
        border: danger ? `1px solid ${P.danger}30` : "none",
      }}>
      {label}
    </button>
  );
}
