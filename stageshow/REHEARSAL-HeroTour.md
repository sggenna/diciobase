# Rehearsal: HeroTour, the case study's cover

A tour of the product's best flows on its real screens, 1440×900 on a transparent background: the orbit home, one word across three dictionaries, where they agree, and a synonym opening its own entry. The screens are the app's own: `Headline`, `OrbitField`, `AppNav`, `Footer`, `DictTabs`, `ModeToggle`, `DictEntryView`, `EntryRemissoes`, `WordChip`, `SourceDots` and the rest. Data is the real `saudade` and `nostalgia` entries, frozen in `saudade.ts`; no network calls.

Beats: orbit drifts · click the search, the real `focused` state slows the cards and sends them back · type, enter, crossfade · Dicionário Aberto, OpenWordnet, back to Wikcionário · camera pushes in on the column, hover the dot, "Também em Dicionário Aberto" · pull back, click "nostalgia", the word rises into its headword as the tab counts tick to 1 · hold · crossfade to the orbit.

Choices worth knowing:
- OpenWordnet shares no meaning for this word, so it has no dots. The tour clicks back to Wikcionário, whose meanings 3 and 4 do have them.
- The stage is a true 1440×900 because `solveOrbit` finds no arrangement of cards much below that, and its exhaustive search then blocks the page.
- Typing shows no autocomplete list, unlike the real field.
- Phones (below 600px): the orbit, Dicionário Aberto, the dots, back to the orbit. No push-in and no synonym, since the side panel sits far below the fold there.
- The word glide is the app's idea rebuilt inside the stage: the real `glideWord` flies a copy over `document.body` in viewport pixels, which a scaled stage can't use.

Changes to the app, none of which change it on its own site: `OrbitField` gains optional `insetTop` and `paused`; `Headline` is exported and measures in its own pixels; `SyllableLine` is exported.

Checked: frames at 1040 wide (scaled) and at 358; no failed requests; about 57fps in software-rendered headless Chrome once covered work was paused, down from 9fps before.

In the portfolio: `pnpm build:demos` writes it to `~/product_portfolio/public/assets/diciobase/demos`, and the case study's `hero.frame` shows it in the hero slot. Rebuild after changing it.

Not checked: Safari and Firefox; a real phone; a GPU machine's frame rate. `film.mjs` could not run its gate on this stage, as its contact sheet times out at this size, so its rehearsal checks did not run. Frames were read by eye from a separate capture.

Run `pnpm dev` and open `/demo.html?v=hero`. `<HeroTour />` scales to its container, up to 2×.

## Feature visuals

`FeatureDemo.tsx` holds the case study's cropped visuals, one per `?f=`. Search, tabs, dots, Estrutura after, Não consta, sign-up after and the orbit use the app's own components and real entries. Estrutura before, sign-up before and the compare view are rebuilds: the first and the compare view have no copy in the repo, and the second follows `MobileAuthPage` in git (420c47d). The search list repeats `useSuggest`'s markup with the list the static data returns for "sao". The globe before is a screenshot from the desktop folder, in the portfolio's assets.
