export function Footer({ compact }: { compact?: boolean }) {
  // No rule above it: the credits are the content, and the licences require them.
  return (
    <footer
      className="hidden md:block shrink-0 mt-auto px-6 md:px-8"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <div
        className={`max-w-[980px] mx-auto flex flex-col items-center gap-1 text-center ${compact ? "pt-0 pb-4" : "pt-8 pb-8"}`}
        style={{ fontSize: 12, lineHeight: "16px", color: "var(--color-label-secondary)" }}
      >
        <p>
          Definições de Wikcionário (CC BY-SA 4.0), Dicionário Aberto (CC BY-SA 2.5 PT) e OpenWordnet-PT (CC BY 4.0).
        </p>
        <p>© 2026 Diciobase</p>
      </div>
    </footer>
  )
}
