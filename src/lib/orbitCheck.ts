// Development only (loaded behind import.meta.env.DEV, so it never ships). The solver reasons about
// estimated boxes; this walks the real elements through the full loop and reads their real bounding
// boxes, as an independent check that the solver's promise holds on the page. Cards breathe on their own
// clocks, so each sample also sets them to the ends of their breath, in patterns that put every pair of
// cards both in step and in opposition.

export interface OrbitCollision {
  phase: number
  a: string
  b: string
}

const overlap = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

/**
 * `place` puts the cards at a phase; `restore` puts them back. With `hover`, every card is checked at
 * its hovered size, which is stricter than the page can ever be.
 */
export function checkOrbit(opts: {
  cards: HTMLElement[]
  obstacles: () => { name: string; el: Element }[]
  place: (phase: number, hover: boolean, breath: (index: number) => number) => void
  restore: () => void
  samples?: number
  hover?: boolean
}): OrbitCollision[] {
  const samples = opts.samples ?? 480
  const found: OrbitCollision[] = []
  const fixed = opts.obstacles().map((o) => ({ name: o.name, box: o.el.getBoundingClientRect() }))
  const width = window.innerWidth
  for (let s = 0; s < samples; s++) {
    const phase = s / samples
    const flip = s % 8 >= 4 ? -1 : 1
    opts.place(phase, !!opts.hover, (i) => (((i + 1) >> (s % 4)) & 1 ? flip : -flip))
    const boxes = opts.cards
      .map((el) => ({ name: el.dataset.word ?? "card", box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.right > 0 && box.left < width)
    boxes.forEach((card, i) => {
      for (const o of fixed) if (overlap(card.box, o.box)) found.push({ phase, a: card.name, b: o.name })
      for (let j = 0; j < i; j++) if (overlap(card.box, boxes[j]!.box)) found.push({ phase, a: card.name, b: boxes[j]!.name })
    })
  }
  opts.restore()
  return found
}
