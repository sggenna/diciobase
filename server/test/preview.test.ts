import assert from "node:assert/strict"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, before, describe, it } from "node:test"
import { pool } from "../src/db.ts"
import { injectHead, renderHead, siteMeta, wordPath } from "../src/site/head.ts"
import { wordImage } from "../src/site/ogImage.ts"
import { cardFromEntry, type CardEntry, metaFromCard } from "../src/site/wordCard.ts"
import { pickRecording, rankFile } from "../src/pronunciation.ts"
import { startServer } from "./helpers.ts"

const SHELL = `<!doctype html><html lang="pt-BR"><head>
<title>Genérico</title>
<meta name="description" content="genérica">
<meta name="robots" content="noindex, nofollow">
<meta property="og:title" content="Genérico">
<script type="module" src="/assets/index-abc12345.js"></script>
</head><body><div id="root"></div></body></html>`

const entry = (over: Partial<CardEntry>): CardEntry => ({ word: "palavra", tags: [], senses: [], dictionaries: [], sources: [], ...over })
const prose = (name: string, entries: [string | null, string[]][]) => ({
  name,
  license: "CC BY-SA 4.0",
  entries: entries.map(([pos, senses]) => ({ pos, senses: senses.map((text) => ({ text })) })),
})

describe("word cards", () => {
  it("leads with the entry that names the word's main class, not whatever comes first", () => {
    const c = cardFromEntry(
      entry({ word: "ação", dictionaries: [prose("Wikcionário", [["interjeição", ["grito de set"]], ["substantivo feminino", ["efeito de atuar", "outro"]]])] }),
    )
    assert.equal(c.pos, "substantivo feminino")
    assert.equal(c.definition, "efeito de atuar")
    assert.deepEqual(c.syllables, ["a", "ção"])
    assert.equal(c.stress, 1)
    assert.equal(c.source?.name, "Wikcionário")
  })

  it("prefers the modern dictionary even when the 1913 one has more senses", () => {
    const c = cardFromEntry(
      entry({ dictionaries: [prose("Wikcionário", [["substantivo masculino", ["moderno"]]]), prose("Dicionário Aberto", [["substantivo masculino", ["antigo", "dois", "três"]]])] }),
    )
    assert.equal(c.definition, "moderno")
  })

  it("keeps an inflected form's own class, and falls back to the thesaurus", () => {
    assert.equal(cardFromEntry(entry({ word: "tiver", dictionaries: [prose("Wikcionário", [["forma verbal", ["do verbo ter"]]])] })).pos, "forma verbal")
    const wn = cardFromEntry(entry({ senses: [{ pos: "n", gloss: null, synonyms: ["termo", "vocábulo"] }] }))
    assert.equal(wn.definition, "Sinônimos: termo, vocábulo.")
    assert.equal(wn.source?.name, "OpenWordnet-PT")
  })

  it("leaves out syllables the rules can't split and credits the source in the description", () => {
    const c = cardFromEntry(entry({ word: "bom-dia", dictionaries: [prose("Wikcionário", [["substantivo masculino", ["saudação"]]])] }))
    assert.equal(c.syllables, null)
    const m = metaFromCard(c)
    assert.equal(m.description, "substantivo masculino. saudação. Fonte: Wikcionário.")
    assert.deepEqual(m.labels, [["Classe", "substantivo masculino"]])
  })

  it("shortens long definitions on a word boundary", () => {
    const m = metaFromCard(cardFromEntry(entry({ dictionaries: [prose("Wikcionário", [["verbo", ["longa ".repeat(100)]]])] })))
    assert.ok(m.description.length <= 200, String(m.description.length))
    assert.match(m.description, /longa… Fonte: Wikcionário\.$/)
  })

  it("renders any word to a PNG, including very long text and scripts the fonts lack", async () => {
    const card = cardFromEntry(entry({ word: "日本語", dictionaries: [prose("Wikcionário", [["substantivo", ["japonês 日本語, ".repeat(60)]]])] }))
    const png = await wordImage(card)
    assert.equal(png.subarray(1, 4).toString(), "PNG")
  })
})

