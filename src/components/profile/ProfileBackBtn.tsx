import { P } from "@/components/profile/profileTheme"

export function ProfileBackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
      style={{ fontFamily: "'Poppins:Medium'", fontSize: 13, color: P.sub }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Voltar
    </button>
  )
}
