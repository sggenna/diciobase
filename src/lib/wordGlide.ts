// Word to word: the word you clicked rises into the headword position of its own entry. A copy of it flies
// over the page change, aiming at the real headword wherever that is on each frame, then hands over to it.
const DURATION = 520
const GIVE_UP = 1500
const ease = (t: number) => 1 - (1 - t) ** 4

const headword = (word: string) =>
  [...document.querySelectorAll<HTMLElement>("[data-headword]")].find((el) => el.textContent?.trim().toLowerCase() === word.toLowerCase()) ?? null

export function glideWord(word: string, from: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const start = from.getBoundingClientRect()
  const startSize = parseFloat(getComputedStyle(from).fontSize)
  const copy = document.createElement("span")
  copy.textContent = word
  copy.setAttribute("aria-hidden", "true")
  Object.assign(copy.style, {
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: "60",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    transformOrigin: "0 0",
    fontFamily: "var(--font-serif)",
    fontWeight: "500",
    letterSpacing: "-0.03em",
    lineHeight: "1",
    color: "var(--color-ink)",
    willChange: "transform",
  })
  const place = (x: number, y: number, scale: number) => {
    copy.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
  }
  copy.style.fontSize = `${startSize}px`
  place(start.left, start.top + (start.height - startSize) / 2, 1)
  document.body.appendChild(copy)

  const began = performance.now()
  let landedAt = 0
  let hidden: HTMLElement | null = null
  function finish() {
    if (hidden) hidden.style.visibility = ""
    copy.remove()
  }
  function frame(now: number) {
    const target = headword(word)
    if (!target) {
      // The page may not be up yet. A hidden copy can have been replaced (loading to loaded), so keep looking.
      if (now - began > GIVE_UP) return finish()
      return void requestAnimationFrame(frame)
    }
    if (hidden !== target) {
      if (hidden) hidden.style.visibility = ""
      hidden = target
      target.style.visibility = "hidden"
    }
    landedAt ||= now
    const size = parseFloat(getComputedStyle(target).fontSize)
    const box = target.getBoundingClientRect()
    const t = ease(Math.min(1, (now - landedAt) / DURATION))
    copy.style.fontSize = `${size}px`
    const x0 = start.left
    const y0 = start.top + (start.height - startSize) / 2
    place(x0 + (box.left - x0) * t, y0 + (box.top - y0) * t, startSize / size + (1 - startSize / size) * t)
    if (t >= 1) return finish()
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