describe("pronunciation", () => {
  const file = (title: string, over: object = {}) => ({
    title,
    videoinfo: [
      {
        url: `https://upload.wikimedia.org/wikipedia/commons/a/ab/${title}`,
        mime: "application/ogg",
        descriptionurl: `https://commons.wikimedia.org/wiki/${title}`,
        derivatives: [{ src: "https://upload.wikimedia.org/x.mp3", type: 'audio/mpeg; codecs="mp3"' }],
        extmetadata: { LicenseShortName: { value: "CC BY-SA 4.0" }, Artist: { value: '<a href="/x">Ana</a>' } },
        ...over,
      },
    ],
  })

  it("only accepts Portuguese recordings of exactly this word", () => {
    assert.equal(rankFile("casa", "Pt-br-casa.ogg")?.region, "Brasil")
    assert.equal(rankFile("casa", "pt-pt-casa.ogg")?.region, "Portugal")
    assert.equal(rankFile("ação", "LL-Q5146 (por)-Jean-Luc-ação.wav")?.region, null)
    for (const name of ["Pt-br-casarão.ogg", "En-us-casa.ogg", "LL-Q150 (fra)-Bob-casa.wav", "Casa de Musica.ogg", "Pt-br-casa.jpg"]) {
      assert.equal(rankFile("casa", name), null, name)
    }
    assert.equal(rankFile("a.c", "Pt-br-abc.ogg"), null)
  })

  it("prefers Brazil, plays the MP3 and cleans the credit", () => {
    const r = pickRecording("casa", [file("File:Pt-pt-casa.ogg"), file("File:LL-Q5146 (por)-Ana-casa.wav"), file("File:Pt-br-casa.ogg")])!
    assert.equal(r.region, "Brasil")
    assert.equal(r.url, "https://upload.wikimedia.org/x.mp3")
    assert.equal(r.speaker, "Ana")
    assert.equal(r.license, "CC BY-SA 4.0")
    assert.match(r.page, /Pt-br-casa/)
  })

  it("names the speaker alone in a Lingua Libre credit", () => {
    const r = pickRecording("casa", [file("File:LL-Q5146 (por)-Ana-casa.wav", { extmetadata: { Artist: { value: "Speaker: Juliano P. Junho Recorder: Jjunho" } } })])!
    assert.equal(r.speaker, "Juliano P. Junho")
  })

  it("ignores missing files and audio hosted anywhere else", () => {
    assert.equal(pickRecording("casa", [{ title: "File:Pt-br-casa.ogg", missing: true }]), null)
    const offsite = file("File:Pt-br-casa.ogg", { url: "https://evil.example/a.wav", mime: "audio/wav", derivatives: [{ src: "https://evil.example/a.mp3", type: "audio/mpeg" }] })
    assert.equal(pickRecording("casa", [offsite]), null)
  })

  it("won't serve a format Safari can't play when there is no MP3", () => {
    assert.equal(pickRecording("casa", [file("File:Pt-br-casa.ogg", { derivatives: [] })]), null)
    const wav = pickRecording("casa", [file("File:Pt-br-casa.wav", { mime: "audio/wav", derivatives: [] })])!
    assert.match(wav.url, /Pt-br-casa\.wav$/)
  })
})

