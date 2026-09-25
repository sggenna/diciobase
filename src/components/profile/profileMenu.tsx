import { ProfilePanel } from "@/lib/types"

export const PROFILE_MENU_ROWS = (
  setPanel: (p: ProfilePanel) => void,
  onLogout: () => void,
) => [
  {
    label: "Meu Perfil",
    sub: "Nome e foto de perfil",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    action: () => setPanel("edit-name"),
  },
  {
    label: "Notificações",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    badge: 1,
    action: () => setPanel("notifications"),
  },
  {
    label: "Dicionários ativos",
    sub: "Gerenciar fontes",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    action: () => setPanel("dicts"),
  },
  {
    label: "Alterar senha",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    action: () => setPanel("change-password"),
  },
  {
    label: "Termos de Uso",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    action: () => setPanel("terms"),
  },
  {
    label: "Sair da conta",
    danger: true,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    action: onLogout,
  },
]

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
  { id: "aurelio" as const, name: "Aurélio", tag: "Versão 2026", c: "#3D6647" },
  {
    id: "houaiss" as const,
    name: "Houaiss",
    tag: "Edição Integral",
    c: "#24456B",
  },
  {
    id: "michaelis" as const,
    name: "Michaelis",
    tag: "Dicionário Escolar",
    c: "#7A6520",
  },
]
