export function Footer() {
  return (
    <footer
      className="hidden md:block shrink-0 mt-auto px-6 md:px-8"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <div
        className="max-w-[980px] mx-auto flex justify-center md:justify-end pt-5 pb-7"
        style={{
          borderTop: "1px solid #d2d2d7",
          fontSize: 12,
          color: "var(--color-label-secondary)",
        }}
      >
        © 2026 Diciobase. Todos os direitos reservados.
      </div>
    </footer>
  )
}
