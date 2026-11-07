// The geometry behind the Home orbits. Every ring turns once per loop, and each card breathes within
// a known range around its place. That makes "never overlaps" provable rather than hoped for: each
// candidate layout is walked through the full loop, with every card at both ends of its breath, against
// measured boxes before anything is shown. The first one that stays clear wins. If none does, no cards show.

export interface Rect {
  x0: number
  y0: number
  x1: number
  y1: number
}
export interface Size {
  w: number
  h: number
}
export interface Slot {
  /** Index into the list of cards on the page. */
  card: number
  ring: number
  /** Starting position along the ring, 0..1 of its length. */
  f0: number
  tilt: number
  fade: number
  /** Fixed offset from the ring, as a fraction of its radius. */
  radial: number
  breathPeriod: number
  breathPhase: number
}
export interface Ring {
  cx: number
  cy: number
  xs: Float32Array
  ys: Float32Array
}
export interface OrbitLayout {
  rings: Ring[]
  slots: Slot[]
  /** Overall card scale, on top of depth. */
  k: number
  yTop: number
  yBottom: number
  exponent: number
  /** How much of the angle jitter is in use, 0..1. */
  jitter: number
  /** How much of the radial variation is in use on each axis, 0..1. */
  spreadX: number
  spreadY: number
}
export interface OrbitInput {
  width: number
  height: number
  /** Everything a card may not touch: headline, search, chips. */
  obstacles: Rect[]
  /** Usable vertical band, between the nav and the footer or bottom nav. */
  top: number
  bottom: number
  /** Cards per dictionary, in dictionary order, with their measured sizes. */
  groups: number[][]
  sizes: Size[]
  phone: boolean
}

/** Clearance between any two boxes. A hovered card grows 8%, which this has to absorb. */
export const GAP = 12
export const HOVER_SCALE = 1.08
const SAMPLES = 480
const LUT = 720
const FADES = [1, 0.85, 0.7]
interface Plan {
  rings: number
  perRing: number
  /** Ring offsets, in fractions of one card spacing, so each ring's cards sit in its neighbour's gaps. */
  offsets: number[]
}
// Inner and outer cards travel side by side, which takes two rows of cards above and below the content.
const NESTED = [0, 0.45, 0]
// Every ring out of step with the others: the same cards fit where only one row does.
const STAGGERED = [0, 1 / 3, 2 / 3]
const TWO = [0, 0.45]
const ONE = [0]
const DESKTOP_PLANS: Plan[] = [
  { rings: 3, perRing: 4, offsets: NESTED },
  { rings: 3, perRing: 4, offsets: STAGGERED },
  { rings: 3, perRing: 3, offsets: STAGGERED },
  { rings: 2, perRing: 4, offsets: TWO },
  { rings: 2, perRing: 3, offsets: TWO },
  { rings: 1, perRing: 6, offsets: ONE },
  { rings: 1, perRing: 4, offsets: ONE },
  { rings: 1, perRing: 3, offsets: ONE },
]
const PHONE_PLANS: Plan[] = [
  { rings: 3, perRing: 3, offsets: STAGGERED },
  { rings: 3, perRing: 2, offsets: STAGGERED },
  { rings: 2, perRing: 3, offsets: TWO },
  { rings: 2, perRing: 2, offsets: TWO },
  { rings: 1, perRing: 4, offsets: ONE },
  { rings: 1, perRing: 3, offsets: ONE },
  { rings: 1, perRing: 2, offsets: ONE },
]
// Round enough that cards curve along the edges instead of riding them in rows. Squarer curves are only for
// screens where the rounder one would have to leave the page to clear the content.
const EXPONENTS = [2.6, 3, 3.5, 4]
/** Card size and organic variation, best first: a slightly smaller card beats losing the variation. */
const TUNINGS = [
  [1, 1],
  [0.88, 1],
  [1, 0.75],
  [0.88, 0.75],
  [0.78, 1],
  [1, 0.5],
  [0.88, 0.5],
  [0.78, 0.75],
  [0.78, 0.5],
  [1, 0.25],
  [0.88, 0.25],
  [0.78, 0.25],
  [1, 0],
  [0.88, 0],
  [0.78, 0],
] as const

const RADIAL = 0.03
const BREATH = 0.015
const MAX_RADIAL = RADIAL + BREATH
const ANGLE = 0.12
const BREATH_MIN = 12
const BREATH_MAX = 20
const SHORT_WIDE = 1.7

