// Usage labels (rubricas) as a reader can understand them. Dicionário Aberto
// keeps Cândido de Figueiredo's 1913 abbreviations ("Mathem", "trasm"); they
// are spelled out here and the original stays with the label, so the source
// text is still one hover away. Unknown abbreviations show as written.

export interface Label {
  text: string
  /** The label as the dictionary wrote it, when `text` spells it out. */
  original?: string
  /** A word-class label ("Substantivo feminino"), dropped where the head already states that class. */
  classe?: true
}

const FIGUEIREDO: Record<string, string> = {
  trasm: "Trás-os-Montes",
  minh: "Minho",
  beir: "Beira",
  alent: "Alentejo",
  alg: "Algarve",
  dur: "Douro",
  extrem: "Estremadura",
  mad: "Madeira",
  açor: "Açores",
  bras: "Brasil",
  ant: "Antigo",
  des: "Desusado",
  obsol: "Obsoleto",
  "p. us": "Pouco usado",
  ext: "Por extensão",
  restrict: "Sentido restrito",
  fig: "Figurado",
  fam: "Familiar",
  pop: "Popular",
  chul: "Chulo",
  vulg: "Vulgar",
  deprec: "Depreciativo",
  burl: "Burlesco",
  irón: "Irônico",
  poét: "Poético",
  infant: "Linguagem infantil",
  escol: "Gíria escolar",
  gal: "Galicismo",
  angl: "Anglicismo",
  prolóq: "Provérbio",
  anat: "Anatomia",
  náut: "Náutica",
  chím: "Química",
  miner: "Mineralogia",
  gram: "Gramática",
  mús: "Música",
  geol: "Geologia",
  jur: "Jurídico",
  phýs: "Física",
  heráld: "Heráldica",
  pesc: "Pesca",
  pharm: "Farmácia",
  mathem: "Matemática",
  arith: "Aritmética",
  geom: "Geometria",
  constr: "Construção",
  "hist. nat": "História natural",
  cir: "Cirurgia",
  terat: "Teratologia",
  carp: "Carpintaria",
  marn: "Marinharia",
  physiol: "Fisiologia",
  agr: "Agricultura",
  philol: "Filologia",
  philos: "Filosofia",
  rhet: "Retórica",
  veter: "Veterinária",
  espir: "Espiritismo",
  archit: "Arquitetura",
  astron: "Astronomia",
  taur: "Tauromaquia",
  typ: "Tipografia",
  phot: "Fotografia",
  geogr: "Geografia",
  ichthyol: "Ictiologia",
  artilh: "Artilharia",
  anthrop: "Antropologia",
  mil: "Militar",
  theol: "Teologia",
  eccles: "Eclesiástico",
  pint: "Pintura",
  serralh: "Serralharia",
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function figueiredo(raw: string): string | null {
  const key = raw.trim().toLowerCase()
  if (FIGUEIREDO[key]) return FIGUEIREDO[key]!
  // "t. Náut": a term of that field.
  const term = /^t\.\s+(.+)$/.exec(raw)
  if (term) {
    const field = FIGUEIREDO[term[1]!.toLowerCase()]
    return field ? `Termo de ${field.toLowerCase()}` : null
  }
  // "T. da Bairrada", "T. de Angola": a regional term; the place keeps its 1913 spelling.
  const place = /^T\.\s+(d[aeo]s?\s+.+)$/.exec(raw)
  if (place) return `Termo ${place[1]}`
  // "Bras. do N", "Bras. de Minas": Brazil, and where.
  const br = /^Bras\.\s+d[aeo]s?\s+(.+)$/.exec(raw)
  if (br) return `Brasil (${({ N: "Norte", S: "Sul" } as Record<string, string>)[br[1]!] ?? br[1]})`
  // "Gír. de Lisbôa", "Gír. lisb"
  if (/^Gír\.\s/.test(raw)) return raw.replace(/^Gír\.\s+(?:de\s+)?/, "Gíria de ").replace(/lisb$/, "Lisboa")
  return null
}

export function expandLabel(source: string, raw: string): Label {
  if (source === "dicionario-aberto") {
    const text = figueiredo(raw)
    if (text && text !== raw) return { text, original: raw.endsWith(".") ? raw : `${raw}.` }
  }
  // Wikcionário mixes "gíria" and "Gíria": one case, same words.
  return { text: cap(raw) }
}
