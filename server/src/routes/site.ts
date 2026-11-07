// The website side of the server: pages whose <head> names the word, and their
// preview images. The API's own routes stay JSON-only under /api.
import express, { type NextFunction, type Request, type Response, Router } from "express"
import { existsSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { config, isProd } from "../config.ts"
import { logger } from "../logger.ts"
import { imageLimiter } from "../middleware/rateLimit.ts"
import { word as wordSchema } from "../schemas.ts"
import { FIXED_PAGES, injectHead, missingMeta, type PageMeta, renderHead, siteMeta } from "../site/head.ts"
import { siteImage, wordImage } from "../site/ogImage.ts"
import { cardFromEntry, type CardEntry, metaFromCard, type WordCard } from "../site/wordCard.ts"
import { loadEntry } from "./words.ts"

const distDir = () => process.env.SITE_DIST ?? resolve(import.meta.dirname, "../../../dist")

/** The first entry's card, or null when the dictionaries don't have the word. */
export async function cardFor(raw: string): Promise<WordCard | null> {
  const w = wordSchema.safeParse(raw)
  if (!w.success) return null
  const body = (await loadEntry(w.data)) as { entries: CardEntry[] } | null
  const entry = body?.entries[0]
  return entry ? cardFromEntry(entry) : null
}

/** Where this site lives, for the absolute URLs previews require. Never the Host header in production. */
function originOf(req: Request) {
  if (config.SITE_URL) return config.SITE_URL
  if (isProd) return config.CORS_ORIGINS[0]!
  return `${req.protocol}://${req.get("host")}`
}

const publicLong = "public, max-age=86400, stale-while-revalidate=604800"

function sendPng(res: Response, png: Buffer) {
  res.removeHeader("Pragma")
  res.setHeader("Cache-Control", publicLong)
  // Link-preview proxies and other sites' pages load this: it's public by design.
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
  res.type("png").send(png)
}

// The built page, kept once read. Read per request outside production so a rebuild shows up.
let shell: string | null = null
function readShell(): string | null {
  if (shell && isProd) return shell
  const file = join(distDir(), "index.html")
  if (!existsSync(file)) return null
  shell = readFileSync(file, "utf8")
  return shell
}

// The app's own policy; the API's blanket default-src 'none' would blank the page.
const PAGE_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Motion and the components set inline styles throughout.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  // index.css loads Poppins from Figma's CDN.
  "font-src 'self' https://static.figma.com",
  "connect-src 'self'",
  // Pronunciations play straight from Wikimedia; data: is the silent clip that unlocks audio on iPhones.
  "media-src 'self' data: https://upload.wikimedia.org",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ")

function sendPage(req: Request, res: Response, meta: PageMeta, status: number, cacheable: boolean) {
  const html = readShell()
  if (!html) {
    // No build next to this server (the site is hosted elsewhere): the API stays JSON-only.
    res.status(404).json({ error: "not_found" })
    return
  }
  res.removeHeader("Pragma")
  res.setHeader("Content-Security-Policy", PAGE_CSP)
  // Browsers revalidate so a deploy shows at once; a CDN in front may hold it briefly. Never personal: the page is the same for everyone.
  res.setHeader("Cache-Control", cacheable ? "public, max-age=0, must-revalidate, s-maxage=600" : "no-store")
  res.status(status).type("html").send(injectHead(html, renderHead(meta, originOf(req))))
}

// A preview is worth a short wait, but a person opening the page must not hang on a slow database.
const META_TIMEOUT_MS = 2000
const timeout = () =>
  new Promise<"timeout">((r) => {
    setTimeout(() => r("timeout"), META_TIMEOUT_MS).unref()
  })

/** Hashed build files never change; the rest of public/ may. Mounted ahead of the API's no-store. */
export const siteAssets = (req: Request, res: Response, next: () => void) =>
  express.static(distDir(), {
    index: false,
    setHeaders: (r, path) => {
      r.setHeader("Cache-Control", /-[\w-]{8,}\.(?:js|css)$/.test(path) ? "public, max-age=31536000, immutable" : "public, max-age=3600")
    },
  })(req, res, next)

export const site = Router()

site.get("/og/default.png", imageLimiter, async (_req, res) => {
  sendPng(res, await siteImage())
})

site.get("/og/palavra/:file", imageLimiter, async (req, res) => {
  const file = String(req.params.file)
  const card = file.endsWith(".png") ? await cardFor(file.slice(0, -4)) : null
  if (!card) {
    res.status(404).json({ error: "not_found" })
    return
  }
  sendPng(res, await wordImage(card))
})

site.get("/palavra/:word", async (req, res) => {
  const path = req.path
  try {
    const card = await Promise.race([cardFor(String(req.params.word)), timeout()])
    if (card === "timeout") sendPage(req, res, siteMeta(path), 200, false)
    else if (!card) sendPage(req, res, missingMeta(), 404, true)
    else sendPage(req, res, metaFromCard(card), 200, true)
  } catch (e) {
    // The app can still load and say so itself; only the preview is lost.
    logger.warn({ code: (e as { code?: string }).code, reqId: req.id }, "word meta unavailable")
    sendPage(req, res, siteMeta(path), 200, false)
  }
})

site.get(FIXED_PAGES, (req, res) => {
  sendPage(req, res, siteMeta(req.path), 200, true)
})

// Any other page address gets the app, which goes home, with an honest status.
site.get(/^(?!\/api(?:\/|$))(?:[^.]*)$/, (req, res) => {
  sendPage(req, res, { ...siteMeta(), noindex: true }, 404, true)
})

// An address with broken percent-encoding fails before any handler runs. It's a dead link, not a server error.
site.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof URIError) sendPage(req, res, missingMeta(), 404, true)
  else next(err)
})