/** A repeatable number in -1..1, so every visit has the same arrangement. */
function seeded(id: number, salt: number) {
  const x = Math.sin(id * 127.1 + salt * 311.7) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

/** Far cards are small, near ones larger. `dz` runs 0 (top) to 1 (bottom). */
export const depthScale = (dz: number) => 0.58 + dz * 0.26
export const depthOf = (y: number, l: Pick<OrbitLayout, "yTop" | "yBottom">) =>
  Math.min(1, Math.max(0, (y - l.yTop) / Math.max(1, l.yBottom - l.yTop)))
export const rotationOf = (tilt: number, dz: number) => tilt + (dz * 2 - 1) * 4

/**
 * A superellipse with points spaced evenly along its length, not its angle. The raw parametrisation
 * races through the sides and lingers at the corners; this way a card keeps one steady speed and the
 * spacing between cards on a ring truly never changes.
 */
function buildRing(cx: number, cy: number, rx: number, ry: number, n: number): Ring {
  const steps = LUT * 8
  const px = new Float32Array(steps + 1)
  const py = new Float32Array(steps + 1)
  const dist = new Float32Array(steps + 1)
  const e = 2 / n
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    px[i] = cx + rx * Math.sign(c) * Math.abs(c) ** e
    py[i] = cy + ry * Math.sign(s) * Math.abs(s) ** e
    if (i) dist[i] = dist[i - 1]! + Math.hypot(px[i]! - px[i - 1]!, py[i]! - py[i - 1]!)
  }
  const total = dist[steps]!
  const xs = new Float32Array(LUT)
  const ys = new Float32Array(LUT)
  let j = 0
  for (let i = 0; i < LUT; i++) {
    const d = (i / LUT) * total
    while (j < steps && dist[j + 1]! < d) j++
    const span = dist[j + 1]! - dist[j]! || 1
    const t = (d - dist[j]!) / span
    xs[i] = px[j]! + (px[j + 1]! - px[j]!) * t
    ys[i] = py[j]! + (py[j + 1]! - py[j]!) * t
  }
  return { cx, cy, xs, ys }
}

export function pointOn(ring: Ring, f: number): [number, number] {
  const u = ((f % 1) + 1) % 1
  const p = u * LUT
  const i = Math.floor(p) % LUT
  const next = (i + 1) % LUT
  const t = p - Math.floor(p)
  return [ring.xs[i]! + (ring.xs[next]! - ring.xs[i]!) * t, ring.ys[i]! + (ring.ys[next]! - ring.ys[i]!) * t]
}

/** A card's breath right now, -1..1, from a clock in seconds. */
export const breathOf = (slot: Slot, seconds: number) => Math.sin((seconds / slot.breathPeriod) * Math.PI * 2 + slot.breathPhase)

/** Where a slot is at a given phase and breath. */
export function placeSlot(l: OrbitLayout, slot: Slot, phase: number, breath = 0) {
  const ring = l.rings[slot.ring]!
  const [px, py] = pointOn(ring, slot.f0 + phase)
  const m = slot.radial + BREATH * breath
  const x = ring.cx + (px - ring.cx) * (1 + m * l.spreadX)
  const y = ring.cy + (py - ring.cy) * (1 + m * l.spreadY)
  const dz = depthOf(y, l)
  return { x, y, dz, scale: depthScale(dz) * l.k, rotation: rotationOf(slot.tilt, dz) }
}

function boxAt(l: OrbitLayout, slot: Slot, size: Size, phase: number, breath: number): Rect {
  const { x, y, scale, rotation } = placeSlot(l, slot, phase, breath)
  const r = (Math.abs(rotation) * Math.PI) / 180
  const hw = (scale * (size.w * Math.cos(r) + size.h * Math.sin(r))) / 2
  const hh = (scale * (size.h * Math.cos(r) + size.w * Math.sin(r))) / 2
  return { x0: x - hw, y0: y - hh, x1: x + hw, y1: y + hh }
}

/** Everywhere a card can be at this phase, whatever its breath is doing. */
function boxOf(l: OrbitLayout, slot: Slot, size: Size, phase: number): Rect {
  const a = boxAt(l, slot, size, phase, -1)
  const b = boxAt(l, slot, size, phase, 1)
  return { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }
}

const hits = (a: Rect, b: Rect, gap: number) => a.x0 < b.x1 + gap && b.x0 < a.x1 + gap && a.y0 < b.y1 + gap && b.y0 < a.y1 + gap

/** The whole loop, against everything. A card entirely off screen can't touch anything anyone can see. */
function staysClear(l: OrbitLayout, input: OrbitInput): boolean {
  const boxes: (Rect | null)[] = new Array(l.slots.length)
  for (let s = 0; s < SAMPLES; s++) {
    const phase = s / SAMPLES
    for (let i = 0; i < l.slots.length; i++) {
      const slot = l.slots[i]!
      const box = boxOf(l, slot, input.sizes[slot.card]!, phase)
      if (box.x1 < 0 || box.x0 > input.width) {
        boxes[i] = null
        continue
      }
      boxes[i] = box
      if (box.y0 < input.top + GAP || box.y1 > input.bottom - GAP) return false
      if (input.obstacles.some((o) => hits(box, o, GAP))) return false
      for (let j = 0; j < i; j++) {
        const other = boxes[j]
        if (other && hits(box, other, GAP)) return false
      }
    }
  }
  return true
}

