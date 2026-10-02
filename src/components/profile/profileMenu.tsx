import { DICT_COLOR } from "@/lib/data"

export const TERMS_SECTIONS = [
  {
    title: "1. Aceitação dos Termos",
    body: "Ao acessar e usar o DICIOBASE, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, por favor não utilize nosso serviço.",
  },
  {
    title: "2. Uso do Serviço",
    body: "O DICIOBASE é um serviço de consulta lexicográfica que agrega conteúdo dos dicionários Aurélio, Houaiss e Michaelis. O conteúdo é disponibilizado para fins educacionais e de pesquisa pessoal.",
  },
  {
    title: "3. Conta do Usuário",
    body: "Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.",
  },
  {
    title: "4. Propriedade Intelectual",
    body: "Todo o conteúdo lexicográfico pertence aos respectivos editores dos dicionários. O código, design e interface do DICIOBASE são propriedade da equipe DICIOBASE.",
  },
  {
    title: "5. Privacidade",
    body: "Coletamos apenas os dados necessários para o funcionamento do serviço. Não vendemos ou compartilhamos seus dados pessoais com terceiros sem seu consentimento explícito.",
  },
  {
    title: "6. Limitação de Responsabilidade",
    body: "O DICIOBASE não garante a completude ou exatidão das definições exibidas. Para uso acadêmico ou profissional, recomendamos consultar as fontes originais.",
  },
]

export const DICT_LIST = [
  {
    id: "aurelio" as const,
    name: "Aurélio",
    tag: "Versão 2026",
    c: DICT_COLOR.aurelio,
  },
  {
    id: "houaiss" as const,
    name: "Houaiss",
    tag: "Edição Integral",
    c: DICT_COLOR.houaiss,
  },
  {
    id: "michaelis" as const,
    name: "Michaelis",
    tag: "Dicionário Escolar",
    c: DICT_COLOR.michaelis,
  },
]
