import { STATIC_SITE } from "@/lib/api"
import { DICT_COLOR, DICT_META } from "@/lib/data"

const ACCOUNT_TERMS = {
  title: "3. Conta do Usuário",
  body: "Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.",
}
const LOCAL_DATA_TERMS = {
  title: "3. Dados neste navegador",
  body: "O DICIOBASE não tem contas. Suas palavras salvas e preferências ficam apenas neste navegador e são apagadas se você limpar os dados do site.",
}

export const TERMS_SECTIONS = [
  {
    title: "1. Aceitação dos Termos",
    body: "Ao acessar e usar o DICIOBASE, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, por favor não utilize nosso serviço.",
  },
  {
    title: "2. Uso do Serviço",
    body: "O DICIOBASE é um serviço de consulta lexicográfica que reúne dicionários abertos do português: Wikcionário, Dicionário Aberto e OpenWordnet-PT, entre outras bases. Cada definição mostra a fonte, a edição e a licença de onde veio.",
  },
  STATIC_SITE ? LOCAL_DATA_TERMS : ACCOUNT_TERMS,
  {
    title: "4. Propriedade Intelectual",
    body: "O conteúdo lexicográfico segue a licença de cada fonte (CC BY-SA 4.0, CC BY-SA 2.5 PT, CC BY 4.0 e outras, listadas em cada verbete) e mantém a atribuição aos seus autores. O código, design e interface do DICIOBASE são propriedade da equipe DICIOBASE.",
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

export function TermsContent() {
  return (
    <div className="flex flex-col gap-6">
      {TERMS_SECTIONS.map((sec) => (
        <div key={sec.title}>
          <p className="text-ink font-semibold mb-1" style={{ fontSize: 16 }}>
            {sec.title}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-label-secondary)" }}>
            {sec.body}
          </p>
        </div>
      ))}
      <p className="text-muted" style={{ fontSize: 12 }}>
        Última atualização: {STATIC_SITE ? "Novembro" : "Setembro"} de 2026
      </p>
    </div>
  )
}

export const DICT_LIST = [
  { id: "wikcionario" as const, name: "Wikcionário", tag: DICT_META.wikcionario!.edition, c: DICT_COLOR.wikcionario },
  { id: "dicionario-aberto" as const, name: "Dicionário Aberto", tag: "Cândido de Figueiredo, 1913", c: DICT_COLOR["dicionario-aberto"] },
  { id: "wordnet" as const, name: "OpenWordnet-PT", tag: DICT_META.wordnet!.edition, c: DICT_COLOR.wordnet },
]
