export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="shrink-0 rounded-full flex items-center px-[3px] transition-all duration-200"
      style={{ width: 44, height: 26, background: on ? "#f5f2eb" : "rgba(255,255,255,0.12)" }}>
      <div className="rounded-full transition-all duration-200"
        style={{ width: 20, height: 20, background: on ? "#1c1b19" : "rgba(255,255,255,0.35)", transform: on ? "translateX(18px)" : "translateX(0)" }} />
    </button>
  );
}
