import { useState, useEffect, useRef } from "react";
import SwipeToast from "./SwipeToast";

// ─── Assets ────────────────────────────────────────────────────────────────
const A = "/assets";
const imgLogoLight    = `${A}/ca2f2.svg`;
const imgLogoDark     = `${A}/8fe6c.svg`;
const imgLogoHero     = `${A}/69911.svg`;
const imgLogoDark2    = `${A}/0a6dc.svg`;
const imgUser         = `${A}/8b264.png`;
const imgHeart        = `${A}/9f496.png`;
const imgAudio        = `${A}/50e09.svg`;
const imgBookmark     = `${A}/cab18.svg`;
const imgShare        = `${A}/df717.svg`;
const imgSearchIcon   = `${A}/a764c.svg`;
const imgStarIcon     = `${A}/76c35.svg`;
const imgBookIcon     = `${A}/b33d9.svg`;
const imgUserIcon     = `${A}/930da.svg`;

// ─── Dictionary colours ────────────────────────────────────────────────────
const DICT_COLOR: Record<string, string> = {
  aurelio:  "#3D6647",
  houaiss:  "#24456B",
  michaelis: "#7A6520",
};

// ─── Data ──────────────────────────────────────────────────────────────────
interface Sense {
  num: string;
  text: string;
  labels?: string[];
  subsenses?: { num: string; text: string }[];
  examples?: string[];
}
interface DictEntry {
  id: string; name: string; shortName: string; tag: string;
  etymology?: string; senses: Sense[];
  notes?: string[]; synonyms?: string[]; related?: string[];
}
interface WordData {
  word: string; partOfSpeech: string; phonetic: string; gender?: string;
  dicts: DictEntry[]; synonyms: string[];
  facts: { label: string; value: string }[];
}

const DB: Record<string, WordData> = {
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

const SUGGESTIONS = ["terreno", "casa", "carro"];

const SAVED_WORDS = [
  { word:"merencória", pos:"adj.",   snippet:"Diz-se de pessoa melancólica, triste, tristonha.",            when:"há 2 dias" },
  { word:"vellichor",  pos:"subst.", snippet:"A atmosfera nostálgica de sebos e livrarias antigas.",         when:"há 3 dias" },
  { word:"petrichor",  pos:"subst.", snippet:"O cheiro característico da terra molhada após a chuva.",       when:"há 5 dias" },
  { word:"efêmero",    pos:"adj.",   snippet:"Que dura apenas um dia; passageiro, transitório.",              when:"há 1 semana" },
  { word:"sussurro",   pos:"subst.", snippet:"Ruído brando e contínuo; som de vozes em tom baixo.",          when:"há 2 semanas" },
  { word:"apricidade", pos:"subst.", snippet:"O calor agradável do sol em pleno inverno.",                   when:"há 1 mês" },
];

const TUTORIAL_SLIDES = [
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

const PREF_OPTIONS = [
  "Vocabulário cotidiano",
  "Literatura & Poesia",
  "Termos científicos",
  "Filosofia",
  "Linguagem formal",
  "Curiosidades etimológicas",
  "Expressões idiomáticas",
  "Arcaísmos",
];

const RECENT_SEARCHES = ["Efêmero", "Resiliência", "Nostalgia", "Saudade", "Melancolia"];

// ─── Hooks ────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mobile;
}

function useFade(dep: unknown) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setVis(false);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setVis(true)));
    return () => cancelAnimationFrame(t);
  }, [dep]);
  return vis;
}

