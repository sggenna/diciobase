// Link-preview bots only (see the rewrite in vercel.json): the word's tags and nothing else. People get the static app.
import { missingMeta, renderHead, siteMeta } from "../server/src/site/head.ts"
import { siteOrigin, staticCard } from "../server/src/site/staticCard.ts"
import { metaFromCard } from "../server/src/site/wordCard.ts"

const text = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export async function GET(request: Request) {
  const word = new URL(request.url).searchParams.get("word") ?? ""
  let status = 200
  let meta = siteMeta(word ? "/" : new URL(request.url).pathname)
  if (word) {
    try {
      const card = await staticCard(word)
      if (card) meta = metaFromCard(card)
      else {
        meta = missingMeta()
        status = 404
      }
    } catch {
      // Keep the generic preview rather than an error; it isn't worth caching.
      status = 503
    }
  }
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    ${renderHead(meta, siteOrigin())}
  </head>
  <body>
    <h1>${text(meta.ogTitle)}</h1>
    <p>${text(meta.description)}</p>
  </body>
</html>`
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": status === 503 ? "no-store" : "public, max-age=0, s-maxage=86400",
    },
  })
}