/** Which cards a plan shows. Three rings are one dictionary each; fewer rings take turns, so all three stay present. */
function slotsFor(plan: Plan, groups: number[][], jitter: number): Slot[] {
  const slots: Slot[] = []
  const used = groups.map(() => 0)
  let turn = 0
  for (let ring = 0; ring < plan.rings; ring++) {
    for (let i = 0; i < plan.perRing; i++) {
      let g = ring
      if (plan.rings < groups.length) {
        g = turn++ % groups.length
      }
      const card = groups[g]?.[used[g]!++]
      if (card === undefined) continue
      const id = ring * 10 + i + 1
      slots.push({
        card,
        ring,
        f0: (i + plan.offsets[ring]! + seeded(id, 1) * ANGLE * jitter) / plan.perRing,
        tilt: ((i * 37 + ring * 19) % 26) - 13,
        fade: FADES[ring]!,
        radial: seeded(id, 2) * RADIAL,
        breathPeriod: BREATH_MIN + ((seeded(id, 3) + 1) / 2) * (BREATH_MAX - BREATH_MIN),
        breathPhase: (seeded(id, 4) + 1) * Math.PI,
      })
    }
  }
  return slots
}

/**
 * The most variation an axis can take while staying under half the gap between rings. Each ring's radius
 * gives way to its own variation, so the outer ring stays inside the page and the inner clear of the content.
 */
function spreadFor(variation: number, inner: number, outer: number, rings: number) {
  if (rings === 1) return variation
  for (const share of [1, 0.75, 0.5, 0.25]) {
    const spread = variation * share
    const v = MAX_RADIAL * spread
    const out = outer / (1 + v)
    const gap = (out - inner / (1 - v)) / (rings - 1)
    if (v * out < gap / 2) return spread
  }
  return 0
}

