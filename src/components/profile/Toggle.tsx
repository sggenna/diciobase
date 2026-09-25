export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="shrink-0 rounded-full flex items-center px-[3px] transition-colors duration-200"
      style={{
        width: 44,
        height: 26,
        background: on ? "var(--color-ink)" : "var(--color-border)",
      }}
    >
      <div
        className="rounded-full transition-transform duration-200"
        style={{
          width: 20,
          height: 20,
          background: "#fff",
          boxShadow: "var(--shadow-sm)",
          transform: on ? "translateX(18px)" : "translateX(0)",
        }}
      />
    </button>
  )
}
