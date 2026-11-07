# Third-party data

The dictionary tables are built from these openly licensed datasets, listed in
<https://github.com/EticaAI/linguistic-datasets-portuguese>.

- **OpenWordnet-PT** — Open Wordnet for Portuguese (own-pt). Licensed under CC BY 4.0
  (<https://creativecommons.org/licenses/by/4.0/>). Data was converted into SQL tables; glosses,
  examples and relations are unchanged apart from text normalisation. <https://github.com/own-pt/openWordnet-PT>
- **DicSin pt-BR** — Dicionário de sinônimos e antônimos do português brasileiro, GPL-2.0.
  Headwords with corrupted characters were repaired or skipped. <https://github.com/fititnt/DicSin-dicionario-sinonimos-portugues-brasileiro>
- **VERO pt-BR** — VERificador Ortográfico (LibreOffice), LGPL-3.0 / MPL. Word list only. <https://pt-br.libreoffice.org/projetos/vero>
- **br.ispell** — dicionário do português brasileiro, GPL-2.0. Word list and grammatical tags only. <https://www.ime.usp.br/~ueda/br.ispell/>
- **stopwords-pt** — stopwords-iso, MIT. <https://github.com/stopwords-iso/stopwords-pt>

Exact upstream commits and file checksums are pinned in `scripts/datasets.ts` and `datasets.lock.json`.
- **Wikcionário** — the Portuguese Wiktionary (pt.wiktionary.org), contributors of the Wikcionário, CC BY-SA 4.0
  (<https://creativecommons.org/licenses/by-sa/4.0/>). Structured with wiktextract by kaikki.org
  (extract of 2026-10-16 from the 2026-10-01 dump). Glosses, examples, etymology, IPA and synonyms are
  stored in SQL tables, with text normalisation and trimming. <https://kaikki.org/ptwiktionary/>
- **Dicionário Aberto** — Universidade do Minho and contributors, CC BY-SA 2.5 Portugal
  (<https://creativecommons.org/licenses/by-sa/2.5/pt/>). Entries from the project's XML export, converted to
  SQL tables. <https://dicionario-aberto.net>
