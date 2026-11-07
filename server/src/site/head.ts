// The per-page <head> that link previews read. Crawlers don't run JavaScript,
// so these tags have to be in the HTML the server sends. Pure on purpose: the
// Vite dev server imports this file too, so a local fetch matches production.

export const SITE_NAME = "Diciobase"
export const SITE_TITLE = "Diciobase: os dicionários do português em uma só busca"
export const SITE_DESCRIPTION =
  "Encontre o sentido de qualquer palavra no Wikcionário, no Dicionário Aberto e no OpenWordnet-PT, com etimologia, sinônimos e separação silábica."

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

/** Paths with a page behind them that don't depend on the dictionary. */
export const FIXED_PAGES = ["/", "/salvos", "/perfil", "/tutorial"]

export interface PageMeta {
  /** The tab title. */
  title: string
  /** The preview's title, without the site name, which `og:site_name` already carries. */
  ogTitle: string
  description: string
  /** Paths, made absolute when rendered. */
  path: string
  image: string
  imageAlt: string
  /** Extra label/value rows Slack shows under the description. */
  labels?: [string, string][]
  noindex?: boolean
}

export const wordPath = (word: string) => `/palavra/${encodeURIComponent(word.trim().normalize("NFC").toLowerCase())}`
export const wordImagePath = (word: string) => `/og/palavra/${encodeURIComponent(word.trim().normalize("NFC").toLowerCase())}.png`

export const siteMeta = (path = "/"): PageMeta => ({
  title: SITE_TITLE,
  ogTitle: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path,
  image: "/og/default.png",
  imageAlt: `${SITE_NAME}: ${SITE_DESCRIPTION}`,
})

// Points home rather than at itself: a page with nothing on it isn't a canonical address, and the request isn't echoed.
export const missingMeta = (): PageMeta => ({
  ...siteMeta(),
  title: `Palavra não encontrada · ${SITE_NAME}`,
  ogTitle: "Palavra não encontrada",
  noindex: true,
})

const attr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")

export function renderHead(m: PageMeta, origin: string): string {
  const url = origin + m.path
  const image = origin + m.image
  const tag = (kind: "name" | "property", key: string, content: string) => `<meta ${kind}="${key}" content="${attr(content)}" />`
  return [
    `<title>${attr(m.title)}</title>`,
    tag("name", "description", m.description),
    `<link rel="canonical" href="${attr(url)}" />`,
    ...(m.noindex ? [tag("name", "robots", "noindex")] : []),
    tag("property", "og:site_name", SITE_NAME),
    tag("property", "og:locale", "pt_BR"),
    tag("property", "og:type", "website"),
    tag("property", "og:url", url),
    tag("property", "og:title", m.ogTitle),
    tag("property", "og:description", m.description),
    tag("property", "og:image", image),
    tag("property", "og:image:type", "image/png"),
    tag("property", "og:image:width", String(OG_WIDTH)),
    tag("property", "og:image:height", String(OG_HEIGHT)),
    tag("property", "og:image:alt", m.imageAlt),
    tag("name", "twitter:card", "summary_large_image"),
    tag("name", "twitter:title", m.ogTitle),
    tag("name", "twitter:description", m.description),
    tag("name", "twitter:image", image),
    ...(m.labels ?? []).flatMap(([label, value], i) => [tag("name", `twitter:label${i + 1}`, label), tag("name", `twitter:data${i + 1}`, value)]),
  ].join("\n    ")
}

/** Puts the page's tags into the built index.html, replacing the shell's generic ones. */
export function injectHead(html: string, head: string): string {
  // The page's own robots tag, when it has one, wins over the shell's site-wide one.
  const robots = head.includes('name="robots"') ? /<meta\b[^>]*\bname="robots"[^>]*>\s*/i : /$^/
  const shell = html
    .replace(robots, "")
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<link\b[^>]*\brel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*\b(?:name="(?:description|twitter:[^"]*)"|property="og:[^"]*")[^>]*>\s*/gi, "")
  // A function, so a "$" in a definition isn't read as a replacement pattern.
  return shell.replace(/<\/head>/i, () => `${head}\n  </head>`)
}
