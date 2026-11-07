# Rehearsal: WordDemo (Diciobase word page)

Gold: `hero-demo` (720-wide hero beside copy, one gutter, window running off the right; kept its stage size, gutter, cursor rests and named targets). Borrowed the crossfade-in-place from `choreography` and the foot fade from `fade-crop`. Replaced the dashboard with Diciobase's definition page: the serif headword, the computed syllable line with its accent-underlined stress and "calculado" marker, the IPA, "Ouvir pronúncia", save and share, the dictionary tabs with their lettered marks and sliding underline, and the "Também em" marks with their frosted tooltip.

Content is real: "saudade" from `GET /api/words/saudade` (Wikcionário, Dicionário Aberto, OpenWordnet-PT). The "Também em" match is the one the app's own `senseMatch.ts` computes. Dicionário Aberto's sense 1 is also in Wikcionário; the other senses shown match nothing, so they carry no marks.

Beats: 1 opening on Wikcionário · 2 click Dicionário Aberto: the underline slides and recolors, the entry crossfades, "Texto de 1913, na grafia original" appears beside Acepções ("pessôas", "vêr") · 3 hover the W mark on sense 1: "Também em: Wikcionário" (payoff, held 2.6s; this is the poster) · 4 click OpenWordnet (wide only; only two tabs fit on a phone) · 5 click Wikcionário, which is the visible reset. Loop ≈ 12s wide, ≈ 9s on a phone.

Captured: wide 720×452 and compact 358×358 (390 viewport), each loop end to end; the tooltip beat at 390; the reduced-motion poster. Light theme only.

Film: `--gate` passes on the wide loop and the 390 loop.
- Fixed along the way: the head overflowing once the IPA and "calculado" joined it (the class moved to the first sense's chip, as the app shows it there too), and a "Mais" tab touching its neighbour on the phone (removed; the phone shows two tabs).

Review: a self-review against `verify.md`, not a separate fresh-eye reviewer.

Assumptions:
- The address bar reads `diciobase.com.br/saudade`. I couldn't find the real domain in the repo, so change `url` in `WordDemo.tsx` if it differs.
- The demo shows Diciobase's wide layout at a narrower width (the aside is cropped to filler), with the entry in one column rather than the app's two.
- The later senses fade out at the window's foot, because the three entries are different heights and no hard crop is clean for all of them.

Not checked: dark mode (the app has none), Safari/Firefox (filmed in headless Chrome only), the demo mounted in a real Diciobase page, real-time pacing on a device.

## Using it

`WordDemo.tsx` imports the kit files directly, so it needs only React (no `lucide-react`). It lives outside `src/`, so the app's build and typecheck don't see it. To show it on a page, import `stageshow/WordDemo` and give it a column about 720px wide; below 600px it switches to the compact design.
