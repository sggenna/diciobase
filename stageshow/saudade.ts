import type { WordData } from '@/lib/types'

// The real entry, frozen: public/data/v1 run through what src/lib/words.ts does to it (fromApi), so the scene needs
// no network and never changes under a loop. The tab counts, "Também em" dots and order strip are all computed from this.
export const SAUDADE: WordData = {
  word: 'saudade',
  partOfSpeech: 'substantivo feminino',
  phonetic: '/saw.ˈda.dʒi/',
  phoneticSource: 'Wikcionário, Brasil',
  synonyms: ['anelo', 'anseio', 'desejo', 'nostalgia'],
  facts: [{ label: 'Plural', value: 'saudades', source: 'calculado' }],
  dicts: [
    {
      id: 'wikcionario',
      name: 'Wikcionário',
      shortName: 'Wikcionário',
      tag: 'Versão de 1 out. 2026 · CC BY-SA 4.0',
      etymology: 'Do latim solitas (solitas, solitatis).',
      senses: [
        { num: '1', text: 'memória ou recordação grata de pessoas, familiares ou objetos', examples: [] },
        {
          num: '2',
          text: 'sentimento experimentado entre duas ou mais pessoas que estão distantes, ou que ficam muito tempo sem se ver',
          labels: [{ text: 'Sentimento' }],
          examples: [],
        },
        { num: '3', text: 'lembrança', examples: [] },
        {
          num: '4',
          text: 'lembrança de pessoas ou coisas distantes ou não mais existentes, acompanhada da vontade de tornar a vê-las ou possuí-las',
          examples: [],
        },
        {
          num: '5',
          text: 'condição em que se tem sentimento de perda, lastimação, amargura, diante de aparente possibilidade de poder ter obtido o que desejava e parecia alcançável, que não se concretizou',
          examples: ['“Ela mudara de cidade e eu fiquei na saudade. Achei-me o cara mais injustiçado do planeta terra.”'],
        },
      ],
    },
    {
      id: 'dicionario-aberto',
      name: 'Dicionário Aberto',
      shortName: 'Dicionário Aberto',
      tag: 'Novo Diccionário da Língua Portuguesa, Cândido de Figueiredo, 1913 · CC BY-SA 2.5 PT',
      etymology: '(Alter, de soidade, de soledade)',
      senses: [
        {
          num: '1',
          text: 'Lembrança triste e suave de pessôas ou coisas distantes ou extintas, acompanhada do desejo de as tornar a possuir ou vêr presentes.',
          examples: [],
        },
        { num: '2', text: 'Pesar, pela ausência de alguém que nos é querido.', examples: [] },
        { num: '3', text: 'Nostalgia.', examples: [] },
        { num: '4', text: 'Nome de várias plantas ou da sua flôr.', labels: [{ text: 'Botânica' }], examples: [] },
        { num: '5', text: 'Planta, o mesmo que official-de-sala.', labels: [{ text: 'Bras. de Pernambuco' }], examples: [] },
        { num: '6', text: 'Cumprimentos, lembranças affectuosas, dirigidas a pessôas ausentes.', examples: ['“dê-lhe saudades”'] },
      ],
    },
    {
      id: 'wordnet',
      name: 'OpenWordnet-PT',
      shortName: 'OpenWordnet',
      tag: 'Rede semântica do português · CC-BY-4.0',
      senses: [
        { num: '1', text: 'desejo (ou necessidade) não realizado e prolongado', examples: [] },
        { num: '2', text: 'anseio por algo passado', examples: [] },
      ],
      synonyms: ['anelo', 'anseio', 'desejo', 'nostalgia'],
      related: ['anseio', 'apetite', 'desejo', 'pretensão', 'anelo', 'saudade'],
    },
  ],
}

// The synonym the tour follows, frozen the same way.
export const NOSTALGIA: WordData = {
  word: 'nostalgia',
  partOfSpeech: 'substantivo feminino',
  phonetic: '/nuʃ.taɫ.ˈʒi.ɐ/',
  phoneticSource: 'Wikcionário, Portugal',
  synonyms: ['pesar', 'pena', 'peso', 'tristeza', 'taciturnidade', 'tédio', 'postração', 'prostração', 'quebramento', 'quebrantamento', 'tristura', 'humilhação', 'diminuição', 'abatimento'],
  facts: [{ label: 'Plural', value: 'nostalgias', source: 'calculado' }],
  dicts: [
    {
      id: 'wikcionario',
      name: 'Wikcionário',
      shortName: 'Wikcionário',
      tag: 'Versão de 1 out. 2026 · CC BY-SA 4.0',
      senses: [{ num: '1', text: 'sentimento de tristeza motivado por profunda saudade', examples: [] }],
    },
    {
      id: 'dicionario-aberto',
      name: 'Dicionário Aberto',
      shortName: 'Dicionário Aberto',
      tag: 'Novo Diccionário da Língua Portuguesa, Cândido de Figueiredo, 1913 · CC BY-SA 2.5 PT',
      etymology: '(Do gr. nostos + algos)',
      senses: [{ num: '1', text: 'Abatimento ou tristeza profunda, resultante das saudades da pátria.', examples: [] }],
    },
    {
      id: 'wordnet',
      name: 'OpenWordnet-PT',
      shortName: 'OpenWordnet',
      tag: 'Rede semântica do português · CC-BY-4.0',
      senses: [{ num: '1', text: 'anseio por algo passado', examples: [] }],
      synonyms: ['pesar', 'pena', 'peso', 'tristeza', 'taciturnidade', 'tédio', 'postração', 'prostração', 'quebramento', 'quebrantamento', 'tristura', 'humilhação', 'diminuição', 'abatimento', 'desconto', 'abate', 'luto', 'baixa', 'declínio', 'amargura'],
      related: ['anelo', 'anseio', 'desejo', 'saudade'],
    },
  ],
}
