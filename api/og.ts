// The preview image for a word, or the site's own when no word is named.
import { siteImage, wordImage } from "../server/src/site/ogImage.ts"
import { staticCard } from "../server/src/site/staticCard.ts"

const png = (data: Uint8Array) =>
  new Response(data as BodyInit, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, s-maxage=604800" },
  })

export async function GET(request: Request) {
  const file = new URL(request.url).searchParams.get("file")
  if (!file) return png(await siteImage())
  const card = file.endsWith(".png") ? await staticCard(file.slice(0, -4)).catch(() => null) : null
  if (!card) return new Response("not found", { status: 404 })
  return png(await wordImage(card))
}
