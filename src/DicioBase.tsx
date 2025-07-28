
import React, { useState } from 'react';
import { Search, Moon, Sun, Volume2, BookOpen, Eye, EyeOff } from 'lucide-react';

// interface para representar um significado de uma palavra
interface Significado {
  numero: number;        
  definicao: string;     
  exemplo: string;       
  contexto: string;      
}

// interface para representar expressões
interface Expressao {
  expressao: string;     
  significado: string;  
}

// interface principal para representar uma palavra completa no dicionário
interface Word {
  id: number;                    // identificador único
  palavra: string;              
  classe_gramatical: string;     
  pronuncia: string;             
  plural: string;                
  origem: string;                
  nivel_uso: string;             
  registro: string;              
  significados: Significado[];   
  expressoes: Expressao[];       
  sinonimos: string[];           
  antonimos: string[];          
  regioes_uso: string[];         
  frequencia: number;            
}

const DicioBase = () => {
  
  // controlar o modo escuro/claro
  const [darkMode, setDarkMode] = useState(false);
  
  // armazenar o termo de busca digitado pelo usuário
  const [searchTerm, setSearchTerm] = useState('');
  
  //armazenar a palavra selecionada pelo usuário
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  
  // controlar se a microestrutura deve ser exibida
  const [showMicrostructure, setShowMicrostructure] = useState(false);

  
  // DADOS DE EXEMPLO 
  const sampleWords: Word[] = [
    {
      id: 1,
      palavra: "casa",
      classe_gramatical: "substantivo feminino",
      pronuncia: "/ˈkazi/",
      plural: "casas",
      origem: "do latim 'casa', que significa cabana, moradia rústica",
      nivel_uso: "comum",
      registro: "formal",
      significados: [
        {
          numero: 1,
          definicao: "Edificação destinada à habitação humana.",
          exemplo: "Ela comprou uma casa nova no interior.",
          contexto: "arquitetura, moradia"
        },
        {
          numero: 2,
          definicao: "Lar; lugar de afeto e convivência familiar.",
          exemplo: "Minha casa é onde está meu coração.",
          contexto: "figurado, afetivo"
        },
        {
          numero: 3,
          definicao: "Estabelecimento comercial ou institucional.",
          exemplo: "Casa de câmbio.",
          contexto: "comercial"
        }
      ],
      expressoes: [
        { expressao: "cair a casa", significado: "surgir um problema inesperado" },
        { expressao: "estar em casa", significado: "sentir-se confortável" }
      ],
      sinonimos: ["residência", "lar", "moradia"],
      antonimos: ["rua (em sentido figurado)"],
      regioes_uso: ["Brasil (geral)", "Portugal (com pequenas variações)"],
      frequencia: 95
    },
    {
      id: 2,
      palavra: "saudade",
      classe_gramatical: "substantivo feminino",
      pronuncia: "/sawˈdadʒi/",
      plural: "saudades",
      origem: "do latim 'solitate', solidão",
      nivel_uso: "comum",
      registro: "formal/informal",
      significados: [
        {
          numero: 1,
          definicao: "Sentimento de pesar pela ausência de alguém ou algo querido.",
          exemplo: "Sinto saudade dos meus avós.",
          contexto: "emocional"
        },
        {
          numero: 2,
          definicao: "Lembrança nostálgica de algo bom que passou.",
          exemplo: "Que saudade daquele tempo!",
          contexto: "temporal, nostálgico"
        }
      ],
      expressoes: [
        { expressao: "matar a saudade", significado: "rever alguém ou algo que se desejava" },
        { expressao: "morrer de saudade", significado: "sentir muita falta" }
      ],
      sinonimos: ["nostalgia", "pesar"],
      antonimos: ["presença", "esquecimento"],
      regioes_uso: ["Brasil", "Portugal", "PALOP"],
      frequencia: 88
    }
  ];

  return (
    <div>
      <h1>DicioBase</h1>
      <p>Dicionário Brasileiro</p>
    </div>
  );
};

export default DicioBase;