function buildLayout(plan: Plan, k: number, n: number, variation: number, input: OrbitInput, onPage: boolean): OrbitLayout | null {
  const slots = slotsFor(plan, input.groups, variation)
  if (!slots.length) return null
  const cards = slots.map((s) => input.sizes[s.card]!)
  const w = Math.max(...cards.map((c) => c.w)) * k
  const h = Math.max(...cards.map((c) => c.h)) * k
  // Box half-sizes at the steepest tilt in this plan; staysClear checks each card's real one.
  const steepest = ((Math.max(...slots.map((s) => Math.abs(s.tilt))) + 4) * Math.PI) / 180
  const box = (s: number) => ({
    hw: (s * (w * Math.cos(steepest) + h * Math.sin(steepest))) / 2,
    hh: (s * (h * Math.cos(steepest) + w * Math.sin(steepest))) / 2,
  })
  const far = box(depthScale(0))
  const near = box(depthScale(1))
  const side = box(depthScale(0.5))
  const cx = input.width / 2

  const block = input.obstacles.reduce(
    (a, o) => ({ x0: Math.min(a.x0, o.x0), y0: Math.min(a.y0, o.y0), x1: Math.max(a.x1, o.x1), y1: Math.max(a.y1, o.y1) }),
    { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
  )

  const outerTop = input.top + GAP + far.hh
  let outerBottom = input.bottom - GAP - near.hh
  const clearTop = block.y0 - GAP - far.hh * 1.1
  const clearBottom = block.y1 + GAP + near.hh * 0.98
  if (clearTop < outerTop || clearBottom > outerBottom) return null
  const tiers = plan.offsets === NESTED ? { top: far.hh * 2 + GAP, bottom: near.hh * 2 + GAP } : { top: 0, bottom: 0 }
  if (clearTop - outerTop < tiers.top || outerBottom - clearBottom < tiers.bottom) return null

  // Short, wide screens: flatten every ring a little and lift its centre, which pulls cards away from a row along
  // the bottom. The top stays put; the bottom gives up at most half of the room it has spare.
  if (input.width / input.height > SHORT_WIDE) {
    outerBottom -= Math.min(((outerBottom - outerTop) / 2) * 0.12, (outerBottom - clearBottom - tiers.bottom) * 0.5)
  }

  // The inner ring must pass every corner of the content with a whole card's clearance. Each corner, grown by
  // a card's half-size, has to sit inside the curve, which gives the narrowest width that works at a given height.
  // Rising above the content's top lets the curve narrow, so try that in steps until it fits inside the outer ring.
  const minWidth = (top: number, bottom: number) => {
    const centre = (top + bottom) / 2
    const ry = (bottom - top) / 2
    let rx = 0
    for (const o of input.obstacles) {
      const ex = Math.max(cx - o.x0, o.x1 - cx) + GAP + side.hw
      for (const [dy, hh] of [
        [centre - o.y0, far.hh * 1.1],
        [o.y1 - centre, near.hh],
      ] as const) {
        const ey = dy + hh + GAP
        if (ey <= 0) continue
        if (ey >= ry) return Infinity
        rx = Math.max(rx, ex / (1 - (ey / ry) ** n) ** (1 / n))
      }
    }
    return rx
  }
  const highestTop = outerTop + tiers.top
  const lowestBottom = outerBottom - tiers.bottom
  // Rings need gaps to vary within. Raising the inner ring opens room beside the content but closes it above, so
  // take the height that leaves the most variation on both axes. The outer ring may run half off the page's sides.
  const stacked = plan.offsets === NESTED ? side.hw * 2 + GAP : 0
  let best: { top: number; bottom: number; innerX: number; outerX: number; spreadX: number; spreadY: number } | null = null
  let bestScore = -1
  for (const t of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    const top = clearTop + (highestTop - clearTop) * t
    const bottom = clearBottom + (lowestBottom - clearBottom) * t
    const narrowest = minWidth(top, bottom)
    if (!Number.isFinite(narrowest)) continue
    if (onPage && narrowest + stacked > cx) continue
    const outerX = Math.max(cx, narrowest + stacked)
    const innerX = Math.max(narrowest, outerX * 0.64)
    const spreadX = spreadFor(variation, innerX, outerX, plan.rings)
    const spreadY = spreadFor(variation, (bottom - top) / 2, (outerBottom - outerTop) / 2, plan.rings)
    const score = Math.min(spreadX, spreadY) * 2 + spreadX + spreadY
    if (score > bestScore) {
      bestScore = score
      best = { top, bottom, innerX, outerX, spreadX, spreadY }
    }
  }
  if (!best) return null
  const { top: innerTop, bottom: innerBottom, innerX, outerX, spreadX, spreadY } = best
  const giveX = MAX_RADIAL * spreadX
  const giveY = MAX_RADIAL * spreadY

  const last = Math.max(1, plan.rings - 1)
  const rings: Ring[] = []
  for (let r = 0; r < plan.rings; r++) {
    // One ring rides as far out as it can; otherwise rings step from inner to outer.
    const t = plan.rings === 1 ? 1 : r / last
    const top = innerTop + (outerTop - innerTop) * t
    const bottom = innerBottom + (outerBottom - innerBottom) * t
    const rx = innerX + (outerX - innerX) * t
    const fitX = plan.rings === 1 ? 1 / (1 + giveX) : 1 / (1 - giveX) + (1 / (1 + giveX) - 1 / (1 - giveX)) * t
    const fitY = plan.rings === 1 ? 1 / (1 + giveY) : 1 / (1 - giveY) + (1 / (1 + giveY) - 1 / (1 - giveY)) * t
    rings.push(buildRing(cx, (top + bottom) / 2, rx * fitX, ((bottom - top) / 2) * fitY, n))
  }
  return { rings, slots, k, yTop: outerTop, yBottom: outerBottom, exponent: n, jitter: variation, spreadX, spreadY }
}

/** How organic a layout really is, once the gaps between rings have had their say, with a nudge for larger cards. */
const organicScore = (l: OrbitLayout) => (l.jitter + l.spreadX * 2 + l.spreadY * 2) / 5 + (l.k - 0.78) * 0.25

/**
 * The fullest layout that stays clear for the whole loop, or null when no card can. Among layouts showing the
 * same number of cards, the most organic wins. Rings stay on the page if any curve allows it, so a card count
 * means cards a reader sees; only where the content fills the width (phones, tablets) may they run off the sides.
 */
export function solveOrbit(input: OrbitInput): OrbitLayout | null {
  const plans = input.phone ? PHONE_PLANS : DESKTOP_PLANS
  for (const onPage of [true, false]) {
    for (const n of EXPONENTS) {
      let best: OrbitLayout | null = null
      let bestScore = -Infinity
      let count = 0
      for (const plan of plans) {
        const cards = plan.rings * plan.perRing
        // On the page, a full ring of cards is the point: give up the curve before giving up the cards.
        if (onPage && !input.phone && cards < 9) break
        if (best && cards < count) return best
        count = cards
        for (const [k, variation] of TUNINGS) {
          const layout = buildLayout(plan, k, n, variation, input, onPage)
          if (!layout) continue
          const score = organicScore(layout) + (plan.offsets === NESTED ? 0.1 : 0)
          if (score > bestScore && staysClear(layout, input)) {
            best = layout
            bestScore = score
          }
        }
      }
      if (best) return best
    }
  }
  return null
}