function fadeStyle(vis: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.36s ease ${delay}s, transform 0.36s ease ${delay}s`,
  };
}

function slideUpStyle(vis: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
  };
}

// ─── Shared desktop UI ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[rgba(0,0,0,0.94)] px-10 py-10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <img src={imgLogoDark} alt="Diciobase" className="h-[30px] w-auto" />
        <p className="font-['Poppins:Regular'] text-[13px] text-white/70 tracking-[-0.26px]">
          DICIOBASE @ All Rights Reserved
        </p>
      </div>
    </footer>
  );
}

function AuthInput({
  label, placeholder, type = "text", hint, hintAction,
}: {
  label: string; placeholder: string; type?: string;
  hint?: string; hintAction?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="font-['Poppins:SemiBold'] text-[15px] text-white">{label}</span>
        {hint && (
          <button onClick={hintAction}
            className="font-['Poppins:Regular'] text-[13px] text-white/60 underline hover:text-white/90 transition-colors">
            {hint}
          </button>
        )}
      </div>
      <input
        type={type} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-[52px] px-5 rounded-[14px] bg-[#d9d9d9] font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#7e7676] outline-none transition-all duration-200"
        style={{ boxShadow: focused ? "0 0 0 2px rgba(255,255,255,0.3)" : "none" }}
      />
    </div>
  );
}

// ─── Auth Modal ────────────────────────────────────────────────────────────
function AuthModal({
  defaultMode,
  onAuth,
  onClose,
}: {
  defaultMode: "login" | "signup";
  onAuth: () => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const vis = useFade(mode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-[460px] bg-[#0f0e0c] rounded-[32px] p-8 sm:p-10 flex flex-col gap-5 shadow-2xl my-auto"
        style={fadeStyle(vis)}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center pt-1">
          <img src={imgLogoDark} alt="DICIOBASE" className="h-8 w-auto" />
        </div>

        {/* Mode tabs */}
        <div className="flex bg-white/10 rounded-full p-1">
          {(["login","signup"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 h-9 rounded-full font-['Poppins:SemiBold'] text-[13px] transition-all duration-200"
              style={{
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#0f0e0c" : "rgba(255,255,255,0.55)",
              }}
            >
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {mode === "signup" && (
            <AuthInput label="Nome" placeholder="Seu nome" />
          )}
          <AuthInput label="E-mail" placeholder="seu@email.com" />
          <AuthInput
            label="Senha"
            placeholder="••••••••••••"
            type="password"
            hint={mode === "login" ? "Esqueceu?" : undefined}
          />
          {mode === "signup" && (
            <AuthInput label="Confirme a senha" placeholder="••••••••••••" type="password" />
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onAuth}
          className="w-full h-[52px] bg-white rounded-[16px] font-['Poppins:SemiBold'] text-[16px] text-[#0f0e0c] hover:bg-[#f0ede6] transition-all duration-200 active:scale-[0.98]"
        >
          {mode === "login" ? "Entrar" : "Criar conta gratuita"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/15" />
          <span className="font-['Poppins:Regular'] text-[12px] text-white/40">ou continue com</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Social */}
        <div className="flex gap-3">
          {[
            { label: "Google", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )},
            { label: "Apple", icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.41.83 3.22.86 1.22-.25 2.39-1.02 3.68-.88 1.56.18 2.73.84 3.48 2.1-3.2 1.96-2.43 6.01.29 7.24-.56 1.55-1.27 3.09-2.67 4.56zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )},
          ].map(s => (
            <button key={s.label}
              className="flex-1 h-11 rounded-[12px] bg-white/10 flex items-center justify-center gap-2 hover:bg-white/20 transition-colors font-['Poppins:Medium'] text-[13px] text-white/80">
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        <p className="text-center font-['Poppins:Regular'] text-[12px] text-white/35 -mt-2">
          Ao continuar, você aceita nossos{" "}
          <span className="underline cursor-pointer text-white/55 hover:text-white/75 transition-colors">Termos de Uso</span>
        </p>
      </div>
    </div>
  );
}

// ─── Desktop Landing Page (no longer used as a separate page — now inline modal host) ──
function LandingPage({
  defaultModal,
  onAuth,
}: {
  defaultModal?: "login" | "signup";
  onAuth: () => void;
}) {
  const [modal, setModal] = useState<"login" | "signup" | null>(defaultModal ?? null);
  const heroVis = useFade("hero");

  const FEATURES = [
    {
      accent: "#3D6647",
      title: "Pesquise em segundos",
      body: "Digite qualquer palavra e obtenha definições completas de múltiplos dicionários em uma única tela.",
      mockup: TutorialMockupSearch,
    },
    {
      accent: "#24456B",
      title: "Compare definições",
      body: "Veja lado a lado como Aurélio, Houaiss e Michaelis descrevem a mesma palavra.",
      mockup: TutorialMockupDefinition,
    },
    {
      accent: "#7A6520",
      title: "Salve o que importa",
      body: "Marque palavras para revisitar depois. Seu vocabulário cresce com você.",
      mockup: TutorialMockupSaved,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[rgba(251,249,246,0.88)] border-b border-[#e8e4dc]"
        style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-[1100px] mx-auto px-8 h-16 flex items-center justify-between">
          <img src={imgLogoLight} alt="DICIOBASE" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModal("login")}
              className="h-9 px-5 rounded-full font-['Poppins:Medium'] text-[14px] text-[#1c1b19] hover:bg-black/5 transition-colors">
              Entrar
            </button>
            <button
              onClick={() => setModal("signup")}
              className="h-9 px-5 rounded-full bg-[#1c1b19] font-['Poppins:SemiBold'] text-[14px] text-white hover:bg-black/80 transition-colors">
              Criar conta
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28"
        style={fadeStyle(heroVis)}>
        <img src={imgLogoHero} alt="DICIOBASE" className="h-20 w-auto mb-8" />
        <h1 className="font-['Poppins:ExtraBold'] text-[56px] text-[#1c1b19] tracking-[-2px] leading-none max-w-[640px]">
          Todos os dicionários.<br />Uma só busca.
        </h1>
        <p className="mt-5 font-['Poppins:Regular'] text-[18px] text-[#6b6760] max-w-[480px] leading-relaxed">
          Consulte Aurélio, Houaiss e Michaelis simultaneamente e descubra a riqueza da língua portuguesa.
        </p>
        <div className="mt-10 flex items-center gap-3">
          <button
            onClick={() => setModal("signup")}
            className="h-12 px-8 rounded-full bg-[#1c1b19] font-['Poppins:SemiBold'] text-[15px] text-white hover:bg-black/80 transition-all duration-200 active:scale-[0.97] shadow-lg shadow-black/10">
            Começar gratuitamente
          </button>
          <button
            onClick={() => setModal("login")}
            className="h-12 px-7 rounded-full border border-[#d5d1c9] font-['Poppins:Medium'] text-[15px] text-[#1c1b19] hover:bg-black/5 transition-colors">
            Já tenho conta
          </button>
        </div>
        {/* Word count badge */}
        <div className="mt-8 flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[#e8e4dc] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#3D6647]" />
          <span className="font-['Poppins:Medium'] text-[13px] text-[#6b6760]">
            +500.000 verbetes em 3 dicionários
          </span>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#e8e4dc]" />

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-center font-['Poppins:SemiBold'] text-[11px] uppercase tracking-[2px] text-[#a09c94] mb-3">
            Funcionalidades
          </p>
          <h2 className="text-center font-['Poppins:ExtraBold'] text-[38px] text-[#1c1b19] tracking-[-1px] mb-16">
            Feito para quem ama palavras
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {FEATURES.map((f, i) => {
              const MockupComp = f.mockup;
              return (
                <div key={i} className="flex flex-col gap-5">
                  {/* mini browser mockup */}
                  <div className="w-full aspect-[4/3] rounded-[20px] overflow-hidden border border-[#e0ddd6] shadow-md">
                    <div className="h-8 bg-[#f0ede6] flex items-center px-3 gap-1.5 border-b border-[#e0ddd6]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e0ddd6]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e0ddd6]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e0ddd6]" />
                    </div>
                    <div className="h-[calc(100%-32px)]">
                      <MockupComp />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 -mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: f.accent }} />
                    <span className="font-['Poppins:SemiBold'] text-[11px] uppercase tracking-[1.5px]" style={{ color: f.accent }}>
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-['Poppins:Bold'] text-[20px] text-[#1c1b19] tracking-[-0.3px]">
                    {f.title}
                  </h3>
                  <p className="font-['Poppins:Regular'] text-[14px] text-[#6b6760] leading-relaxed -mt-2">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[#1c1b19] py-20 px-6">
        <div className="max-w-[600px] mx-auto flex flex-col items-center text-center gap-6">
          <img src={imgLogoDark} alt="DICIOBASE" className="h-8 w-auto" />
          <h2 className="font-['Poppins:ExtraBold'] text-[36px] text-white tracking-[-1px] leading-tight">
            Amplie seu vocabulário hoje
          </h2>
          <p className="font-['Poppins:Regular'] text-[15px] text-white/60 leading-relaxed">
            Crie sua conta gratuita e acesse os três maiores dicionários do português em um só lugar.
          </p>
          <button
            onClick={() => setModal("signup")}
            className="h-12 px-8 rounded-full bg-white font-['Poppins:SemiBold'] text-[15px] text-[#1c1b19] hover:bg-[#f0ede6] transition-all duration-200 active:scale-[0.97]">
            Criar conta gratuita
          </button>
        </div>
      </section>

      <Footer />

      {/* Modal */}
      {modal && (
        <AuthModal
          defaultMode={modal}
          onAuth={onAuth}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ─── Tutorial mockup mini-renders ─────────────────────────────────────────
function TutorialMockupSearch() {
  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f0ede6]">
        <div className="bg-[#1c1b19] rounded-[3px]" style={{ width: 72, height: 13 }} />
        <div className="flex-1 h-[26px] rounded-full bg-[#f5f2eb] flex items-center px-3 gap-2">
          <div className="size-[8px] rounded-full bg-[#c0bcb4]" />
          <div className="flex-1 h-[5px] rounded-full bg-[#e0ddd6]" />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div className="bg-[#1c1b19] rounded-[4px]" style={{ width: 140, height: 24 }} />
        <div className="h-[9px] rounded-full bg-[#e0ddd6]" style={{ width: 200 }} />
        <div className="w-full max-w-[280px] h-[44px] rounded-full border border-[#c0bcb4] bg-white flex items-center px-4 gap-2.5">
          <div className="size-[12px] rounded-full bg-[#d0ccc4]" />
          <div className="flex-1 h-[8px] rounded-full bg-[#efece6]" />
        </div>
        <div className="flex gap-2 mt-1">
          {["terreno", "casa", "carro"].map(w => (
            <div key={w} className="px-3 py-1.5 rounded-full border border-[#c0bcb4] font-['Poppins:Regular'] text-[11px] text-[#4a4742]">{w}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TutorialMockupDefinition() {
  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f0ede6]">
        <div className="bg-[#1c1b19] rounded-[3px]" style={{ width: 72, height: 13 }} />
        <div className="flex-1 h-[22px] rounded-full bg-[#f5f2eb]" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-[#f0ede6] flex flex-col shrink-0" style={{ width: "32%" }}>
          <div className="px-4 py-3 border-b border-[#f0ede6]">
            <div className="font-['Poppins:ExtraBold'] text-[15px] text-[#1c1b19]">efêmero</div>
            <div className="h-[5px] w-[55px] bg-[#e0ddd6] rounded-full mt-1.5" />
          </div>
          {[{ name:"Aurélio", c:"#3D6647" }, { name:"Houaiss", c:"#24456B" }, { name:"Michaelis", c:"#7A6520" }].map((d, i) => (
            <div key={d.name} className="px-4 py-2.5 border-b border-[#f0ede6]"
              style={{ background: i === 0 ? "#f5f2eb" : "white" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="size-[6px] rounded-full shrink-0" style={{ background: d.c }} />
                <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 10, color: "#1c1b19" }}>{d.name}</span>
              </div>
              <div className="h-[5px] rounded-full bg-[#e0ddd6]" style={{ width: i === 0 ? "88%" : "65%" }} />
            </div>
          ))}
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col gap-2">
          <div className="flex gap-1.5">
            {[{ name:"Aurélio", c:"#3D6647" }].map(d => (
              <div key={d.name} className="px-2.5 py-1 rounded-full text-white text-[9px]"
                style={{ background: d.c, fontFamily: "'Poppins:SemiBold'" }}>{d.name}</div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {[100, 88, 72].map((w, i) => (
              <div key={i} className="h-[5px] rounded-full bg-[#e0ddd6]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-2 h-[5px] w-[45%] rounded-full bg-[#c8c4bc]" />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {["fugaz","transitório","passageiro"].map(w => (
              <div key={w} className="px-2 py-0.5 rounded-full border border-[#c8c4bc] text-[9px] font-['Poppins:Regular'] text-[#4a4742]">{w}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorialMockupSaved() {
  const words = [
    { word:"merencória", pos:"adj." },
    { word:"vellichor", pos:"subst." },
    { word:"petrichor", pos:"subst." },
  ];
  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f0ede6]">
        <div className="bg-[#1c1b19] rounded-[3px]" style={{ width: 72, height: 13 }} />
        <div className="flex-1 h-[22px] rounded-full bg-[#f5f2eb]" />
      </div>
      <div className="px-5 pt-4 pb-2">
        <div className="font-['Poppins:Bold'] text-[16px] text-[#1c1b19]">Palavras Favoritas</div>
        <div className="h-[5px] w-[160px] rounded-full bg-[#e0ddd6] mt-1.5" />
        <div className="h-[28px] rounded-[8px] border border-[#e0ddd6] bg-[#f5f2eb] flex items-center px-3 gap-2 mt-3">
          <div className="size-[8px] rounded-full bg-[#c0bcb4]" />
          <div className="flex-1 h-[5px] rounded-full bg-[#e0ddd6]" />
        </div>
        <div className="flex gap-2 mt-2">
          {["Todas","Adjetivos","Substantivos"].map((f, i) => (
            <div key={f} className="px-2.5 py-1 rounded-full text-[9px] font-['Poppins:SemiBold']"
              style={{ background: i === 0 ? "#1c1b19" : "#f5f2eb", color: i === 0 ? "#fff" : "#4a4742" }}>{f}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-col px-5">
        {words.map((w, i) => (
          <div key={w.word} className="flex items-center justify-between py-2.5"
            style={{ borderTop: i > 0 ? "1px solid #efece6" : undefined }}>
            <div>
              <span className="font-['Poppins:Bold'] text-[13px] text-[#1c1b19]">{w.word} </span>
              <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 9, color: "#8c8a82" }}>{w.pos}</span>
              <div className="h-[5px] w-[120px] rounded-full bg-[#e0ddd6] mt-1" />
            </div>
            <div className="size-[14px] rounded-[3px] border border-[#c8c4bc]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Desktop Tutorial ──────────────────────────────────────────────────────
function TutorialPage({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [slideVis, setSlideVis] = useState(true);
  const total = TUTORIAL_SLIDES.length;
  const slide = TUTORIAL_SLIDES[step];

  function goTo(i: number) {
    setSlideVis(false);
    setTimeout(() => { setStep(i); setSlideVis(true); }, 180);
  }

  const Mockup = slide.mockup === "search"
    ? TutorialMockupSearch
    : slide.mockup === "definition"
    ? TutorialMockupDefinition
    : TutorialMockupSaved;

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col">
      <nav className="px-10 py-5 flex items-center justify-between shrink-0">
        <img src={imgLogoLight} alt="Diciobase" className="h-9 w-auto" />
        <button onClick={onFinish}
          className="font-['Poppins:Medium'] text-[13px] text-[#8c8a82] hover:text-black transition-colors px-4 py-2 rounded-[8px] hover:bg-black/5">
          Pular
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center px-8 py-6">
        <div className="flex items-center gap-16 max-w-[1100px] w-full">
          {/* Browser mockup */}
          <div className="flex-1 flex flex-col rounded-[16px] overflow-hidden border border-[#e0ddd6]"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
              opacity: slideVis ? 1 : 0,
              transform: slideVis ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}>
            {/* Browser chrome */}
            <div className="bg-[#f0ede6] flex items-center gap-3 px-4 py-3 shrink-0">
              <div className="flex gap-1.5">
                <div className="size-[10px] rounded-full bg-[#d0ccc4]" />
                <div className="size-[10px] rounded-full bg-[#d0ccc4]" />
                <div className="size-[10px] rounded-full bg-[#d0ccc4]" />
              </div>
              <div className="flex-1 h-[22px] rounded-[6px] bg-white border border-[#e0ddd6] flex items-center px-3">
                <span className="font-['Poppins:Regular'] text-[10px] text-[#8c8a82]">diciobase.com</span>
              </div>
            </div>
            {/* App content */}
            <div style={{ height: 380 }}>
              <Mockup />
            </div>
          </div>

          {/* Text panel */}
          <div className="w-[340px] shrink-0 flex flex-col gap-6"
            style={{
              opacity: slideVis ? 1 : 0,
              transform: slideVis ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.28s ease 0.05s, transform 0.28s ease 0.05s",
            }}>
            {/* Dots */}
            <div className="flex gap-2">
              {TUTORIAL_SLIDES.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="h-[3px] rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 28 : 10,
                    background: i === step ? "#1c1b19" : "#d0ccc4",
                  }} />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-['Poppins:Regular'] text-[11px] uppercase tracking-[1.2px] text-[#8c8a82]">
                {slide.label} / {String(total).padStart(2, "0")}
              </span>
              <h2 className="font-['Poppins:ExtraBold'] text-[36px] text-[#1c1b19] leading-tight tracking-[-1.4px]">
                {slide.title}
              </h2>
              <p className="font-['Poppins:Regular'] text-[16px] text-[#7e7676] leading-[1.65]">
                {slide.body}
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              {step > 0 && (
                <button onClick={() => goTo(step - 1)}
                  className="h-[48px] px-6 rounded-[12px] border border-[#c8c4bc] font-['Poppins:SemiBold'] text-[14px] text-[#1c1b19] hover:border-black transition-all">
                  Anterior
                </button>
              )}
              {step < total - 1 ? (
                <button onClick={() => goTo(step + 1)}
                  className="h-[48px] px-8 rounded-[12px] bg-[#1c1b19] font-['Poppins:SemiBold'] text-[14px] text-white hover:bg-black transition-all active:scale-[0.97]">
                  Avançar
                </button>
              ) : (
                <button onClick={onFinish}
                  className="h-[48px] px-8 rounded-[12px] bg-[#1c1b19] font-['Poppins:SemiBold'] text-[14px] text-white hover:bg-black transition-all active:scale-[0.97]">
                  Começar agora
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Desktop Preferences ───────────────────────────────────────────────────
function PreferencesPage({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const vis = useFade("prefs");

  function toggle(opt: string) {
    setSelected(s => {
      const next = new Set(s);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col">
      <nav className="px-10 py-5 flex items-center justify-between shrink-0">
        <img src={imgLogoLight} alt="Diciobase" className="h-9 w-auto" />
        <button onClick={onContinue}
          className="font-['Poppins:Medium'] text-[13px] text-[#8c8a82] hover:text-black transition-colors">
          Pular
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px] flex flex-col gap-8" style={fadeStyle(vis)}>
          <div className="flex flex-col gap-2">
            <h1 className="font-['Poppins:ExtraBold'] text-[38px] text-[#1c1b19] tracking-[-1.5px] leading-tight">
              O que te interessa?
            </h1>
            <p className="font-['Poppins:Regular'] text-[15px] text-[#7e7676]">
              Personalize sua experiência. Escolha quantos quiser.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {PREF_OPTIONS.map(opt => {
              const on = selected.has(opt);
              return (
                <button key={opt} onClick={() => toggle(opt)}
                  className="px-5 py-2.5 rounded-[24px] font-['Poppins:Medium'] text-[14px] transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: on ? "#1c1b19" : "#fff",
                    color: on ? "#fff" : "#1c1b19",
                    border: on ? "1.5px solid #1c1b19" : "1.5px solid #d0ccc4",
                  }}>
                  {opt}
                </button>
              );
            })}
          </div>

          <button onClick={onContinue}
            className="w-full h-[52px] bg-[#1c1b19] rounded-[14px] font-['Poppins:SemiBold'] text-[15px] text-white hover:bg-black transition-all active:scale-[0.98]">
            Continuar
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Desktop App Nav ───────────────────────────────────────────────────────
function AppNav({
  onHome, onFavorites, onProfile, onSearch, searchValue, onSearchChange, isLoggedIn, hideSearch,
}: {
  onHome: () => void;
  onFavorites: () => void;
  onProfile: () => void;
  onSearch: (q: string) => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  isLoggedIn?: boolean;
  hideSearch?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchValue.trim().toLowerCase();
    if (q) onSearch(q);
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
      <div className="max-w-[1400px] mx-auto px-8 h-[60px] flex items-center gap-5">
        <button onClick={onHome} className="shrink-0 h-8 w-auto transition-opacity hover:opacity-60">
          <img src={imgLogoLight} alt="Diciobase" className="h-full w-auto" />
        </button>
        {!hideSearch && (
          <form onSubmit={submit} className="flex-1 max-w-[480px]">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9e9b94]"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={searchValue} onChange={e => onSearchChange(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="Pesquise uma palavra…"
                className="w-full h-[36px] pl-9 pr-4 rounded-[9px] bg-[#f5f2eb] font-['Poppins:Regular'] text-[13px] text-black placeholder-[#9e9b94] outline-none transition-all duration-200"
                style={{ boxShadow: focused ? "0 0 0 2px #1c1b19" : "none" }} />
            </div>
          </form>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={onFavorites}
            className="h-[34px] px-3.5 rounded-[9px] font-['Poppins:Medium'] text-[13px] text-[#4a4742] hover:bg-[#f5f2eb] hover:text-black transition-all flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="hidden sm:inline">Salvos</span>
          </button>
          <button onClick={onProfile}
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center hover:bg-black transition-colors ml-1"
            style={{ background: isLoggedIn ? "#1c1b19" : "#e8e4dc" }}>
            {isLoggedIn
              ? <span className="font-['Poppins:Bold'] text-[13px] text-white">M</span>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6760" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            }
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Desktop Home ──────────────────────────────────────────────────────────
function HomePage({ onSearch, onOpenAuth }: { onSearch: (word: string) => void; onOpenAuth?: () => void }) {
  const vis = useFade("home");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (q) onSearch(q);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-10 py-5 flex items-center justify-between">
        <img src={imgLogoLight} alt="Diciobase" className="h-10 w-auto" />
        <div className="flex items-center gap-5">
          <button onClick={onOpenAuth} className="size-8 flex items-center justify-center rounded-full bg-[#f0ede6] hover:bg-[#e0ddd6] transition-colors border border-[#d5d1c9]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6760" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </button>
          <img src={imgHeart} alt="Favoritos" className="size-7 object-contain cursor-pointer hover:opacity-60 transition-opacity" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
        <div className="flex flex-col items-center gap-8 w-full max-w-[680px]" style={fadeStyle(vis)}>
          <img src={imgLogoHero} alt="DICIOBASE" className="h-20 w-auto" />

          <p className="font-['Poppins:Regular'] text-[32px] md:text-[36px] text-black tracking-[-0.72px] text-center leading-tight">
            Todos os dicionários em um lugar.
          </p>

          <form onSubmit={submit} className="w-full flex flex-col gap-5">
            <div className="relative w-full" style={{
              filter: focused ? "drop-shadow(0 6px 24px rgba(0,0,0,0.12))" : "none",
              transition: "filter 0.3s ease",
            }}>
              <input value={query} onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="Pesquise algo"
                className="w-full h-[60px] px-7 rounded-[32px] border font-['Poppins:Light'] text-[22px] text-black tracking-[-1.2px] placeholder-[#7e7676] bg-white outline-none transition-all duration-250"
                style={{ borderColor: focused ? "#000" : "#7e7676" }} />
              {query && (
                <button type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white font-['Poppins:SemiBold'] text-[13px] px-5 py-2.5 rounded-[24px] hover:bg-[#333] transition-all active:scale-95">
                  Buscar
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-['Poppins:Regular'] text-[15px] text-black/70">Comece com:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => onSearch(s)}
                    className="px-4 py-1.5 rounded-[24px] border border-black/20 font-['Poppins:Regular'] text-[13px] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200 capitalize">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Shared DictEntry (desktop + mobile) ──────────────────────────────────
function DictEntryView({ entry, onSearch }: { entry: DictEntry; onSearch: (w: string) => void }) {
  const color = DICT_COLOR[entry.id] ?? "#000";
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[24px] text-white font-['Poppins:SemiBold'] text-[12px]"
          style={{ background: color }}>
          <span className="size-1.5 rounded-full bg-white/60 inline-block" />
          {entry.name}
        </span>
        <span className="font-['Poppins:Regular'] text-[12px] text-[#8c8a82]">{entry.tag}</span>
      </div>

      {entry.etymology && (
        <div className="flex flex-col gap-2">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">Etimologia</span>
          <div className="border-l-2 border-[#d5d0c6] pl-4">
            <p className="font-['Poppins:Italic'] italic text-[14px] text-[#4a4742] leading-[1.6]">{entry.etymology}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676] mb-3 block">Definição</span>
        <div className="flex flex-col gap-5">
          {entry.senses.map(sense => (
            <div key={sense.num} className="flex gap-4">
              <span className="font-['Poppins:Bold'] text-[12px] text-[#7e7676] shrink-0 w-5 pt-[3px]">{sense.num}.</span>
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2">
                  {sense.labels?.map(l => (
                    <span key={l}
                      className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.6px] border border-[#c8c4bc] text-[#7e7676] rounded-[4px] px-1.5 py-0.5 shrink-0">
                      {l}
                    </span>
                  ))}
                  <p className="font-['Poppins:Regular'] text-[15px] text-[#1c1b19] leading-[1.65]">{sense.text}</p>
                </div>
                {sense.subsenses && (
                  <div className="flex flex-col gap-2 pl-4 border-l border-[#e0ddd6]">
                    {sense.subsenses.map(sub => (
                      <div key={sub.num} className="flex gap-3">
                        <span className="font-['Poppins:Medium'] text-[11px] text-[#9e9b94] shrink-0 pt-[2px]">{sub.num}</span>
                        <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]">{sub.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {sense.examples && sense.examples.length > 0 && (
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#d5d0c6]">
                    {sense.examples.map((ex, i) => (
                      <p key={i} className="font-['Poppins:Italic'] italic text-[13px] text-[#7e7676] leading-[1.6]">{ex}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {entry.notes && entry.notes.length > 0 && (
        <div className="bg-[#f5f2eb] rounded-[12px] px-5 py-4 flex flex-col gap-1">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">Notas</span>
          {entry.notes.map((n, i) => (
            <p key={i} className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]">{n}</p>
          ))}
        </div>
      )}

      {entry.related && entry.related.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">Relacionadas</span>
          <div className="flex flex-wrap gap-2">
            {entry.related.map(w => (
              <button key={w} onClick={() => onSearch(w)}
                className="px-3 py-1.5 rounded-[20px] border border-black/15 font-['Poppins:Regular'] text-[13px] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200">
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {entry.synonyms && entry.synonyms.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#7e7676]">Sinônimos neste dicionário</span>
          <div className="flex flex-wrap gap-2">
            {entry.synonyms.map(w => (
              <button key={w} onClick={() => onSearch(w)}
                className="px-3 py-1.5 rounded-[20px] border border-black/15 font-['Poppins:Regular'] text-[13px] text-[#4a4742] hover:border-black hover:bg-black hover:text-white transition-all duration-200">
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Desktop Definition ────────────────────────────────────────────────────
function DefinitionPage({
  wordData, onSearch, onBack, isLoggedIn, onOpenAuth,
}: {
  wordData: WordData; onSearch: (w: string) => void; onBack: () => void;
  isLoggedIn?: boolean; onOpenAuth?: (then?: () => void) => void;
}) {
  const [activeId, setActiveId] = useState(wordData.dicts[0].id);
  const [contentVis, setContentVis] = useState(true);
  const [saved, setSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [btnPop, setBtnPop] = useState(false);

  function handleSave() {
    if (!isLoggedIn) {
      onOpenAuth?.(() => {
        setSaved(true);
        setToastKey(k => k + 1);
        setBtnPop(true); setTimeout(() => setBtnPop(false), 400);
      });
      return;
    }
    const next = !saved;
    setSaved(next);
    if (next) { setToastKey(k => k + 1); setBtnPop(true); setTimeout(() => setBtnPop(false), 400); }
  }
  const pageVis = useFade(wordData.word);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActiveId(wordData.dicts[0].id); }, [wordData.word]);

  function switchDict(id: string) {
    if (id === activeId) return;
    setContentVis(false);
    setTimeout(() => {
      setActiveId(id);
      setContentVis(true);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 160);
  }

  function playAudio() {
    setAudioPlaying(true);
    setTimeout(() => setAudioPlaying(false), 1600);
  }

  const activeEntry = wordData.dicts.find(d => d.id === activeId) ?? wordData.dicts[0];
  const color = DICT_COLOR[activeId] ?? "#000";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={fadeStyle(pageVis)}>
      <main className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)", marginTop: 64 }}>
        <aside className="w-[280px] shrink-0 border-r border-black/8 flex flex-col overflow-y-auto hidden md:flex">
          <div className="px-6 pt-8 pb-5 border-b border-black/8">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-['Poppins:ExtraBold'] text-[34px] text-black leading-tight">{wordData.word}</h1>
              {wordData.gender && (
                <span className="font-['Poppins:Regular'] text-[12px] text-[#7e7676] border border-[#c8c4bc] px-2 py-0.5 rounded-[4px]">
                  {wordData.gender}
                </span>
              )}
            </div>
            <p className="font-['Poppins:Regular'] text-[14px] text-[#7e7676] mt-1">[ {wordData.phonetic} ]</p>
            <p className="font-['Poppins:Medium'] text-[12px] text-[#9e9b94] uppercase tracking-[0.5px] mt-1">
              {wordData.partOfSpeech}
            </p>
          </div>

          <div className="mx-4 mt-6 mb-4 bg-[#f5f2eb] rounded-[16px] p-5 flex flex-col gap-3">
            {wordData.facts.map(f => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <span className="font-['Poppins:Regular'] text-[9px] uppercase tracking-[0.6px] text-[#7e7676]">{f.label}</span>
                <span className="font-['Poppins:SemiBold'] text-[13px] text-[#1c1b19]">{f.value}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-5 border-b border-black/8 flex items-center justify-between gap-4 shrink-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3 flex-wrap md:hidden">
                <span className="font-['Poppins:ExtraBold'] text-[28px] text-black">{wordData.word}</span>
                <span className="font-['Poppins:Medium'] text-[12px] text-black uppercase tracking-[0.5px]">{wordData.partOfSpeech}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-['Poppins:Regular'] text-[15px] text-[#7e7676] hidden md:inline">[ {wordData.phonetic} ]</span>
                <button onClick={playAudio}
                  className="flex items-center gap-2 bg-[#f5f2eb] hover:bg-[#ede9e0] px-3 py-1.5 rounded-[8px] transition-all duration-200">
                  <img src={imgAudio} alt="" className="size-[13px]"
                    style={{ transform: audioPlaying ? "scale(1.25)" : "scale(1)", transition: "transform 0.2s" }} />
                  <span className="font-['Poppins:SemiBold'] text-[11px] text-black">
                    {audioPlaying ? "Reproduzindo…" : "Ouvir pronúncia"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 h-[42px] rounded-[12px]"
                style={{
                  background: saved ? "#1c1b19" : "#f5f2eb",
                  border: saved ? "none" : "1px solid #c8c4bc",
                  transform: btnPop ? "scale(1.08)" : "scale(1)",
                  transition: "background 0.2s, border-color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                <img src={imgBookmark} alt="" className="size-[15px]" style={{
                  filter: saved ? "none" : "invert(1)",
                  transform: btnPop ? "scale(1.35) rotate(-10deg)" : "scale(1) rotate(0deg)",
                  transition: "filter 0.2s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
                <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 13, color: saved ? "#fff" : "#1c1b19", whiteSpace: "nowrap", transition: "color 0.2s" }}>
                  {saved ? "Salvo ✓" : "Salvar"}
                </span>
              </button>
              <button className="flex items-center justify-center w-[42px] h-[42px] rounded-[12px] border border-[#c8c4bc] hover:border-black transition-all duration-200">
                <img src={imgShare} alt="" className="size-[16px]" />
              </button>
            </div>
            {toastKey > 0 && (
              <SwipeToast
                key={toastKey}
                open
                onClose={() => {}}
                title="Palavra salva!"
                description={`"${wordData.word}" adicionada às suas palavras`}
                background="#1c1b19"
                color="#f5f2eb"
                fuseColor="#3D6647"
                duration={3500}
                fuse="bottom"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7dc490" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
              />
            )}
          </div>

          <div className="px-8 py-3 border-b border-black/8 flex items-center gap-2 flex-wrap shrink-0">
            <span className="font-['Poppins:Regular'] text-[11px] text-[#7e7676] uppercase tracking-[0.6px] mr-1">Fonte</span>
            {wordData.dicts.map(d => {
              const c = DICT_COLOR[d.id] ?? "#000";
              const isActive = d.id === activeId;
              return (
                <button key={d.id} onClick={() => switchDict(d.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] transition-all duration-200 font-['Poppins:SemiBold'] text-[12px]"
                  style={{
                    background: isActive ? c : "#f5f2eb",
                    color: isActive ? "#fff" : "#4a4742",
                  }}>
                  <span className="size-1.5 rounded-full inline-block shrink-0"
                    style={{ background: isActive ? "rgba(255,255,255,0.6)" : c }} />
                  {d.shortName}
                </button>
              );
            })}
          </div>

          <div ref={contentRef} className="flex-1 overflow-y-auto px-8 py-8">
            <div style={{
              opacity: contentVis ? 1 : 0,
              transform: contentVis ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.18s ease, transform 0.18s ease",
            }}>
              <DictEntryView entry={activeEntry} onSearch={onSearch} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Desktop Favorites ─────────────────────────────────────────────────────
const FAV_FILTERS = ["Todas", "Adjetivos", "Substantivos", "Verbos", "Recentes"] as const;
type FavFilter = typeof FAV_FILTERS[number];

function FavoritesPage({ onSearch }: { onSearch: (w: string) => void }) {
  const vis = useFade("favorites");
  const [filter, setFilter] = useState<FavFilter>("Todas");
  const [query, setQuery] = useState("");

  const filtered = SAVED_WORDS.filter(w => {
    const matchQ = !query || w.word.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === "Todas" || filter === "Recentes"
      || (filter === "Adjetivos" && w.pos === "adj.")
      || (filter === "Substantivos" && w.pos === "subst.");
    return matchQ && matchF;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col" style={fadeStyle(vis)}>
      <main className="flex-1 max-w-[900px] mx-auto w-full px-8 py-10 flex flex-col gap-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-['Poppins:Bold'] text-[36px] text-black tracking-[-1.4px]">Palavras Favoritas</h1>
            <p className="font-['Poppins:Regular'] text-[15px] text-[#7e7676] mt-1">
              Acompanhe as palavras que você mais gosta e estude suas definições.
            </p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e7676]"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar palavra salva…"
              className="h-[40px] pl-9 pr-4 rounded-[10px] bg-[#f5f2eb] font-['Poppins:Regular'] text-[13px] outline-none w-[220px] placeholder-[#9e9b94]" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FAV_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-[20px] font-['Poppins:SemiBold'] text-[13px] transition-all duration-200"
              style={{
                background: filter === f ? "#000" : "#f5f2eb",
                color: filter === f ? "#fff" : "#4a4742",
              }}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col rounded-[16px] border border-black/8 overflow-hidden">
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-['Poppins:Regular'] text-[15px] text-[#7e7676]">Nenhuma palavra encontrada.</p>
            </div>
          )}
          {filtered.map((w, i) => (
            <div key={w.word}
              className="flex items-center justify-between px-6 py-5 hover:bg-[#fafaf9] transition-colors duration-150"
              style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.06)" : undefined }}>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-['Poppins:ExtraBold'] text-[20px] text-black">{w.word}</span>
                  <span className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82] uppercase tracking-[0.4px]">{w.pos}</span>
                </div>
                <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] line-clamp-1">{w.snippet}</p>
                <p className="font-['Poppins:Regular'] text-[11px] text-[#9e9b94]">Salvo {w.when}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <button onClick={() => onSearch(w.word)}
                  className="px-4 py-2 rounded-[10px] border border-black/15 font-['Poppins:SemiBold'] text-[12px] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200">
                  Ver Definição
                </button>
                <button className="size-8 flex items-center justify-center rounded-[8px] hover:bg-black/6 transition-colors">
                  <img src={imgBookmark} alt="" className="size-4 opacity-50 hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Desktop Not Found ─────────────────────────────────────────────────────
function NotFoundPage({ word, onBack }: { word: string; onBack: () => void }) {
  const vis = useFade("notfound-" + word);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={fadeStyle(vis)}>
      <p className="font-['Poppins:ExtraBold'] text-[48px] text-black">"{word}"</p>
      <p className="font-['Poppins:Regular'] text-[18px] text-[#7e7676]">Palavra não encontrada nos nossos dicionários.</p>
      <button onClick={onBack}
        className="bg-black text-white font-['Poppins:SemiBold'] text-[14px] px-6 py-3 rounded-[12px] hover:bg-[#333] transition-all active:scale-95">
        Voltar à busca
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE APP
// ═══════════════════════════════════════════════════════════════════════════

type MobileTab = "pesquisar" | "salvos" | "perfil";

function MobileBottomNav({
  active, onChange,
}: {
  active: MobileTab;
  onChange: (t: MobileTab) => void;
}) {
  const tabs: { id: MobileTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: "pesquisar", label: "Pesquisar",
      icon: (a) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={a ? "white" : "rgba(255,255,255,0.45)"} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round">
          <circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.8-4.8"/>
        </svg>
      ),
    },
    {
      id: "salvos", label: "Salvos",
      icon: (a) => (
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill={a ? "white" : "none"}
          stroke={a ? "white" : "rgba(255,255,255,0.45)"} strokeWidth={a ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      id: "perfil", label: "Perfil",
      icon: (a) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={a ? "white" : "rgba(255,255,255,0.45)"} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
    >
      <nav
        className="flex items-center gap-1 px-2 py-2 rounded-[100px]"
        style={{
          background: "#1c1b19",
          boxShadow: "0 8px 32px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        {tabs.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex items-center gap-2 rounded-[100px] transition-all duration-200"
              style={{
                padding: isActive ? "10px 18px" : "10px 14px",
                background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
              }}
              onPointerDown={e => { e.currentTarget.style.transform = "scale(0.93)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {tab.icon(isActive)}
              {isActive && (
                <span style={{
                  fontFamily: "'Poppins:SemiBold'",
                  fontSize: 13,
                  color: "white",
                  letterSpacing: "-0.2px",
                  lineHeight: 1,
                }}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Mobile Auth ───────────────────────────────────────────────────────────────
function MobileAuthPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [showPwd, setShowPwd] = useState(false);
  const vis = useFade("mobile-auth");

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col justify-center px-6 py-8"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 40px)" }}>
      {/* Logo + tagline */}
      <div className="flex flex-col items-center gap-3 mb-8" style={slideUpStyle(vis, 0)}>
        <img src={imgLogoDark2} alt="DICIOBASE" style={{ height: 46, width: "auto" }} />
        <p className="font-['Poppins:Regular'] text-[14px] text-[#8c8a82] text-center leading-[1.5] max-w-[240px]">
          O seu dicionário português, sempre ao seu alcance.
        </p>
      </div>

      {/* Mode switcher */}
      <div className="bg-[#efece6] rounded-[14px] p-[4px] flex mb-6" style={slideUpStyle(vis, 0.06)}>
        {(["entrar", "criar"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 h-[44px] rounded-[10px] font-['Poppins:SemiBold'] text-[15px] transition-all duration-250"
            style={{
              background: mode === m ? "#fff" : "transparent",
              color: mode === m ? "#1c1b19" : "#8c8a82",
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            }}>
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5" style={slideUpStyle(vis, 0.1)}>
        <div className="flex flex-col gap-1.5">
          <label className="font-['Poppins:Medium'] text-[13px] text-[#1c1b19]">E-mail</label>
          <input type="email" placeholder="nome@exemplo.com"
            className="w-full h-[52px] px-4 rounded-[12px] border border-[#e0ddd6] bg-white font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#c0bcb4] outline-none focus:border-black transition-colors" />
        </div>
        {mode === "criar" && (
          <div className="flex flex-col gap-1.5">
            <label className="font-['Poppins:Medium'] text-[13px] text-[#1c1b19]">Nome</label>
            <input type="text" placeholder="Seu nome"
              className="w-full h-[52px] px-4 rounded-[12px] border border-[#e0ddd6] bg-white font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#c0bcb4] outline-none focus:border-black transition-colors" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-['Poppins:Medium'] text-[13px] text-[#1c1b19]">Senha</label>
            {mode === "entrar" && (
              <button className="font-['Poppins:SemiBold'] text-[13px] text-[#1c1b19]">Esqueceu?</button>
            )}
          </div>
          <div className="relative">
            <input type={showPwd ? "text" : "password"} placeholder="••••••••••••"
              className="w-full h-[52px] px-4 pr-12 rounded-[12px] border border-[#e0ddd6] bg-white font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#c0bcb4] outline-none focus:border-black transition-colors" />
            <button onClick={() => setShowPwd(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a82] hover:text-black transition-colors">
              {showPwd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-5 mt-8" style={slideUpStyle(vis, 0.14)}>
        <button onClick={onLogin}
          className="w-full h-[54px] bg-black rounded-[14px] font-['Poppins:SemiBold'] text-[16px] text-white active:scale-[0.97] transition-transform duration-150">
          {mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e0ddd6]" />
          <span className="font-['Poppins:Regular'] text-[12px] text-[#8c8a82]">ou continue com</span>
          <div className="flex-1 h-px bg-[#e0ddd6]" />
        </div>

        <div className="flex gap-3">
          <button className="flex-1 h-[50px] bg-white border border-[#e0ddd6] rounded-[12px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <span className="font-['Poppins:SemiBold'] text-[14px] text-[#1c1b19]">Google</span>
          </button>
          <button className="flex-1 h-[50px] bg-white border border-[#e0ddd6] rounded-[12px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.15 3.79.03 3.02 2.65 4.03 2.68 4.04l-.08.24zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <span className="font-['Poppins:SemiBold'] text-[14px] text-[#1c1b19]">Apple</span>
          </button>
        </div>

        <p className="text-center font-['Poppins:Regular'] text-[13px] text-[#8c8a82]">
          {mode === "entrar" ? "Não tem conta? " : "Já tem conta? "}
          <button onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
            className="font-['Poppins:SemiBold'] text-[#1c1b19]">
            {mode === "entrar" ? "Crie agora" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}

// Mobile Tutorial ───────────────────────────────────────────────────────────
function MobileTutorialPage({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [slideVis, setSlideVis] = useState(true);
  const slide = TUTORIAL_SLIDES[step];
  const total = TUTORIAL_SLIDES.length;

  function goTo(i: number) {
    setSlideVis(false);
    setTimeout(() => { setStep(i); setSlideVis(true); }, 150);
  }

  const Mockup = slide.mockup === "search"
    ? TutorialMockupSearch
    : slide.mockup === "definition"
    ? TutorialMockupDefinition
    : TutorialMockupSaved;

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div className="flex gap-2">
          {TUTORIAL_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="h-[3px] rounded-full transition-all duration-300"
              style={{ width: i === step ? 24 : 8, background: i === step ? "#1c1b19" : "#c8c4bc" }} />
          ))}
        </div>
        <button onClick={onFinish}
          className="font-['Poppins:Medium'] text-[13px] text-[#8c8a82]">
          Pular
        </button>
      </div>

      {/* Mockup area */}
      <div className="px-5 pt-3 pb-5 shrink-0"
        style={{
          opacity: slideVis ? 1 : 0,
          transform: slideVis ? "translateY(0) scale(1)" : "translateY(8px) scale(0.97)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}>
        {/* Phone-like frame */}
        <div className="rounded-[20px] overflow-hidden border border-[#e0ddd6]"
          style={{ height: 300, boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}>
          <Mockup />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 px-5 flex flex-col justify-between pb-6"
        style={{
          opacity: slideVis ? 1 : 0,
          transform: slideVis ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.24s ease 0.06s, transform 0.24s ease 0.06s",
        }}>
        <div className="flex flex-col gap-2">
          <span className="font-['Poppins:Regular'] text-[10px] uppercase tracking-[1px] text-[#8c8a82]">
            {slide.label} / {String(total).padStart(2, "0")}
          </span>
          <h2 className="font-['Poppins:ExtraBold'] text-[26px] text-[#1c1b19] leading-tight tracking-[-0.52px]">
            {slide.title}
          </h2>
          <p className="font-['Poppins:Regular'] text-[14px] text-[#7e7676] leading-[1.65]">
            {slide.body}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => goTo(step - 1)}
              className="h-[52px] px-5 rounded-[14px] border border-[#c8c4bc] font-['Poppins:SemiBold'] text-[14px] text-[#1c1b19] active:scale-95 transition-transform">
              Anterior
            </button>
          )}
          {step < total - 1 ? (
            <button onClick={() => goTo(step + 1)}
              className="flex-1 h-[52px] rounded-[14px] bg-[#1c1b19] font-['Poppins:SemiBold'] text-[15px] text-white active:scale-[0.97] transition-transform">
              Avançar
            </button>
          ) : (
            <button onClick={onFinish}
              className="flex-1 h-[52px] rounded-[14px] bg-[#1c1b19] font-['Poppins:SemiBold'] text-[15px] text-white active:scale-[0.97] transition-transform">
              Começar agora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile Preferences ────────────────────────────────────────────────────────
function MobilePreferencesPage({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const vis = useFade("mobile-prefs");

  function toggle(opt: string) {
    setSelected(s => {
      const next = new Set(s);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col px-5"
      style={{ paddingTop: "env(safe-area-inset-top, 24px)", paddingBottom: "env(safe-area-inset-bottom, 24px)" }}>
      <div className="flex justify-end pt-4 pb-2" style={slideUpStyle(vis, 0)}>
        <button onClick={onContinue}
          className="font-['Poppins:Medium'] text-[13px] text-[#8c8a82]">Pular</button>
      </div>

      <div className="flex flex-col gap-2 pt-4 pb-7" style={slideUpStyle(vis, 0.06)}>
        <h1 className="font-['Poppins:ExtraBold'] text-[28px] text-[#1c1b19] tracking-[-0.56px] leading-tight">
          O que te interessa?
        </h1>
        <p className="font-['Poppins:Regular'] text-[14px] text-[#8c8a82] leading-[1.6]">
          Personalize sua experiência. Escolha quantos quiser.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 flex-1" style={slideUpStyle(vis, 0.1)}>
        {PREF_OPTIONS.map(opt => {
          const on = selected.has(opt);
          return (
            <button key={opt} onClick={() => toggle(opt)}
              className="px-4 py-2.5 rounded-[22px] font-['Poppins:Medium'] text-[13px] transition-all duration-200 active:scale-[0.96]"
              style={{
                background: on ? "#1c1b19" : "#fff",
                color: on ? "#fff" : "#1c1b19",
                border: on ? "1.5px solid #1c1b19" : "1.5px solid #d0ccc4",
              }}>
              {opt}
            </button>
          );
        })}
      </div>

      <button onClick={onContinue}
        className="mt-8 w-full h-[54px] bg-[#1c1b19] rounded-[14px] font-['Poppins:SemiBold'] text-[15px] text-white active:scale-[0.97] transition-transform"
        style={slideUpStyle(vis, 0.16)}>
        Continuar
      </button>
    </div>
  );
}

// Mobile Home ───────────────────────────────────────────────────────────────
function MobileHomePage({ onSearch }: { onSearch: (w: string) => void }) {
  const vis = useFade("mobile-home");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (q) onSearch(q);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col px-6 justify-center"
      style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}>
      {/* Logo */}
      <div className="flex items-center justify-center mb-3" style={slideUpStyle(vis, 0)}>
        <img src={imgLogoDark2} alt="DICIOBASE" style={{ height: 44, width: "auto" }} />
      </div>

      {/* Tagline */}
      <p className="font-['Poppins:Regular'] text-[16px] text-[#1c1b19] text-center leading-[1.3] tracking-[-0.32px] mb-8 mt-2"
        style={slideUpStyle(vis, 0.06)}>
        Todos os dicionários em um só lugar.
      </p>

      {/* Search bar */}
      <form onSubmit={submit} style={slideUpStyle(vis, 0.1)}>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <img src={imgSearchIcon} alt="" style={{ width: 18, height: 18, opacity: 0.5 }} />
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Pesquise alguma palavra..."
            className="w-full h-[50px] pl-[44px] pr-5 rounded-[25px] bg-white font-['Poppins:Regular'] text-[14px] text-[#1c1b19] placeholder-[#8c8a82] outline-none transition-all duration-200"
            style={{ border: `1.5px solid ${focused ? "#1c1b19" : "#c8c4bc"}` }} />
          {query && (
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white font-['Poppins:SemiBold'] text-[12px] px-4 py-2 rounded-[20px] active:scale-95 transition-transform">
              Buscar
            </button>
          )}
        </div>
      </form>

      {/* Recents */}
      <div className="flex flex-col gap-3 mt-8" style={slideUpStyle(vis, 0.14)}>
        <p className="font-['Poppins:SemiBold'] text-[11px] text-[#8c8a82] uppercase tracking-[1px]">
          Pesquisas Recentes
        </p>
        <div className="flex flex-wrap gap-2">
          {RECENT_SEARCHES.map(w => (
            <button key={w} onClick={() => onSearch(w.toLowerCase())}
              className="px-4 py-2 rounded-[20px] bg-white border border-[#efece6] font-['Poppins:Regular'] text-[13px] text-[#1c1b19] active:scale-95 transition-transform">
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Explore suggestions */}
      <div className="flex flex-col gap-3 mt-8" style={slideUpStyle(vis, 0.18)}>
        <p className="font-['Poppins:SemiBold'] text-[11px] text-[#8c8a82] uppercase tracking-[1px]">
          Experimente
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => onSearch(s)}
              className="px-4 py-2 rounded-[20px] bg-[#1c1b19] font-['Poppins:Regular'] text-[13px] text-white active:scale-95 transition-transform capitalize">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile Definition ─────────────────────────────────────────────────────────
function MobileDefinitionPage({
  wordData, onSearch, onBack, isLoggedIn, onOpenAuth,
}: {
  wordData: WordData; onSearch: (w: string) => void; onBack: () => void;
  isLoggedIn?: boolean; onOpenAuth?: (then?: () => void) => void;
}) {
  const [activeId, setActiveId] = useState(wordData.dicts[0].id);
  const [contentVis, setContentVis] = useState(true);
  const [saved, setSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [btnPop, setBtnPop] = useState(false);

  function handleSaveMobile() {
    if (!isLoggedIn) {
      onOpenAuth?.(() => {
        setSaved(true);
        setToastKey(k => k + 1);
        setBtnPop(true); setTimeout(() => setBtnPop(false), 400);
      });
      return;
    }
    const next = !saved;
    setSaved(next);
    if (next) { setToastKey(k => k + 1); setBtnPop(true); setTimeout(() => setBtnPop(false), 400); }
  }
  const pageVis = useFade(wordData.word);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActiveId(wordData.dicts[0].id); }, [wordData.word]);

  function switchDict(id: string) {
    if (id === activeId) return;
    setContentVis(false);
    setTimeout(() => {
      setActiveId(id);
      setContentVis(true);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 160);
  }

  function playAudio() {
    setAudioPlaying(true);
    setTimeout(() => setAudioPlaying(false), 1600);
  }

  const activeEntry = wordData.dicts.find(d => d.id === activeId) ?? wordData.dicts[0];
  const color = DICT_COLOR[activeId] ?? "#000";

  return (
    <div className="h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col overflow-hidden"
      style={{ ...slideUpStyle(pageVis), paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#fbf9f6] shrink-0">
        <button onClick={onBack}
          className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white border border-[#e0ddd6] active:scale-95 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white border border-[#e0ddd6] active:scale-95 transition-transform">
            <img src={imgShare} alt="" style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={handleSaveMobile}
            className="flex items-center gap-1.5 px-3.5 h-[38px] rounded-full"
            style={{
              background: saved ? "#1c1b19" : "#fff",
              border: saved ? "none" : "1px solid #e0ddd6",
              transform: btnPop ? "scale(1.1)" : "scale(1)",
              transition: "background 0.2s, border-color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
            <img src={imgBookmark} alt="" style={{
              width: 14, height: 14,
              filter: saved ? "none" : "invert(1)",
              transform: btnPop ? "scale(1.4) rotate(-10deg)" : "scale(1) rotate(0deg)",
              transition: "filter 0.2s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
            <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 12, color: saved ? "#fff" : "#1c1b19", transition: "color 0.2s" }}>
              {saved ? "Salvo ✓" : "Salvar"}
            </span>
          </button>
        </div>
        {toastKey > 0 && (
          <SwipeToast
            key={toastKey}
            open
            onClose={() => {}}
            title="Palavra salva!"
            description={`"${wordData.word}" adicionada às suas palavras`}
            background="#1c1b19"
            color="#f5f2eb"
            fuseColor="#3D6647"
            duration={3500}
            fuse="bottom"
            width={320}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7dc490" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
          />
        )}
      </div>

      {/* Word header */}
      <div className="px-5 pb-4 bg-[#fbf9f6] shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-['Poppins:ExtraBold'] text-[32px] text-[#1c1b19] leading-tight tracking-[-0.64px]">
              {wordData.word}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['Poppins:Regular'] text-[14px] text-[#8c8a82]">
                /{wordData.phonetic}/
              </span>
              <span className="px-2.5 py-0.5 rounded-[6px] bg-[#efece6] font-['Poppins:Medium'] text-[12px] text-[#4a4742]">
                {wordData.partOfSpeech}
              </span>
            </div>
          </div>
          <button onClick={playAudio}
            className="shrink-0 w-[48px] h-[48px] rounded-full bg-black flex items-center justify-center active:scale-95 transition-all duration-150"
            style={{ boxShadow: audioPlaying ? "0 0 0 6px rgba(0,0,0,0.12)" : "none" }}>
            <img src={imgAudio} alt="" style={{ width: 18, height: 18, filter: "invert(1)" }} />
          </button>
        </div>
      </div>

      {/* Dict switcher pills */}
      <div className="px-5 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {wordData.dicts.map(d => {
            const c = DICT_COLOR[d.id] ?? "#000";
            const isActive = d.id === activeId;
            return (
              <button key={d.id} onClick={() => switchDict(d.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[20px] font-['Poppins:SemiBold'] text-[12px] shrink-0 transition-all duration-200 active:scale-95"
                style={{
                  background: isActive ? c : "#fff",
                  color: isActive ? "#fff" : "#4a4742",
                  border: isActive ? "none" : "1px solid #e0ddd6",
                }}>
                <span className="size-1.5 rounded-full inline-block"
                  style={{ background: isActive ? "rgba(255,255,255,0.6)" : c }} />
                {d.shortName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#e0ddd6] mx-5 shrink-0" />

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        <div style={{
          opacity: contentVis ? 1 : 0,
          transform: contentVis ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}>
          {/* Mobile macrostructure: simplified single-column layout */}
          <div className="flex flex-col gap-6">
            {/* Source */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[24px] text-white font-['Poppins:SemiBold'] text-[11px]"
                style={{ background: color }}>
                <span className="size-1.5 rounded-full bg-white/60 inline-block" />
                {activeEntry.name}
              </span>
              <span className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82]">{activeEntry.tag}</span>
            </div>

            {/* Etymology */}
            {activeEntry.etymology && (
              <div className="flex flex-col gap-2">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Etimologia</span>
                <p className="font-['Poppins:Italic'] italic text-[13px] text-[#4a4742] leading-[1.6] border-l-2 border-[#d5d0c6] pl-4">
                  {activeEntry.etymology}
                </p>
              </div>
            )}

            {/* Definitions */}
            <div className="flex flex-col gap-2">
              <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Definição</span>
              <div className="flex flex-col gap-4">
                {activeEntry.senses.map(sense => (
                  <div key={sense.num} className="flex gap-3">
                    <span className="font-['Poppins:Bold'] text-[12px] text-[#8c8a82] shrink-0 w-5 pt-[2px]">{sense.num}.</span>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 items-start">
                        {sense.labels?.map(l => (
                          <span key={l} className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.5px] border border-[#c8c4bc] text-[#7e7676] rounded-[4px] px-1.5 py-0.5">
                            {l}
                          </span>
                        ))}
                        <p className="font-['Poppins:Regular'] text-[15px] text-[#1c1b19] leading-[1.65]">{sense.text}</p>
                      </div>
                      {sense.examples && sense.examples.length > 0 && (
                        <div className="border-l-2 border-[#d5d0c6] pl-3">
                          <p className="font-['Poppins:SemiBold'] text-[9px] uppercase tracking-[0.8px] text-[#8c8a82] mb-1">
                            Exemplo de uso
                          </p>
                          {sense.examples.map((ex, i) => (
                            <p key={i} className="font-['Poppins:Italic'] italic text-[13px] text-[#7e7676] leading-[1.6]">{ex}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {activeEntry.notes && activeEntry.notes.length > 0 && (
              <div className="bg-white rounded-[12px] px-4 py-3 flex flex-col gap-1 border border-[#efece6]">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Notas</span>
                {activeEntry.notes.map((n, i) => (
                  <p key={i} className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]">{n}</p>
                ))}
              </div>
            )}

            {/* Synonyms */}
            {(activeEntry.synonyms?.length || wordData.synonyms.length) > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-[#e0ddd6]">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Sinônimos</span>
                <div className="flex flex-wrap gap-2">
                  {(activeEntry.synonyms?.length ? activeEntry.synonyms : wordData.synonyms).map(w => (
                    <button key={w} onClick={() => onSearch(w)}
                      className="px-3.5 py-1.5 rounded-[20px] bg-white border border-[#e0ddd6] font-['Poppins:Regular'] text-[13px] text-[#1c1b19] active:scale-95 transition-transform">
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {activeEntry.related && activeEntry.related.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Relacionadas</span>
                <div className="flex flex-wrap gap-2">
                  {activeEntry.related.map(w => (
                    <button key={w} onClick={() => onSearch(w)}
                      className="px-3.5 py-1.5 rounded-[20px] bg-[#efece6] font-['Poppins:Regular'] text-[13px] text-[#1c1b19] active:scale-95 transition-transform">
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Facts */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#e0ddd6] pb-6">
              <span className="font-['Poppins:SemiBold'] text-[10px] uppercase tracking-[0.9px] text-[#8c8a82]">Sobre a palavra</span>
              <div className="grid grid-cols-2 gap-3">
                {wordData.facts.map(f => (
                  <div key={f.label} className="bg-white rounded-[12px] p-3.5 border border-[#efece6]">
                    <span className="font-['Poppins:Regular'] text-[9px] uppercase tracking-[0.6px] text-[#8c8a82] block mb-1">{f.label}</span>
                    <span className="font-['Poppins:SemiBold'] text-[13px] text-[#1c1b19]">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Saved ──────────────────────────────────────────────────────────────
const MOB_FAV_FILTERS = ["Todas", "Substantivos", "Adjetivos"] as const;
type MobFavFilter = typeof MOB_FAV_FILTERS[number];

function MobileSavedPage({ onSearch }: { onSearch: (w: string) => void }) {
  const vis = useFade("mobile-saved");
  const [filter, setFilter] = useState<MobFavFilter>("Todas");
  const [query, setQuery] = useState("");

  const filtered = SAVED_WORDS.filter(w => {
    const matchQ = !query || w.word.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === "Todas"
      || (filter === "Adjetivos" && w.pos === "adj.")
      || (filter === "Substantivos" && w.pos === "subst.");
    return matchQ && matchF;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 20px)" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={slideUpStyle(vis, 0)}>
        <h1 className="font-['Poppins:Bold'] text-[26px] text-[#1c1b19] tracking-[-0.52px]">Palavras salvas</h1>
        <p className="font-['Poppins:Regular'] text-[13px] text-[#8c8a82] mt-1">
          {SAVED_WORDS.length} palavras arquivadas para consulta rápida.
        </p>
      </div>

      {/* Search */}
      <div className="px-5 pb-4" style={slideUpStyle(vis, 0.06)}>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8a82]"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar palavras salvas..."
            className="w-full h-[46px] pl-10 pr-4 rounded-[12px] bg-white border border-[#e0ddd6] font-['Poppins:Regular'] text-[14px] text-[#1c1b19] placeholder-[#8c8a82] outline-none focus:border-black transition-colors" />
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 pb-4 flex gap-2" style={slideUpStyle(vis, 0.1)}>
        {MOB_FAV_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-[20px] font-['Poppins:SemiBold'] text-[13px] transition-all duration-200 active:scale-95"
            style={{
              background: filter === f ? "#1c1b19" : "#fff",
              color: filter === f ? "#fff" : "#4a4742",
              border: filter === f ? "none" : "1px solid #e0ddd6",
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6" style={slideUpStyle(vis, 0.12)}>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-['Poppins:Regular'] text-[15px] text-[#8c8a82]">Nenhuma palavra encontrada.</p>
          </div>
        )}
        <div className="flex flex-col">
          {filtered.map((w, i) => (
            <button key={w.word} onClick={() => onSearch(w.word)}
              className="flex items-center justify-between py-5 active:bg-[#efece6] transition-colors rounded-[4px] -mx-1 px-1"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid #efece6" : "none" }}>
              <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-['Poppins:Bold'] text-[18px] text-[#1c1b19]">{w.word}</span>
                  <span className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82]">{w.pos}</span>
                </div>
                <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] line-clamp-1 pr-4">{w.snippet}</p>
              </div>
              <div className="shrink-0 ml-3">
                <img src={imgBookmark} alt="" style={{ width: 18, height: 18, opacity: 0.4 }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile Dictionaries ───────────────────────────────────────────────────────
function MobileDictionariesPage() {
  const vis = useFade("mobile-dicts");
  const dicts = [
    { id: "aurelio",  name: "Dicionário Aurélio",  tag: "Versão 2026",       desc: "O mais consultado dicionário da língua portuguesa, com mais de 200 mil verbetes." },
    { id: "houaiss",  name: "Dicionário Houaiss",  tag: "Edição Integral",   desc: "Referência acadêmica com etimologias detalhadas e dados linguísticos completos." },
    { id: "michaelis",name: "Michaelis",            tag: "Dicionário Escolar",desc: "Ideal para estudantes, com linguagem acessível e exemplos do cotidiano." },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col px-5"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="pt-8 pb-6" style={slideUpStyle(vis, 0)}>
        <h1 className="font-['Poppins:Bold'] text-[26px] text-[#1c1b19] tracking-[-0.52px]">Dicionários</h1>
        <p className="font-['Poppins:Regular'] text-[13px] text-[#8c8a82] mt-1">3 fontes indexadas</p>
      </div>

      <div className="flex flex-col gap-3" style={slideUpStyle(vis, 0.06)}>
        {dicts.map((d, i) => {
          const c = DICT_COLOR[d.id] ?? "#000";
          return (
            <div key={d.id} className="bg-white rounded-[18px] p-5 border border-[#efece6]"
              style={{ ...slideUpStyle(vis, 0.06 + i * 0.06) }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: c }} />
                <div>
                  <p className="font-['Poppins:SemiBold'] text-[15px] text-[#1c1b19]">{d.name}</p>
                  <p className="font-['Poppins:Regular'] text-[11px] text-[#8c8a82]">{d.tag}</p>
                </div>
              </div>
              <p className="font-['Poppins:Regular'] text-[13px] text-[#4a4742] leading-[1.6]">{d.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mobile Profile ────────────────────────────────────────────────────────────
// ─── Shared profile sub-screens ───────────────────────────────────────────
type ProfilePanel = "main" | "edit-avatar" | "edit-name" | "change-password" | "notifications" | "terms" | "dicts";

// Dark profile palette tokens
const P = {
  bg:        "#ffffff",
  card:      "#f5f2eb",
  cardAlt:   "#efece6",
  border:    "rgba(0,0,0,0.07)",
  borderMid: "rgba(0,0,0,0.12)",
  text:      "#1c1b19",
  sub:       "rgba(0,0,0,0.42)",
  icon:      "rgba(0,0,0,0.50)",
  accent:    "#1c1b19",
  danger:    "#d04030",
  dangerBg:  "rgba(208,64,48,0.08)",
  avatarBg:  "#e4e0d8",
  inputBg:   "#f5f2eb",
  successBg: "rgba(61,102,71,0.10)",
  successBd: "rgba(61,102,71,0.30)",
  successTx: "#3D6647",
};

function AvatarBubble({ size = 80, initials = "M", src }: { size?: number; initials?: string; src?: string }) {
  return src ? (
    <img src={src} alt="avatar" className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: P.avatarBg }}>
      <span style={{ fontFamily: "'Poppins:Bold'", fontSize: size * 0.34, color: P.text }}>
        {initials}
      </span>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="shrink-0 rounded-full flex items-center px-[3px] transition-all duration-200"
      style={{ width: 44, height: 26, background: on ? "#f5f2eb" : "rgba(255,255,255,0.12)" }}>
      <div className="rounded-full transition-all duration-200"
        style={{ width: 20, height: 20, background: on ? "#1c1b19" : "rgba(255,255,255,0.35)", transform: on ? "translateX(18px)" : "translateX(0)" }} />
    </button>
  );
}

function Chevron({ color = "rgba(255,255,255,0.25)" }: { color?: string } = {}) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function ProfileBackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
      style={{ fontFamily: "'Poppins:Medium'", fontSize: 13, color: P.sub }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
      Voltar
    </button>
  );
}

function ProfileSubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <ProfileBackBtn onClick={onBack} />
      <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 18, color: P.text }}>{title}</span>
    </div>
  );
}

function ProfileInput({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 10, color: P.sub, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-[50px] px-4 rounded-[14px] outline-none transition-all duration-200"
        style={{ fontFamily: "'Poppins:Regular'", fontSize: 15, color: P.text, background: P.inputBg, border: `1px solid ${P.borderMid}` }}
        onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
        onBlur={e => (e.currentTarget.style.borderColor = P.borderMid)}
      />
    </div>
  );
}

function ProfileCTA({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className="w-full h-[50px] rounded-[16px] transition-all duration-200 active:scale-[0.98]"
      style={{
        fontFamily: "'Poppins:SemiBold'", fontSize: 15,
        background: danger ? P.dangerBg : P.text,
        color: danger ? P.danger : "#1c1b19",
        border: danger ? `1px solid ${P.danger}30` : "none",
      }}>
      {label}
    </button>
  );
}

const MC = {
  bg:      "#1a1917",
  row:     "rgba(255,255,255,0.04)",
  border:  "rgba(255,255,255,0.08)",
  text:    "#f5f2eb",
  sub:     "rgba(255,255,255,0.42)",
  iconBg:  "rgba(255,255,255,0.10)",
  danger:  "#e05c4b",
  dangerBg:"rgba(224,92,75,0.14)",
};

function ProfileMenuCard({ rows }: { rows: { label: string; sub?: string; icon: React.ReactNode; badge?: number; action: () => void; danger?: boolean }[] }) {
  return (
    <div className="rounded-[22px] overflow-hidden" style={{ background: MC.bg }}>
      {rows.map((row, i) => (
        <button key={row.label} onClick={row.action}
          className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
          style={{ borderTop: i > 0 ? `1px solid ${MC.border}` : undefined }}
          onPointerEnter={e => (e.currentTarget.style.background = MC.row)}
          onPointerLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div className="shrink-0 w-9 h-9 rounded-[11px] flex items-center justify-center"
            style={{ background: row.danger ? MC.dangerBg : MC.iconBg, color: row.danger ? MC.danger : MC.text }}>
            {row.icon}
          </div>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: row.danger ? MC.danger : MC.text }}>{row.label}</span>
            {row.sub && <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 11, color: MC.sub }}>{row.sub}</span>}
          </div>
          {row.badge ? (
            <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#24456B" }}>
              <span style={{ fontFamily: "'Poppins:Bold'", fontSize: 10, color: "white" }}>{row.badge}</span>
            </div>
          ) : !row.danger ? <Chevron color={MC.sub} /> : null}
        </button>
      ))}
    </div>
  );
}

function useMobileProfileState() {
  const [panel, setPanel] = useState<ProfilePanel>("main");
  const [name, setName] = useState("Maria Silva");
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>();
  const [notifs, setNotifs] = useState(true);
  const [dictToggles, setDictToggles] = useState({ aurelio: true, houaiss: true, michaelis: false });
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [nameEdit, setNameEdit] = useState(name);
  return { panel, setPanel, name, setName, avatarSrc, setAvatarSrc, notifs, setNotifs, dictToggles, setDictToggles, pwCurrent, setPwCurrent, pwNew, setPwNew, pwConfirm, setPwConfirm, pwSaved, setPwSaved, nameEdit, setNameEdit };
}

const PROFILE_MENU_ROWS = (setPanel: (p: ProfilePanel) => void, onLogout: () => void) => [
  { label: "Meu Perfil", sub: "Nome e foto de perfil", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, action: () => setPanel("edit-name") },
  { label: "Notificações", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, badge: 1, action: () => setPanel("notifications") },
  { label: "Dicionários ativos", sub: "Gerenciar fontes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>, action: () => setPanel("dicts") },
  { label: "Alterar senha", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, action: () => setPanel("change-password") },
  { label: "Termos de Uso", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, action: () => setPanel("terms") },
  { label: "Sair da conta", danger: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>, action: onLogout },
];

const TERMS_SECTIONS = [
  { title: "1. Aceitação dos Termos", body: "Ao acessar e usar o DICIOBASE, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, por favor não utilize nosso serviço." },
  { title: "2. Uso do Serviço", body: "O DICIOBASE é um serviço de consulta lexicográfica que agrega conteúdo dos dicionários Aurélio, Houaiss e Michaelis. O conteúdo é disponibilizado para fins educacionais e de pesquisa pessoal." },
  { title: "3. Conta do Usuário", body: "Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado." },
  { title: "4. Propriedade Intelectual", body: "Todo o conteúdo lexicográfico pertence aos respectivos editores dos dicionários. O código, design e interface do DICIOBASE são propriedade da equipe DICIOBASE." },
  { title: "5. Privacidade", body: "Coletamos apenas os dados necessários para o funcionamento do serviço. Não vendemos ou compartilhamos seus dados pessoais com terceiros sem seu consentimento explícito." },
  { title: "6. Limitação de Responsabilidade", body: "O DICIOBASE não garante a completude ou exatidão das definições exibidas. Para uso acadêmico ou profissional, recomendamos consultar as fontes originais." },
];

const DICT_LIST = [
  { id: "aurelio" as const, name: "Aurélio", tag: "Versão 2026", c: "#3D6647" },
  { id: "houaiss" as const, name: "Houaiss", tag: "Edição Integral", c: "#24456B" },
  { id: "michaelis" as const, name: "Michaelis", tag: "Dicionário Escolar", c: "#7A6520" },
];

function MobileProfilePage({ onLogout }: { onLogout: () => void }) {
  const s = useMobileProfileState();
  const vis = useFade(s.panel);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    s.setAvatarSrc(URL.createObjectURL(f));
    s.setPanel("main");
  }

  const topPad = { paddingTop: "max(env(safe-area-inset-top,0px),20px)" };

  const SubPage = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, ...topPad }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
        <button onClick={() => s.setPanel("main")} className="p-1 -ml-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.sub} strokeWidth="2.2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 16, color: P.text }}>{title}</span>
      </div>
      <div className="flex-1 px-5 pt-6 pb-28 overflow-y-auto">{children}</div>
    </div>
  );

  if (s.panel === "edit-avatar") return (
    <SubPage title="Foto de Perfil">
      <div className="flex flex-col items-center gap-6 pt-4">
        <AvatarBubble size={110} initials={s.name[0]} src={s.avatarSrc} />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        <div className="w-full flex flex-col gap-3">
          {[
            { label: "Escolher da galeria", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.icon} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, action: () => fileRef.current?.click() },
            { label: "Tirar foto", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.icon} strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>, action: () => fileRef.current?.click() },
            { label: "Remover foto atual", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.danger} strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>, action: () => { s.setAvatarSrc(undefined); s.setPanel("main"); }, danger: true },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="flex items-center gap-4 px-5 py-4 rounded-[16px] active:scale-[0.98] transition-transform"
              style={{ background: (item as {danger?:boolean}).danger ? P.dangerBg : P.card, border: `1px solid ${P.border}`, color: (item as {danger?:boolean}).danger ? P.danger : P.text }}>
              {item.icon}
              <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 15 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </SubPage>
  );

  if (s.panel === "edit-name") return (
    <SubPage title="Editar Nome">
      <div className="flex flex-col gap-5">
        <ProfileInput label="Nome" value={s.nameEdit} onChange={v => s.setNameEdit(v)} />
        <ProfileCTA label="Salvar" onClick={() => { s.setName(s.nameEdit); s.setPanel("main"); }} />
      </div>
    </SubPage>
  );

  if (s.panel === "change-password") return (
    <SubPage title="Alterar Senha">
      <div className="flex flex-col gap-5">
        {s.pwSaved && (
          <div className="px-4 py-3 rounded-[12px]" style={{ background: P.successBg, border: `1px solid ${P.successBd}` }}>
            <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 13, color: P.successTx }}>Senha alterada com sucesso!</span>
          </div>
        )}
        <ProfileInput label="Senha atual" type="password" value={s.pwCurrent} onChange={s.setPwCurrent} />
        <ProfileInput label="Nova senha" type="password" value={s.pwNew} onChange={s.setPwNew} />
        <ProfileInput label="Confirmar nova senha" type="password" value={s.pwConfirm} onChange={s.setPwConfirm} />
        <ProfileCTA label="Salvar senha" onClick={() => { s.setPwSaved(true); s.setPwCurrent(""); s.setPwNew(""); s.setPwConfirm(""); setTimeout(() => s.setPwSaved(false), 3000); }} />
      </div>
    </SubPage>
  );

  if (s.panel === "notifications") return (
    <SubPage title="Notificações">
      <div className="rounded-[18px] overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}` }}>
        {[
          { label: "Novas palavras", sub: "Palavra do dia e vocabulário novo", on: s.notifs, toggle: () => s.setNotifs(n => !n) },
          { label: "Dicas de uso", sub: "Como usar o DICIOBASE melhor", on: true, toggle: () => {} },
          { label: "Novidades da plataforma", sub: "Atualizações e melhorias", on: false, toggle: () => {} },
        ].map((row, i) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: i > 0 ? `1px solid ${P.border}` : undefined }}>
            <div className="flex flex-col gap-0.5 flex-1 pr-4">
              <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: P.text }}>{row.label}</span>
              <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 12, color: P.sub }}>{row.sub}</span>
            </div>
            <Toggle on={row.on} onToggle={row.toggle} />
          </div>
        ))}
      </div>
    </SubPage>
  );

  if (s.panel === "dicts") return (
    <SubPage title="Dicionários Ativos">
      <div className="rounded-[18px] overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}` }}>
        {DICT_LIST.map((d, i) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: i > 0 ? `1px solid ${P.border}` : undefined }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.c }} />
              <div>
                <div style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: P.text }}>{d.name}</div>
                <div style={{ fontFamily: "'Poppins:Regular'", fontSize: 11, color: P.sub }}>{d.tag}</div>
              </div>
            </div>
            <Toggle on={s.dictToggles[d.id]} onToggle={() => s.setDictToggles(t => ({ ...t, [d.id]: !t[d.id] }))} />
          </div>
        ))}
      </div>
    </SubPage>
  );

  if (s.panel === "terms") return (
    <SubPage title="Termos de Uso">
      <div className="flex flex-col gap-5">
        {TERMS_SECTIONS.map(sec => (
          <div key={sec.title}>
            <p style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 13, color: P.text, marginBottom: 4 }}>{sec.title}</p>
            <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 12, color: P.sub, lineHeight: 1.65 }}>{sec.body}</p>
          </div>
        ))}
        <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>Última atualização: Setembro de 2026</p>
      </div>
    </SubPage>
  );

  // ── Main ─────────────────────────────────────────────────────────────────
  const menuRows = PROFILE_MENU_ROWS(s.setPanel, onLogout);
  return (
    <div className="min-h-screen flex flex-col overflow-y-auto pb-28" style={{ background: P.bg }}>
      {/* Hero section */}
      <div className="relative flex flex-col items-center pb-6"
        style={{ paddingTop: "max(env(safe-area-inset-top,0px),48px)" }}>

        {/* Edit avatar button */}
        <div className="relative mb-5">
          {s.avatarSrc ? (
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden"
              style={{ border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img src={s.avatarSrc} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
              style={{ background: P.avatarBg, border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <span style={{ fontFamily: "'Poppins:ExtraBold'", fontSize: 42, color: P.text }}>{s.name[0]}</span>
            </div>
          )}
          <button onClick={() => s.setPanel("edit-avatar")}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "#ffffff", border: `1.5px solid ${P.borderMid}`, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.text} strokeWidth="2.2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
        </div>

        <p style={{ fontFamily: "'Poppins:Bold'", fontSize: 24, color: P.text, letterSpacing: "-0.4px", marginBottom: 2 }}>{s.name}</p>
        <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 13, color: P.sub }}>maria@email.com</p>

        {/* Stats strip */}
        <div className="flex gap-0 mt-6 w-full px-4">
          {[{ label: "Palavras salvas", value: String(SAVED_WORDS.length) }, { label: "Pesquisas", value: "47" }, { label: "Membro desde", value: "Set '26" }].map((stat, i) => (
            <div key={stat.label} className="flex-1 flex flex-col items-center py-3"
              style={{ borderLeft: i > 0 ? `1px solid ${P.border}` : undefined, borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}`,
                borderRight: i === 2 ? `1px solid ${P.border}` : undefined,
                background: P.card,
                borderRadius: i === 0 ? "12px 0 0 12px" : i === 2 ? "0 12px 12px 0" : undefined }}>
              <span style={{ fontFamily: "'Poppins:ExtraBold'", fontSize: 20, color: P.text, lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 10, color: P.sub, marginTop: 3 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-4" style={slideUpStyle(vis, 0.06)}>
        <ProfileMenuCard rows={menuRows} />
      </div>
    </div>
  );
}

// ─── Mobile Not Found ───────────────────────────────────────────────────────
function MobileNotFoundPage({ word, onBack }: { word: string; onBack: () => void }) {
  const vis = useFade("mobile-notfound-" + word);
  return (
    <div className="h-[calc(100vh-64px)] bg-[#fbf9f6] flex flex-col items-center justify-center px-6 gap-5"
      style={slideUpStyle(vis)}>
      <div className="text-center">
        <p className="font-['Poppins:ExtraBold'] text-[36px] text-[#1c1b19] tracking-[-0.72px] mb-2">"{word}"</p>
        <p className="font-['Poppins:Regular'] text-[15px] text-[#8c8a82]">Palavra não encontrada nos nossos dicionários.</p>
      </div>
      <button onClick={onBack}
        className="bg-[#1c1b19] text-white font-['Poppins:SemiBold'] text-[14px] px-6 py-3.5 rounded-[14px] active:scale-95 transition-transform">
        Voltar à busca
      </button>
    </div>
  );
}

// ─── Desktop Profile ────────────────────────────────────────────────────────
function ProfilePage({ onLogout, onBack }: { onLogout: () => void; onBack: () => void }) {
  const s = useMobileProfileState();
  const panel = s.panel; const setPanel = s.setPanel;
  const name = s.name;
  const avatarSrc = s.avatarSrc; const setAvatarSrc = s.setAvatarSrc;
  const notifs = s.notifs; const setNotifs = s.setNotifs;
  const dictToggles = s.dictToggles; const setDictToggles = s.setDictToggles;
  const pwCurrent = s.pwCurrent; const setPwCurrent = s.setPwCurrent;
  const pwNew = s.pwNew; const setPwNew = s.setPwNew;
  const pwConfirm = s.pwConfirm; const setPwConfirm = s.setPwConfirm;
  const pwSaved = s.pwSaved; const setPwSaved = s.setPwSaved;
  const nameEdit = s.nameEdit; const setNameEdit = s.setNameEdit;
  const vis = useFade(panel);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarSrc(URL.createObjectURL(f));
    setPanel("main");
  }

  const menuRows = PROFILE_MENU_ROWS(setPanel, onLogout);

  return (
    <div className="min-h-screen" style={{ background: P.bg, ...fadeStyle(vis) }}>
      <main className="max-w-[520px] mx-auto px-6 pt-10 pb-16">
        <div className="mb-8">
          <ProfileBackBtn onClick={panel === "main" ? onBack : () => setPanel("main")} />
        </div>

        {panel === "main" && (
          <div style={fadeStyle(vis)}>
            <div className="rounded-[28px] flex flex-col items-center gap-2 py-10 mb-5"
              style={{ background: P.card, border: `1px solid ${P.border}` }}>
              <p style={{ fontFamily: "'Poppins:ExtraBold'", fontSize: 20, color: P.text, letterSpacing: "-0.4px", marginBottom: 16 }}>Perfil</p>
              <div className="relative">
                <AvatarBubble size={96} initials={name[0]} src={avatarSrc} />
                <button onClick={() => setPanel("edit-avatar")}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "#ffffff", border: `1px solid ${P.borderMid}`, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
                  onPointerEnter={e => (e.currentTarget.style.background = "#f0ede6")}
                  onPointerLeave={e => (e.currentTarget.style.background = "#ffffff")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.text} strokeWidth="2.2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
              </div>
              <p style={{ fontFamily: "'Poppins:Bold'", fontSize: 20, color: P.text, marginTop: 8 }}>{name}</p>
              <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 13, color: P.sub }}>maria@email.com</p>
              <div className="flex gap-6 mt-5 pt-5 w-full justify-center" style={{ borderTop: `1px solid ${P.border}` }}>
                {[{ label: "Palavras salvas", value: String(SAVED_WORDS.length) }, { label: "Pesquisas", value: "47" }, { label: "Membro desde", value: "Set '26" }].map((stat, i) => (
                  <div key={stat.label} className="flex flex-col items-center gap-0.5 px-5"
                    style={{ borderLeft: i > 0 ? `1px solid ${P.border}` : undefined }}>
                    <span style={{ fontFamily: "'Poppins:ExtraBold'", fontSize: 22, color: P.text, lineHeight: 1 }}>{stat.value}</span>
                    <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 11, color: P.sub }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ProfileMenuCard rows={menuRows} />
          </div>
        )}

        {panel === "edit-avatar" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader title="Foto de Perfil" onBack={() => setPanel("main")} />
            <div className="flex flex-col items-center gap-8">
              <AvatarBubble size={120} initials={name[0]} src={avatarSrc} />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
              <div className="w-full flex flex-col gap-3">
                {[
                  { label: "Escolher da galeria", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.icon} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, action: () => fileRef.current?.click() },
                  { label: "Remover foto atual", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.danger} strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>, action: () => { setAvatarSrc(undefined); setPanel("main"); }, danger: true },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="flex items-center gap-4 px-6 py-4 rounded-[16px] transition-colors text-left"
                    style={{ background: (item as {danger?:boolean}).danger ? P.dangerBg : P.card, border: `1px solid ${P.border}`, color: (item as {danger?:boolean}).danger ? P.danger : P.text }}
                    onPointerEnter={e => (e.currentTarget.style.background = (item as {danger?:boolean}).danger ? "rgba(224,92,75,0.18)" : P.cardAlt)}
                    onPointerLeave={e => (e.currentTarget.style.background = (item as {danger?:boolean}).danger ? P.dangerBg : P.card)}>
                    {item.icon}
                    <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 15 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {panel === "edit-name" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader title="Editar Nome" onBack={() => setPanel("main")} />
            <div className="flex flex-col gap-5">
              <ProfileInput label="Nome" value={nameEdit} onChange={v => setNameEdit(v)} />
              <ProfileCTA label="Salvar" onClick={() => { s.setName(nameEdit); setPanel("main"); }} />
            </div>
          </div>
        )}

        {panel === "change-password" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader title="Alterar Senha" onBack={() => setPanel("main")} />
            <div className="flex flex-col gap-5">
              {pwSaved && (
                <div className="px-5 py-3.5 rounded-[14px]" style={{ background: P.successBg, border: `1px solid ${P.successBd}` }}>
                  <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 13, color: P.successTx }}>Senha alterada com sucesso!</span>
                </div>
              )}
              <ProfileInput label="Senha atual" type="password" value={pwCurrent} onChange={setPwCurrent} />
              <ProfileInput label="Nova senha" type="password" value={pwNew} onChange={setPwNew} />
              <ProfileInput label="Confirmar nova senha" type="password" value={pwConfirm} onChange={setPwConfirm} />
              <ProfileCTA label="Salvar senha" onClick={() => { setPwSaved(true); setPwCurrent(""); setPwNew(""); setPwConfirm(""); setTimeout(() => setPwSaved(false), 3000); }} />
            </div>
          </div>
        )}

        {panel === "notifications" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader title="Notificações" onBack={() => setPanel("main")} />
            <div className="rounded-[20px] overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}` }}>
              {[
                { label: "Novas palavras", sub: "Palavra do dia e vocabulário novo", on: notifs, toggle: () => setNotifs(n => !n) },
                { label: "Dicas de uso", sub: "Como usar o DICIOBASE melhor", on: true, toggle: () => {} },
                { label: "Novidades da plataforma", sub: "Atualizações e melhorias", on: false, toggle: () => {} },
              ].map((row, i) => (
                <div key={row.label} className="flex items-center justify-between px-6 py-4"
                  style={{ borderTop: i > 0 ? `1px solid ${P.border}` : undefined }}>
                  <div className="flex flex-col gap-0.5 flex-1 pr-6">
                    <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: P.text }}>{row.label}</span>
                    <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 12, color: P.sub }}>{row.sub}</span>
                  </div>
                  <Toggle on={row.on} onToggle={row.toggle} />
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === "dicts" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader title="Dicionários Ativos" onBack={() => setPanel("main")} />
            <div className="rounded-[20px] overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}` }}>
              {DICT_LIST.map((d, i) => (
                <div key={d.id} className="flex items-center justify-between px-6 py-4"
                  style={{ borderTop: i > 0 ? `1px solid ${P.border}` : undefined }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.c }} />
                    <div>
                      <div style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: P.text }}>{d.name}</div>
                      <div style={{ fontFamily: "'Poppins:Regular'", fontSize: 11, color: P.sub }}>{d.tag}</div>
                    </div>
                  </div>
                  <Toggle on={dictToggles[d.id]} onToggle={() => setDictToggles(t => ({ ...t, [d.id]: !t[d.id] }))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === "terms" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader title="Termos de Uso" onBack={() => setPanel("main")} />
            <div className="flex flex-col gap-6">
              {TERMS_SECTIONS.map(sec => (
                <div key={sec.title}>
                  <p style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 14, color: P.text, marginBottom: 5 }}>{sec.title}</p>
                  <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 13, color: P.sub, lineHeight: 1.65 }}>{sec.body}</p>
                </div>
              ))}
              <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>Última atualização: Setembro de 2026</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
