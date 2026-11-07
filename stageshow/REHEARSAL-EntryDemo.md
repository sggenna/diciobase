# Rehearsal: EntryDemo, the search-bar story (search bar → entry → Estrutura), large and as a card

The case study's cover is `HeroTour`; see `REHEARSAL-HeroTour.md`.

Gold: `calendar` and `controls` for the camera's single push-in and return; `phone-touch` for one object opening into its screen. The look is not the kit's: inside the sheet everything is the app's own components and `src/index.css`.

Real components: `Part`, `StructureProvider`, `DictTabs`, `ModeToggle`, `SequenceStrip`, `DictEntryView`, `EntryEtymology`, `WordChip`, `SaveButton`, `CitationCapsule`, `PronounceButton`, `SyllableLine`, `InfoTip`. The search bar uses HomePage's `.hero-search` classes. The head and the layout around them repeat DefinitionPage's markup, because DefinitionPage itself owns its mode state and needs the session. Data is the real `saudade` entry, frozen in `saudade.ts`; the demo makes no network calls.

Beats: empty bar · cursor clicks in, types with a human rhythm · the clip opens from the pill's exact rect while the real h1 flies from the typed text · the cursor reaches the toggle, clicks Estrutura · camera pushes in, labels slide, rules draw down, the strip fills left to right, hold · pull back to the full entry, rest · the sheet clears, the empty bar comes up.

Measured in Chrome: large 10.5–10.8s, card 7.9s. The large one loops on screen. The card holds still until hovered, loops while hovered, settles to the empty bar on leave. Reduced motion: static, Estrutura, full entry, no cursor. Console clean, no failed requests.

Filmed: card at 600 in a 900 viewport, compact at 358 in a 390 viewport, morph at 4× slow, push-in beat, reduced-motion poster.

Film findings left on purpose:
- `appears, then moves` on the h1: it is the shared element, on screen at full opacity by design.
- `jump` on `dbx-typed` and the caret: letters being typed.
- `near-empty frames` around the morph: the sheet is opening and its content follows it.
- `tight mark`: the hero orb's rotating dots, as on the home page.
- `half-pixel glyph` on the save icon: the real SaveButton's 15px icon.
- `spills its slot` and `uneven gutters` on the chips: they wrap, as in the app.
- `lands on a transform` on the fades: flagged, though each already holds a layer through `will-change`; not visible at real size.
- The run never reports `rehearsal passed`, because its sampling gaps make it `inconclusive`. Frames were read by eye instead.

Differences from the app, all scoped to `.dbx`:
- Estrutura's timings are slowed for storytelling; the real ones are 240ms with 24ms between blocks.
- The strip fills by clip; the app fades it.
- The toggle's thumb passes under "Leitura"; in the app it paints over the label on its way.
- The card's definitions are 416px wide instead of 480px, so they end inside the push-in's crop.
- The kit's copy of `stage.css` exempts `.dict-scope` from its host-CSS guard, so the app's Tailwind reset applies inside the stage.

Not checked: Safari and Firefox; a real phone; mounted in the portfolio itself. 

## Using it

Run `pnpm dev` and open `/demo.html` (`?v=search` or `?v=card` for one alone). `vite build` takes only `index.html`, so this page never ships with the product.

```tsx
<EntryDemo variant="hero" /> // loops while on screen; scales up to 2× the 1200px design
<EntryDemo variant="card" /> // plays while hovered; 720×405, the portfolio's 16:9 tile
```
