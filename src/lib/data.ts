import { WordData } from "@/lib/types";

export const DICT_COLOR: Record<string, string> = {
  aurelio:  "#3D6647",
  houaiss:  "#24456B",
  michaelis: "#7A6520",
};

export const DB: Record<string, WordData> = {
  efêmero: {
    word: "efêmero", partOfSpeech: "adjetivo", phonetic: "e-fê-me-ro",
    synonyms: ["fugaz","transitório","passageiro","perecível","breve","volátil","momentâneo"],
    facts: [
      { label: "Sílaba Tônica",     value: "fê (proparoxítona)" },
      { label: "Separação Silábica", value: "e-fê-me-ro" },
      { label: "Popularidade",       value: "Altíssima" },
      { label: "Plural",             value: "efêmeros" },
    ],
    dicts: [
      { id:"aurelio", name:"Dicionário Aurélio", shortName:"Aurélio", tag:"Versão 2026",
        etymology:"Do grego epheméros 'que dura um dia', pelo latim ephemerus.",
        senses:[
          { num:"1", text:"Que dura apenas um dia.", examples:['"As flores efêmeras do ipê caem ao amanhecer."'] },
          { num:"2", text:"Que tem curta duração; passageiro, transitório.",
            subsenses:[
              { num:"2.1", text:"Diz-se de fenômeno ou estado que se extingue rapidamente." },
              { num:"2.2", text:"Diz-se de publicação periódica de vida curta." },
            ],
            examples:['"A glória efêmera dos vencedores."','"Seu sucesso mostrou-se efêmero."'],
          },
          { num:"3", text:"Perecível; mortal.", labels:["Figurado"], examples:['"A existência efêmera dos seres vivos."'] },
        ],
        notes:["Antônimos: eterno, perene, duradouro, permanente."],
        synonyms:["fugaz","transitório","passageiro","perecível","momentâneo"],
        related:["efemeridade","efeméride","efemerizável"],
      },
      { id:"houaiss", name:"Dicionário Houaiss", shortName:"Houaiss", tag:"Edição Integral",
        etymology:"Gr. ephḗmeros 'que dura um dia', de epí 'sobre' + hḗmera 'dia'; ver efemer(o)-.",
        senses:[
          { num:"1", text:"Que dura ou existiu somente durante um dia.", labels:["Entomologia"],
            examples:['"Insetos efêmeros, como a efeméride, vivem apenas algumas horas como adultos."'],
          },
          { num:"2", text:"Que tem existência ou validade por muito curto tempo; que passa ou desaparece rapidamente.",
            subsenses:[
              { num:"2.1", text:"Diz-se de prazer, sentimento ou situação de breve duração." },
              { num:"2.2", text:"Diz-se de produto ou obra cultural de consumo rápido e sem valor duradouro." },
              { num:"2.3", text:"Relativo a publicação periódica de interesse momentâneo." },
            ],
            examples:['"A moda é efêmera por natureza."','"Produções efêmeras que logo caem no esquecimento."'],
          },
          { num:"3", text:"Que é passageiro, provisório, de pouca importância.", labels:["Figurado"] },
        ],
        notes:[
          "Variante gráfica histórica: efémero (pré-1990).",
          "Família lexical: efemeridade (s.f.), efemerizável (adj.).",
        ],
        synonyms:["transitório","passageiro","fugaz","caduco","temporário","perecível"],
        related:["efemeridade","efeméride","ephemeron"],
      },
      { id:"michaelis", name:"Michaelis", shortName:"Michaelis", tag:"Dicionário Escolar",
        senses:[
          { num:"1", text:"Que dura somente um dia." },
          { num:"2", text:"Que dura pouco; passageiro.", examples:['"A felicidade não é efêmera para quem sabe valorizá-la."'] },
          { num:"3", text:"Que é de pouca importância; insignificante.", labels:["Popular"] },
        ],
        synonyms:["fugaz","passageiro","breve","transitório"],
        related:["transitório","passageiro","volátil"],
      },
    ],
  },
  terreno: {
    word:"terreno", partOfSpeech:"substantivo masculino", phonetic:"ter-re-no", gender:"masc.",
    synonyms:["solo","chão","campo","área","gleba","terra"],
    facts:[
      { label:"Sílaba Tônica",      value:"re (paroxítona)" },
      { label:"Separação Silábica", value:"ter-re-no" },
      { label:"Popularidade",       value:"Alta" },
      { label:"Plural",             value:"terrenos" },
    ],
    dicts:[
      { id:"aurelio", name:"Dicionário Aurélio", shortName:"Aurélio", tag:"Versão 2026",
        etymology:"Do latim terrenum, neutro de terrenus 'de terra'.",
        senses:[
          { num:"1", text:"Extensão de terra; solo, chão." },
          { num:"2", text:"Porção de terra delimitada; lote.", examples:['"Comprou um terreno na periferia."'] },
          { num:"3", text:"Campo de ação, esfera de atividade.", labels:["Figurado"] },
          { num:"4", text:"Conjunto das condições físicas de determinado lugar.", labels:["Geologia"] },
        ],
        synonyms:["solo","chão","lote","gleba"],
        related:["terra","território","terraço"],
      },
      { id:"houaiss", name:"Dicionário Houaiss", shortName:"Houaiss", tag:"Edição Integral",
        etymology:"Lat. terrenum, i 'terreno, solo'; ver terr(i/o)-.",
        senses:[
          { num:"1", text:"Superfície de terra; solo.", examples:['"O terreno é fértil e propício ao cultivo."'] },
          { num:"2", text:"Faixa ou área de terra com limites definidos.",
            subsenses:[
              { num:"2.1", text:"Lote urbano destinado à construção." },
              { num:"2.2", text:"Propriedade rural sem benfeitorias significativas." },
            ],
          },
          { num:"3", text:"Conjunto de formações geológicas de uma região.", labels:["Geologia"] },
          { num:"4", text:"Âmbito, esfera, domínio.", labels:["Figurado"],
            examples:['"No terreno da filosofia, a questão permanece aberta."'],
          },
        ],
        synonyms:["solo","chão","lote","gleba","campo","área"],
        related:["terra","território","terraplanagem"],
      },
      { id:"michaelis", name:"Michaelis", shortName:"Michaelis", tag:"Dicionário Escolar",
        senses:[
          { num:"1", text:"Extensão de terra." },
          { num:"2", text:"Lote de terra.", examples:['"Eles compraram um terreno para construir."'] },
          { num:"3", text:"Espaço ou área de atuação.", labels:["Figurado"] },
        ],
        synonyms:["solo","chão","área"],
        related:["terra","território"],
      },
    ],
  },
  casa: {
    word:"casa", partOfSpeech:"substantivo feminino", phonetic:"ca-sa", gender:"fem.",
    synonyms:["lar","moradia","residência","habitação","domicílio"],
    facts:[
      { label:"Sílaba Tônica",      value:"ca (paroxítona)" },
      { label:"Separação Silábica", value:"ca-sa" },
      { label:"Popularidade",       value:"Altíssima" },
      { label:"Plural",             value:"casas" },
    ],
    dicts:[
      { id:"aurelio", name:"Dicionário Aurélio", shortName:"Aurélio", tag:"Versão 2026",
        etymology:"Do latim casa, -ae 'cabana, choupana'.",
        senses:[
          { num:"1", text:"Edificação destinada à habitação humana.", examples:['"A casa foi reformada no ano passado."'] },
          { num:"2", text:"Residência, lar.", examples:['"Saudades de casa."'] },
          { num:"3", text:"Família, grupo doméstico.", labels:["Figurado"] },
          { num:"4", text:"Estabelecimento comercial.", examples:['"Casa de câmbio, casa de penhores."'] },
          { num:"5", text:"Cada uma das divisões de um tabuleiro de jogo.", labels:["Jogos"] },
        ],
        synonyms:["lar","moradia","residência","domicílio"],
        related:["casinha","casarão","casamento"],
      },
      { id:"houaiss", name:"Dicionário Houaiss", shortName:"Houaiss", tag:"Edição Integral",
        etymology:"Lat. casa, ae 'choupana, casebre'; ver cas(a/o)-.",
        senses:[
          { num:"1", text:"Construção destinada à moradia.",
            subsenses:[
              { num:"1.1", text:"Moradia unifamiliar de pequeno porte." },
              { num:"1.2", text:"Moradia em geral, independentemente do porte." },
            ],
          },
          { num:"2", text:"O lar, o ambiente doméstico familiar.", examples:['"Chegou em casa tarde da noite."'] },
          { num:"3", text:"Família; linhagem nobre.", labels:["Histórico"] },
          { num:"4", text:"Estabelecimento comercial ou industrial.", examples:['"Casa editorial, casa bancária."'] },
          { num:"5", text:"Subdivisão de uma tabela, grade ou tabuleiro.", labels:["Tipografia","Jogos"] },
        ],
        synonyms:["lar","moradia","residência","habitação","domicílio","morada"],
        related:["casarão","casinha","casal","casebre"],
      },
      { id:"michaelis", name:"Michaelis", shortName:"Michaelis", tag:"Dicionário Escolar",
        senses:[
          { num:"1", text:"Construção onde se mora." },
          { num:"2", text:"Lar, residência.", examples:['"Fique em casa."'] },
          { num:"3", text:"Negócio, empresa.", examples:['"Casa de moda."'] },
        ],
        synonyms:["lar","moradia","residência"],
        related:["moradia","habitação","domicílio"],
      },
    ],
  },
  carro: {
    word:"carro", partOfSpeech:"substantivo masculino", phonetic:"car-ro", gender:"masc.",
    synonyms:["automóvel","veículo","auto","viatura"],
    facts:[
      { label:"Sílaba Tônica",      value:"car (paroxítona)" },
      { label:"Separação Silábica", value:"car-ro" },
      { label:"Popularidade",       value:"Altíssima" },
      { label:"Plural",             value:"carros" },
    ],
    dicts:[
      { id:"aurelio", name:"Dicionário Aurélio", shortName:"Aurélio", tag:"Versão 2026",
        etymology:"Do latim carrus, de origem gaulesa.",
        senses:[
          { num:"1", text:"Veículo automóvel de passeio.", examples:['"Comprou um carro novo."'] },
          { num:"2", text:"Veículo de tração animal com rodas.", labels:["Histórico"] },
          { num:"3", text:"Elemento de destaque; ponto alto.", labels:["Figurado"],
            examples:['"O carro-chefe da empresa."'],
          },
        ],
        synonyms:["automóvel","auto","veículo"],
        related:["automóvel","carroça","carruagem"],
      },
      { id:"houaiss", name:"Dicionário Houaiss", shortName:"Houaiss", tag:"Edição Integral",
        etymology:"Lat. carrus, i 'carro de quatro rodas', do gaulês; ver carr(o)-.",
        senses:[
          { num:"1", text:"Veículo automóvel destinado ao transporte de pessoas.",
            subsenses:[
              { num:"1.1", text:"Automóvel de passeio de pequeno porte." },
              { num:"1.2", text:"Qualquer automóvel, independentemente do porte." },
            ],
          },
          { num:"2", text:"Veículo de rodas movido por tração animal.", labels:["Histórico"] },
          { num:"3", text:"O que mais se destaca ou tem maior valor em um conjunto.", labels:["Figurado"],
            examples:['"O carro-chefe do cardápio."'],
          },
        ],
        synonyms:["automóvel","veículo","auto","viatura","máquina"],
        related:["carruagem","carroça","veículo"],
      },
      { id:"michaelis", name:"Michaelis", shortName:"Michaelis", tag:"Dicionário Escolar",
        senses:[
          { num:"1", text:"Automóvel de passeio." },
          { num:"2", text:"Veículo com rodas puxado por animais.", labels:["Histórico"] },
        ],
        synonyms:["automóvel","auto"],
        related:["automóvel","veículo"],
      },
    ],
  },
};

