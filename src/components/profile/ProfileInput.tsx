import { P } from "@/components/profile/profileTheme"

export function ProfileInput({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        style={{
          fontFamily: "'Poppins:SemiBold'",
          fontSize: 10,
          color: P.sub,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[50px] px-4 rounded-[14px] outline-none transition-all duration-200"
        style={{
          fontFamily: "'Poppins:Regular'",
          fontSize: 15,
          color: P.text,
          background: P.inputBg,
          border: `1px solid ${P.borderMid}`,
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")
        }
        onBlur={(e) => (e.currentTarget.style.borderColor = P.borderMid)}
      />
    </div>
  )
}
