// The preview image: satori lays the card out and turns its text into paths,
// resvg turns that into a PNG. The site's own serif is the reader's system font
// (New York on Apple devices), which can't be shipped or used on a server, so
// the card is set in the next face of that same font stack, Source Serif 4,
// with Inter standing in for the interface's SF. Both are OFL and travel with
// the server, so the card looks the same on any host.
import { Resvg } from "@resvg/resvg-js"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import satori from "satori"
import { TtlCache } from "../cache.ts"
import { OG_HEIGHT, OG_WIDTH, SITE_DESCRIPTION } from "./head.ts"
import type { WordCard } from "./wordCard.ts"

type Font = { name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" | "italic" }

const require = createRequire(import.meta.url)
let loaded: Font[] | null = null

function fonts(): Font[] {
  if (loaded) return loaded
  const face = (name: string, pkg: string, file: string, weight: Font["weight"], style: Font["style"]): Font[] =>
    ["latin", "latin-ext"].map((subset) => ({
      name,
      weight,
      style,
      data: readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}-${subset}-${weight}-${style}.woff`)),
    }))
  loaded = [
    ...face("Serif", "source-serif-4", "source-serif-4", 400, "normal"),
    ...face("Serif", "source-serif-4", "source-serif-4", 500, "normal"),
    ...face("Serif", "source-serif-4", "source-serif-4", 600, "normal"),
    ...face("Serif", "source-serif-4", "source-serif-4", 400, "italic"),
    ...face("Sans", "inter", "inter", 400, "normal"),
    ...face("Sans", "inter", "inter", 500, "normal"),
  ]
  return loaded
}

// The product's tokens (src/index.css).
const INK = "#1a1a1a"
const META = "#4a4a4a"
const MUTED = "#6e6e73"
const HAIRLINE = "#e8e8e8"
const MARGIN = 72

type Node = { type: string; props: { style?: Record<string, unknown>; children?: Child | Child[] } }
type Child = Node | string | null | undefined | false

const el = (style: Record<string, unknown>, ...children: Child[]): Node => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children: children.filter(Boolean) },
})

/** Characters no bundled face has would come out as empty boxes, so an entry holding any goes without them. */
const drawable = (s: string) => s.replace(/[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu, "").replace(/\s+/g, " ").trim()

const wordmark = (size: number, color: string) =>
  el(
    { fontFamily: "Serif", fontWeight: 500, fontSize: size, letterSpacing: "-0.02em", color },
    ...["di", "·", "cio", "·", "ba", "·", "se"].map((part) => el(part === "·" ? { color: MUTED } : {}, part)),
  )

/** Long words shrink to stay on one line, like the headword at the top of an entry. */
function headwordSize(word: string) {
  const fit = Math.floor((OG_WIDTH - MARGIN * 2) / (Array.from(word).length * 0.5))
  return Math.max(48, Math.min(132, fit))
}

function syllableLine(c: WordCard): Child {
  if (!c.syllables) return null
  const parts = c.syllables.flatMap((s, i) => [
    i > 0 ? el({ color: MUTED }, "·") : null,
    el(i === c.stress ? { color: INK, fontWeight: 600, textDecoration: "underline" } : {}, s),
  ])
  return el({}, ...parts)
}

function wordTree(c: WordCard): Node {
  const definition = c.definition ? drawable(c.definition) : ""
  return el(
    { width: OG_WIDTH, height: OG_HEIGHT, boxSizing: "border-box", flexDirection: "column", background: "#ffffff", paddingTop: 56, paddingLeft: MARGIN, paddingRight: MARGIN, paddingBottom: 44, fontFamily: "Serif" },
    el(
      { flexDirection: "column", flexGrow: 1, minHeight: 0 },
      el({ fontSize: headwordSize(c.word), fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.06, color: INK }, drawable(c.word) || c.word),
      el(
        { fontSize: 34, lineHeight: 1.3, color: META, marginTop: 18, columnGap: 24, flexWrap: "wrap", alignItems: "baseline" },
        syllableLine(c),
        c.pos && el({ fontStyle: "italic" }, c.pos),
      ),
      definition
        ? {
            type: "div",
            props: {
              style: { display: "block", marginTop: 34, fontSize: 42, lineHeight: 1.32, color: INK, lineClamp: 3 },
              children: definition,
            },
          }
        : null,
    ),
    el(
      { flexShrink: 0, alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${HAIRLINE}`, paddingTop: 22 },
      wordmark(30, INK),
      c.source ? el({ fontFamily: "Sans", fontSize: 22, color: MUTED }, `${c.source.name} · ${c.source.license}`) : null,
    ),
  )
}

function siteTree(): Node {
  return el(
    { width: OG_WIDTH, height: OG_HEIGHT, boxSizing: "border-box", flexDirection: "column", justifyContent: "center", background: "#ffffff", paddingLeft: MARGIN, paddingRight: MARGIN, fontFamily: "Serif" },
    wordmark(120, INK),
    el({ fontFamily: "Serif", fontSize: 42, lineHeight: 1.32, color: META, marginTop: 34, maxWidth: 980 }, SITE_DESCRIPTION),
  )
}

async function toPng(tree: Node): Promise<Buffer> {
  const svg = await satori(tree as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts: fonts() })
  // Satori has already turned the text into paths: left on, resvg's font scan alone takes seconds.
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH }, font: { loadSystemFonts: false } }).render().asPng()
}

// A render takes tens of milliseconds of CPU, and a card only changes when the data is reimported.
const cache = new TtlCache<Buffer>(500, 6 * 60 * 60 * 1000)

export async function wordImage(card: WordCard): Promise<Buffer> {
  const key = card.word.normalize("NFC")
  const hit = cache.get(key)
  if (hit) return hit
  const png = await toPng(wordTree(card))
  cache.set(key, png)
  return png
}

export async function siteImage(): Promise<Buffer> {
  const hit = cache.get("\0site")
  if (hit) return hit
  const png = await toPng(siteTree())
  cache.set("\0site", png)
  return png
}
