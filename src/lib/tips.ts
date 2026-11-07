// Contextual guidance copy. Tips attach to elements through `data-tip="<id>"`,
// so pages only mark what a tip is about; wording and ordering live here.

export type TipId =
  | "home-search"
  | "home-suggestions"
  | "nav-salvos"
  | "def-dicts"
  | "def-save"
  | "def-pronounce"
  | "def-facts"
  | "def-structure"
  | "fav-filters"
  | "fav-row"
  | "profile-stats"
  | "profile-dicts"
  | "profile-tips"

export interface Tip {
  title: string
  body: string
  placement?: "top" | "bottom"
}

export const TIPS: Record<TipId, Tip> = {
  "home-search": {
    title: "Uma busca, vários dicionários",
    body: "Digite qualquer palavra e mostramos como cada dicionário a define, lado a lado.",
    placement: "bottom",
  },
  "home-suggestions": {
    title: "Sem ideia do que buscar?",
    body: "Toque em uma sugestão para ver uma entrada completa e conhecer o app.",
    placement: "top",
  },
  "nav-salvos": {
    title: "Salvos",
    body: "Aqui ficam as palavras que você guardar. Dá para filtrar, buscar e rever as definições.",
  },
  "def-dicts": {
    title: "Cada aba é um dicionário",
    body: "Toque para ver como cada dicionário define a mesma palavra. Os que não cabem ficam em “Mais”. Cada fonte tem a sua cor, a mesma em toda a página.",
    placement: "bottom",
  },
  "def-save": {
    title: "Guardar para depois",
    body: "Salva a palavra em Salvos. Toque de novo para remover. É preciso estar logado.",
    placement: "bottom",
  },
  "def-pronounce": {
    title: "Ouça a pronúncia",
    body: "Toca a palavra em voz alta. Se ainda não houver gravação, o botão fica desativado.",
    placement: "bottom",
  },
  "def-facts": {
    title: "Sobre a palavra",
    body: "Plural e antônimos, cada um com a sua fonte. Sílabas e pronúncia ficam junto da palavra. Toque no “i” para entender cada termo.",
    placement: "top",
  },
  "def-structure": {
    title: "Leitura e Estrutura",
    body: "Leitura é a página calma. Estrutura marca cada parte do verbete (etimologia, acepções, exemplos…) e mostra a ordem que cada dicionário usa.",
    placement: "bottom",
  },
  "fav-filters": {
    title: "Organize sua lista",
    body: "Filtre por classe gramatical e ordene por mais recentes ou de A a Z.",
    placement: "bottom",
  },
  "fav-row": {
    title: "Toque para reabrir",
    body: "Abre a definição completa. A lixeira remove a palavra, e você pode desfazer logo em seguida.",
    placement: "bottom",
  },
  "profile-stats": {
    title: "Seu resumo",
    body: "Quantas palavras você salvou, quantas pesquisas fez e desde quando está no Diciobase.",
    placement: "bottom",
  },
  "profile-dicts": {
    title: "Escolha suas fontes",
    body: "Defina quais dicionários aparecem nas definições. Mantenha ao menos um ativo.",
    placement: "bottom",
  },
  "profile-tips": {
    title: "Dicas de uso",
    body: "Estas explicações aparecem uma única vez, na primeira vez que você usa cada recurso. Desative aqui quando quiser.",
    placement: "top",
  },
}

export type TipScreen = "home" | "definition" | "favorites" | "profile"

// `max` caps how many tips one visit shows, so nobody is walked through
// everything at once. The rest wait for the next visit.
export const SCREEN_TIPS: Record<TipScreen, { ids: TipId[]; max: number }> = {
  home: { ids: ["home-search", "home-suggestions", "nav-salvos"], max: 2 },
  definition: { ids: ["def-dicts", "def-structure", "def-save", "def-pronounce", "def-facts"], max: 2 },
  favorites: { ids: ["fav-filters", "fav-row"], max: 2 },
  profile: { ids: ["profile-stats", "profile-dicts", "profile-tips"], max: 2 },
}

// Short definitions behind the "i" buttons, keyed by the label they explain.
export const TERM_HELP: Record<string, { title: string; body: string }> = {
  "Sílaba Tônica": {
    title: "Sílaba tônica",
    body: "A sílaba pronunciada com mais força. Se for a última, a palavra é oxítona; a penúltima, paroxítona; a antepenúltima, proparoxítona.",
  },
  Calculado: {
    title: "Calculado",
    body: "Nenhum dicionário aberto traz este dado, então o Diciobase o calcula pelas regras de ortografia do português. Pode errar em estrangeirismos e palavras com prefixo.",
  },
  Pronúncia: {
    title: "Pronúncia",
    body: "Transcrição fonética (IPA) registrada pelo dicionário indicado, com a região quando ele a informa.",
  },
  Antônimos: {
    title: "Antônimos",
    body: "Palavras de sentido oposto, segundo as bases indicadas.",
  },
  Plural: {
    title: "Plural",
    body: "Como a palavra fica quando se refere a mais de uma coisa.",
  },
  Etimologia: {
    title: "Etimologia",
    body: "A origem e a história da palavra: de qual língua veio e como mudou até hoje.",
  },
  Relacionadas: {
    title: "Relacionadas",
    body: "Palavras da mesma família ou do mesmo assunto. Toque em uma para pesquisá-la.",
  },
  "Sinônimos neste dicionário": {
    title: "Sinônimos",
    body: "Palavras de sentido parecido, segundo este dicionário. Outras fontes podem listar outras opções.",
  },
  Notas: {
    title: "Notas",
    body: "Observações do dicionário sobre uso, grafia ou casos especiais da palavra.",
  },
}

export const LABEL_HELP: Record<string, string> = {
  Substantivo: "Classe gramatical: palavra que nomeia seres, coisas, lugares ou ideias.",
  Verbo: "Classe gramatical: palavra que expressa ação, estado ou fenômeno.",
  Adjetivo: "Classe gramatical: palavra que caracteriza ou qualifica um substantivo.",
  Advérbio: "Classe gramatical: palavra que modifica um verbo, um adjetivo ou outro advérbio.",
  Figurado: "Sentido figurado: a palavra é usada fora do significado literal.",
  Geologia: "Área do conhecimento: este sentido é usado no estudo da Terra e das rochas.",
  Histórico: "Sentido ligado a épocas passadas, que hoje raramente aparece no uso comum.",
  Popular: "Uso informal, típico da fala do dia a dia, e menos comum na escrita formal.",
  Jogos: "Área do conhecimento: este sentido pertence ao vocabulário dos jogos.",
  Tipografia: "Área do conhecimento: este sentido pertence ao vocabulário da impressão e das fontes.",
  Entomologia: "Área do conhecimento: este sentido é usado no estudo dos insetos.",
}