export const SUGGESTIONS = ["terreno", "casa", "carro"];

export const SAVED_WORDS = [
  { word:"merencória", pos:"adj.",   snippet:"Diz-se de pessoa melancólica, triste, tristonha.",            when:"há 2 dias" },
  { word:"vellichor",  pos:"subst.", snippet:"A atmosfera nostálgica de sebos e livrarias antigas.",         when:"há 3 dias" },
  { word:"petrichor",  pos:"subst.", snippet:"O cheiro característico da terra molhada após a chuva.",       when:"há 5 dias" },
  { word:"efêmero",    pos:"adj.",   snippet:"Que dura apenas um dia; passageiro, transitório.",              when:"há 1 semana" },
  { word:"sussurro",   pos:"subst.", snippet:"Ruído brando e contínuo; som de vozes em tom baixo.",          when:"há 2 semanas" },
  { word:"apricidade", pos:"subst.", snippet:"O calor agradável do sol em pleno inverno.",                   when:"há 1 mês" },
];

export const TUTORIAL_SLIDES = [
  {
    id: "search",
    label: "01",
    title: "Pesquise em segundos",
    body: "Uma busca retorna resultados indexados de múltiplas fontes lexicográficas ao mesmo tempo.",
    mockup: "search" as const,
    accent: "#3D6647",
  },
  {
    id: "compare",
    label: "02",
    title: "Compare definições",
    body: "Escolha o dicionário e veja como cada um descreve a mesma palavra com nuances diferentes.",
    mockup: "definition" as const,
    accent: "#24456B",
  },
  {
    id: "save",
    label: "03",
    title: "Salve o que importa",
    body: "Crie sua biblioteca pessoal e acesse suas palavras favoritas quando quiser.",
    mockup: "saved" as const,
    accent: "#7A6520",
  },
];

export const PREF_OPTIONS = [
  "Vocabulário cotidiano",
  "Literatura & Poesia",
  "Termos científicos",
  "Filosofia",
  "Linguagem formal",
  "Curiosidades etimológicas",
  "Expressões idiomáticas",
  "Arcaísmos",
];

export const RECENT_SEARCHES = ["Efêmero", "Resiliência", "Nostalgia", "Saudade", "Melancolia"];

export const FAV_FILTERS = ["Todas", "Adjetivos", "Substantivos", "Verbos", "Recentes"] as const;

export type FavFilter = typeof FAV_FILTERS[number];

export const MOB_FAV_FILTERS = ["Todas", "Substantivos", "Adjetivos"] as const;

export type MobFavFilter = typeof MOB_FAV_FILTERS[number];