type View =
  | { type: "login" }
  | { type: "signup" }
  | { type: "preferences" }
  | { type: "tutorial" }
  | { type: "home" }
  | { type: "definition"; word: string }
  | { type: "favorites" }
  | { type: "notfound"; word: string }
  | { type: "profile" };

export default function App() {
  const isMobile = useIsMobile();
  // Start at home — no account required to browse
  const [view, setView] = useState<View>({ type: "home" });
  const [navSearch, setNavSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("pesquisar");
  // keep goHome in sync with mobileTab

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Auth modal state (desktop overlay, works on any page)
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [postAuthCb, setPostAuthCb] = useState<(() => void) | null>(null);

  function openAuth(then?: () => void) {
    setPostAuthCb(then ? () => then : null);
    setAuthModal("login");
  }
  function handleAuth() {
    setIsLoggedIn(true);
    setAuthModal(null);
    if (postAuthCb) { postAuthCb(); setPostAuthCb(null); return; }
    // first time login → onboarding
    setView({ type: "preferences" });
  }

  function goSearch(word: string) {
    const key = word.toLowerCase();
    if (DB[key]) setView({ type: "definition", word: key });
    else setView({ type: "notfound", word });
  }

  function goHome() { setView({ type: "home" }); setNavSearch(""); setMobileTab("pesquisar"); }
  function goFav()  { setView({ type: "favorites" }); }

  // ── Mobile ───────────────────────────────────────────────────────────────
  if (isMobile) {
    const showAuth = view.type === "login" || view.type === "signup";
    const showPrefs = view.type === "preferences";
    const showTutorial = view.type === "tutorial";
    const showDefinition = view.type === "definition";
    const showNotFound = view.type === "notfound";
    const showBottomNav = !showAuth && !showPrefs && !showTutorial;

    const activeTab: MobileTab =
      view.type === "favorites" ? "salvos" : mobileTab;

    return (
      <div className="relative" style={{ background: "#fbf9f6" }}>
        {/* Auth flow */}
        {showAuth && (
          <MobileAuthPage onLogin={() => setView({ type: "preferences" })} />
        )}

        {/* Preferences */}
        {showPrefs && (
          <MobilePreferencesPage onContinue={() => setView({ type: "tutorial" })} />
        )}

        {/* Tutorial */}
        {showTutorial && (
          <MobileTutorialPage onFinish={() => setView({ type: "home" })} />
        )}

        {/* Main app */}
        {showBottomNav && !showDefinition && !showNotFound && view.type !== "favorites" && (
          <>
            {activeTab === "pesquisar" && <MobileHomePage onSearch={goSearch} />}
            {activeTab === "perfil" && <MobileProfilePage onLogout={goHome} />}
          </>
        )}

        {view.type === "favorites" && showBottomNav && (
          <MobileSavedPage onSearch={w => { goSearch(w); }} />
        )}

        {showDefinition && (
          <MobileDefinitionPage
            wordData={DB[(view as { type: "definition"; word: string }).word]}
            onSearch={goSearch}
            isLoggedIn={isLoggedIn}
            onOpenAuth={openAuth}
            onBack={() => {
              if (history.length > 1) setView({ type: "home" });
              else setView({ type: "home" });
            }}
          />
        )}

        {showNotFound && (
          <MobileNotFoundPage
            word={(view as { type: "notfound"; word: string }).word}
            onBack={() => setView({ type: "home" })}
          />
        )}

        {/* Bottom nav */}
        {showBottomNav && (
          <MobileBottomNav
            active={activeTab}
            onChange={tab => {
              setMobileTab(tab);
              if (tab === "salvos") setView({ type: "favorites" });
              else setView({ type: "home" });
            }}
          />
        )}
      </div>
    );
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  function goProfile() {
    if (!isLoggedIn) { openAuth(); return; }
    setView({ type: "profile" });
  }

  const showAppNav = ["home","definition","favorites","notfound","profile"].includes(view.type);

  return (
    <>
      {showAppNav && (
        <AppNav
          onHome={goHome}
          onFavorites={goFav}
          onProfile={goProfile}
          onSearch={word => { setNavSearch(""); goSearch(word); }}
          searchValue={navSearch}
          onSearchChange={setNavSearch}
          isLoggedIn={isLoggedIn}
          hideSearch={view.type === "home"}
        />
      )}
      <div style={{ paddingTop: showAppNav ? 64 : 0 }}>
        {view.type === "preferences" && (
          <PreferencesPage onContinue={() => setView({ type: "tutorial" })} />
        )}
        {view.type === "tutorial" && (
          <TutorialPage onFinish={() => setView({ type: "home" })} />
        )}
        {view.type === "home" && (
          <div style={{ marginTop: -64 }}>
            <HomePage onSearch={goSearch} onOpenAuth={() => openAuth()} />
          </div>
        )}
        {view.type === "definition" && (
          <div style={{ marginTop: -64 }}>
            <DefinitionPage
              wordData={DB[(view as { type: "definition"; word: string }).word]}
              onSearch={goSearch}
              onBack={goHome}
              isLoggedIn={isLoggedIn}
              onOpenAuth={then => openAuth(then)}
            />
          </div>
        )}
        {view.type === "favorites" && (
          <FavoritesPage onSearch={goSearch} />
        )}
        {view.type === "notfound" && (
          <NotFoundPage
            word={(view as { type: "notfound"; word: string }).word}
            onBack={goHome}
          />
        )}
        {view.type === "profile" && (
          <ProfilePage onLogout={() => { setIsLoggedIn(false); goHome(); }} onBack={goHome} />
        )}
      </div>

      {/* Global auth modal overlay (works on any page) */}
      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onAuth={handleAuth}
          onClose={() => { setAuthModal(null); setPostAuthCb(null); }}
        />
      )}
    </>
  );
}