describe("page head", () => {
  it("escapes dictionary text, in attributes and the title", () => {
    const head = renderHead({ ...siteMeta(), title: `</title><script>x</script>`, description: `"><img src=x onerror=y>` }, "https://d.example")
    assert.doesNotMatch(head, /<script|<img/)
    assert.match(head, /&lt;\/title&gt;/)
    assert.match(head, /content="&quot;&gt;&lt;img/)
  })

  it("replaces the shell's generic tags and leaves the rest alone", () => {
    const html = injectHead(SHELL, renderHead({ ...siteMeta(), title: "T$&", ogTitle: "O" }, "https://d.example"))
    assert.equal((html.match(/<title>/g) ?? []).length, 1)
    assert.match(html, /<title>T\$&amp;<\/title>/)
    assert.equal((html.match(/og:title/g) ?? []).length, 1)
    assert.doesNotMatch(html, /Genérico|genérica/)
    assert.match(html, /name="robots" content="noindex, nofollow"/)
    assert.match(html, /<script type="module"/)
  })

  it("encodes words into paths", () => {
    assert.equal(wordPath(" Ação "), "/palavra/a%C3%A7%C3%A3o")
    assert.equal(wordPath("a/b?c"), "/palavra/a%2Fb%3Fc")
  })
})

describe("site routes", () => {
  let srv: Awaited<ReturnType<typeof startServer>>
  let dist: string

  before(async () => {
    dist = mkdtempSync(join(tmpdir(), "diciobase-dist-"))
    writeFileSync(join(dist, "index.html"), SHELL)
    process.env.SITE_DIST = dist
    srv = await startServer()
  })
  after(async () => {
    delete process.env.SITE_DIST
    await srv.close()
    await pool.end()
    rmSync(dist, { recursive: true })
  })

  const get = (path: string) => fetch(srv.base + path)

  it("a word page carries the word's tags, with absolute URLs, for any spelling of it", async () => {
    const res = await get("/palavra/acao")
    assert.equal(res.status, 200)
    assert.match(res.headers.get("content-type")!, /text\/html/)
    assert.match(res.headers.get("content-security-policy")!, /script-src 'self'/)
    assert.doesNotMatch(res.headers.get("cache-control")!, /no-store/)
    const html = await res.text()
    assert.match(html, /<title>Diciobase \| Ação<\/title>/)
    assert.match(html, /property="og:title" content="ação"/)
    assert.match(html, /property="og:description" content="a·ção, /)
    assert.match(html, new RegExp(`property="og:url" content="${srv.base}/palavra/a%C3%A7%C3%A3o"`))
    assert.match(html, new RegExp(`property="og:image" content="${srv.base}/og/palavra/a%C3%A7%C3%A3o\\.png"`))
    assert.match(html, /name="twitter:card" content="summary_large_image"/)
  })

  it("a word nobody has is a 404 that still loads the app, and doesn't echo the address", async () => {
    const res = await get("/palavra/%3Cscript%3Ezzzqqq")
    assert.equal(res.status, 404)
    const html = await res.text()
    assert.match(html, /id="root"/)
    assert.match(html, /Palavra não encontrada/)
    assert.doesNotMatch(html, /<script>|zzzqqq<?/)
  })

  it("a malformed address is a 404 page, not a server error", async () => {
    const res = await get("/palavra/%E0%A4%A")
    assert.equal(res.status, 404)
    assert.match(await res.text(), /id="root"/)
  })

  it("serves the fixed pages, and only the API stays JSON", async () => {
    assert.match(await (await get("/salvos")).text(), /og:image/)
    assert.equal((await get("/nao-existe")).status, 404)
    assert.match(await (await get("/nao-existe")).text(), /id="root"/)
    const api = await get("/api/nao-existe")
    assert.equal(api.status, 404)
    assert.deepEqual(await api.json(), { error: "not_found" })
  })

  it("serves a cacheable PNG for a real word and 404 otherwise", async () => {
    const res = await get("/og/palavra/saudade.png")
    assert.equal(res.status, 200)
    assert.equal(res.headers.get("content-type"), "image/png")
    assert.match(res.headers.get("cache-control")!, /public/)
    assert.equal(res.headers.get("pragma"), null)
    assert.equal((await res.arrayBuffer()).byteLength > 1000, true)
    assert.equal((await get("/og/palavra/zzzqqqxx.png")).status, 404)
    assert.equal((await get("/og/palavra/saudade")).status, 404)
    assert.equal((await get("/og/default.png")).status, 200)
  })

  it("hashed build files cache for a year, without the API's no-store", async () => {
    writeFileSync(join(dist, "index-abc12345.js"), "// built")
    const res = await get("/index-abc12345.js")
    assert.equal(res.status, 200)
    assert.match(res.headers.get("cache-control")!, /immutable/)
  })

  it("without a build next to it, the server is API-only", async () => {
    process.env.SITE_DIST = join(dist, "absent")
    const res = await get("/palavra/saudade")
    process.env.SITE_DIST = dist
    assert.equal(res.status, 404)
    assert.deepEqual(await res.json(), { error: "not_found" })
  })
})
