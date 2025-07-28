
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

  // funções auxiliares
  
  // filtra as palavras baseado no termo de busca (case-insensitive)
  const filteredWords = sampleWords.filter(word => 
    word.palavra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // alternar entre modo escuro e claro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // quando o usuário seleciona uma palavra
  const selectWord = (word: Word) => {
    setSelectedWord(word);                    
    setShowMicrostructure(false);           
  };

  const playPronunciation = (word: Word) => {
    console.log(`Playing pronunciation for: ${word.palavra}`);
    // a gente pode usar web speech api ou arquivos de audio prra simular a pronuncia
  };

  
   
  return (
    // Container principal com classes condicionais para modo escuro/claro
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      
      
      <header className={`sticky top-0 z-10 border-b transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-2xl font-bold tracking-tight">DicioBase</h1>
              <span className="text-sm opacity-60">Dicionário Brasileiro</span>
            </div>
      
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* coluna de resultados da busca */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              
              {/* campo de busca */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-5 w-5 opacity-50" />
                <input
                  type="text"
                  placeholder="Pesquisar palavra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* lista de resultados da busca */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide opacity-60">
                  Resultados ({filteredWords.length})
                </h3>
                {filteredWords.map(word => (
                  <button
                    key={word.id}
                    onClick={() => selectWord(word)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedWord?.id === word.id
                        ? darkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-50 text-blue-900 border-blue-200'
                        : darkMode 
                          ? 'hover:bg-gray-700 text-gray-300' 
                          : 'hover:bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{word.palavra}</div>
                        <div className="text-sm opacity-60">{word.classe_gramatical}</div>
                      </div>
                      <div className="text-xs opacity-40">
                        {word.significados.length} def.
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PAINEL de exibição da palavra */}
          <div className="lg:col-span-2">
            {selectedWord ? (
              // Se uma palavra foi selecionada, mostra os detalhes
              <div className={`rounded-2xl p-8 shadow-sm border transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                
                {/* cabeçalho da palavra selecionada */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    {/* título da palavra e botão de pronúncia */}
                    <div className="flex items-center space-x-4 mb-4">
                      <h1 className="text-4xl font-bold">{selectedWord.palavra}</h1>
                      <button
                        onClick={() => playPronunciation(selectedWord)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* informações básicas da palavra */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full ${
                        darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedWord.classe_gramatical}
                      </span>
                      <span className="opacity-60">{selectedWord.pronuncia}</span>
                      <span className="opacity-60">Frequência: {selectedWord.frequencia}%</span>
                    </div>
                  </div>

                  {/*mostrar/ocultar microestrutura */}
                  <button
                    onClick={() => setShowMicrostructure(!showMicrostructure)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      showMicrostructure
                        ? darkMode 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-50 text-green-700 border border-green-200'
                        : darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {showMicrostructure ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {showMicrostructure ? 'Ocultar' : 'Microestrutura'}
                    </span>
                  </button>
                </div>

                {showMicrostructure && selectedWord ? (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Microestrutura</h2>
                    <div className="grid gap-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Significados</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedWord.significados.map((significado, index) => (
                            <li key={index} className="text-lg">
                              <strong>Definição {significado.numero}:</strong> {significado.definicao}
                              {significado.exemplo && ` (Exemplo: "${significado.exemplo}")`}
                              {significado.contexto && ` (Contexto: "${significado.contexto}")`}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Expressões</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedWord.expressoes.map((expressao, index) => (
                            <li key={index} className="text-lg">
                              <strong>Expressão:</strong> {expressao.expressao}
                              <br />
                              <strong>Significado:</strong> {expressao.significado}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Sinônimos</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedWord.sinonimos.map((sinonimo, index) => (
                            <li key={index} className="text-lg">{sinonimo}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Antônimos</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedWord.antonimos.map((antonimo, index) => (
                            <li key={index} className="text-lg">{antonimo}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Regiões de Uso</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedWord.regioes_uso.map((regiao, index) => (
                            <li key={index} className="text-lg">{regiao}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Clique no botão "Microestrutura" para ver os detalhes da palavra.</p>
                )}
              </div>
            ) : (
              // se nenhuma palavra foi selecionada mostra tela de boas-vindas
              <div className={`rounded-2xl p-12 text-center shadow-sm border transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h2 className="text-2xl font-bold mb-2">DicioBase</h2>
                <p className="text-lg opacity-60 mb-4">
                  Dicionário moderno do português brasileiro
                </p>
                <p className="opacity-40">
                  Selecione uma palavra para ver microestruturas de vários dicionários diferentes!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DicioBase;