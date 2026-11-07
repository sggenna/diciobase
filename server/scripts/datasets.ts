// Pinned upstream datasets listed in
// https://github.com/EticaAI/linguistic-datasets-portuguese
// Every file is fetched from an immutable commit SHA and verified against
// datasets.lock.json, so a changed or tampered upstream cannot slip in.

export interface DatasetFile {
  path: string
  /** Where it lands under server/data/raw/<slug>/ */
  as: string
  /** Full URL for hosts other than GitHub. Only allow-listed hosts are ever contacted. */
  url?: string
}

export interface DatasetSource {
  slug: string
  name: string
  owner: string
  repo: string
  sha: string
  license: string
  licenseUrl: string
  homepage: string
  attribution: string
  /** For sources not pinned to a git commit: what exactly was downloaded. */
  version?: string
  files: DatasetFile[]
}

export const ALLOWED_HOSTS = ["raw.githubusercontent.com", "kaikki.org"]

export const SOURCES: DatasetSource[] = [
  {
    slug: "openwordnet-pt",
    name: "OpenWordnet-PT",
    owner: "own-pt",
    repo: "openWordnet-PT",
    sha: "264016d5899e6969f6f7cb4f1d75fa06037c1fd7",
    license: "CC-BY-4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    homepage: "https://github.com/own-pt/openWordnet-PT",
    attribution:
      "OpenWordnet-PT, Open Wordnet for Portuguese (own-pt), licensed under CC BY 4.0.",
    files: [
      { path: "data/own-pt-synsets.ttl", as: "synsets.ttl" },
      { path: "data/own-pt-words.ttl", as: "words.ttl" },
      { path: "data/own-pt-wordsenses.ttl", as: "wordsenses.ttl" },
      { path: "data/own-pt-relations.ttl", as: "relations.ttl" },
      { path: "LICENSE", as: "LICENSE" },
    ],
  },
  {
    slug: "dicsin",
    name: "DicSin pt-BR",
    owner: "fititnt",
    repo: "DicSin-dicionario-sinonimos-portugues-brasileiro",
    sha: "d67fc7fdbcaf20e7b6adca4252ade5669ddce619",
    license: "GPL-2.0 (upstream notes it as 'GPLv2?')",
    licenseUrl: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
    homepage:
      "https://github.com/fititnt/DicSin-dicionario-sinonimos-portugues-brasileiro",
    attribution:
      "DicSin, Dicionário de sinônimos e antônimos do português brasileiro (GPLv2).",
    files: [
      { path: "dicsin/th_pt_BR.dat", as: "th_pt_BR.dat" },
      { path: "dicsin/readme.txt", as: "readme.txt" },
    ],
  },
  {
    slug: "vero",
    name: "VERO pt-BR",
    owner: "fititnt",
    repo: "VERO-pt-BR_verificador-ortografico-portugues-brasileiro",
    sha: "d0d62c76ebcff778a12e491cd297b297aa2dc84d",
    license: "LGPL-3.0 / MPL-1.1",
    licenseUrl: "https://www.gnu.org/licenses/lgpl-3.0.html",
    homepage: "https://pt-br.libreoffice.org/projetos/vero",
    attribution:
      "VERO, VERificador Ortográfico do LibreOffice (LGPLv3 / MPL), pt-BR.",
    files: [{ path: "VERO-pt-BR/pt_BR.dic", as: "pt_BR.dic" }],
  },
  {
    slug: "br-ispell",
    name: "br.ispell",
    owner: "fititnt",
    repo: "br.ispell-dicionario-portugues-brasileiro",
    sha: "1fe7b79f4746e36dfbfb0feb578960efc94088e1",
    license: "GPL-2.0",
    licenseUrl: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
    homepage: "https://www.ime.usp.br/~ueda/br.ispell/",
    attribution: "br.ispell, dicionário do português brasileiro (GPLv2).",
    files: [
      { path: "br.ispell/E-2.5", as: "E-2.5" },
      { path: "LICENSE", as: "LICENSE" },
    ],
  },
  {
    slug: "stopwords-pt",
    name: "Stopwords Portuguese (PT)",
    owner: "stopwords-iso",
    repo: "stopwords-pt",
    sha: "84249b7ca37005f8cd19df70d86f44dc1f1936a5",
    license: "MIT",
    licenseUrl: "https://opensource.org/license/mit",
    homepage: "https://github.com/stopwords-iso/stopwords-pt",
    attribution: "stopwords-iso/stopwords-pt (MIT).",
    files: [
      { path: "stopwords-pt.txt", as: "stopwords-pt.txt" },
      { path: "LICENSE", as: "LICENSE" },
    ],
  },
  {
    slug: "wikcionario",
    name: "Wikcionário",
    owner: "",
    repo: "",
    sha: "",
    version: "kaikki.org extract of 2026-10-16 from the pt.wiktionary dump of 2026-10-01",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    homepage: "https://pt.wiktionary.org",
    attribution:
      "Wikcionário (pt.wiktionary.org), colaboradores do Wikcionário, CC BY-SA 4.0. Dados estruturados por wiktextract (kaikki.org).",
    files: [
      {
        path: "kaikki.org-dictionary-Português.jsonl",
        as: "pt.jsonl",
        url: "https://kaikki.org/ptwiktionary/Portugu%C3%AAs/kaikki.org-dictionary-Portugu%C3%AAs.jsonl",
      },
    ],
  },
  {
    slug: "dicionario-aberto",
    name: "Dicionário Aberto",
    owner: "ambs",
    repo: "Dicionario-Aberto",
    sha: "6506959f9bb7dcf4207e338df3ef895e692731f2",
    license: "CC BY-SA 2.5 PT",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5/pt/",
    homepage: "https://dicionario-aberto.net",
    attribution:
      "Dicionário Aberto (dicionario-aberto.net), Universidade do Minho e colaboradores, CC BY-SA 2.5 Portugal.",
    files: [{ path: "Resources/xmls.zip", as: "xmls.zip" }],
  },
]
