// Importações necessárias do React e bibliotecas externas
import React, { useState } from 'react';
import { Search, Moon, Sun, Volume2, BookOpen, Eye, EyeOff } from 'lucide-react';

// ============================================================================
// DEFINIÇÕES DE TIPOS TYPESCRIPT
// ============================================================================

// Interface para representar um significado/definição de uma palavra
interface Significado {
  numero: number;        // Número sequencial do significado
  definicao: string;     // Definição em si
  exemplo: string;       // Exemplo de uso
  contexto: string;      // Contexto de uso (formal, informal, etc.)
}

// Interface para representar expressões idiomáticas
interface Expressao {
  expressao: string;     // A expressão em si
  significado: string;   // Significado da expressão
}

// Interface principal para representar uma palavra completa no dicionário
interface Word {
  id: number;                    // Identificador único
  palavra: string;               // A palavra em si
  classe_gramatical: string;     // Classe gramatical (substantivo, verbo, etc.)
  pronuncia: string;             // Pronúncia fonética
  plural: string;                // Forma plural
  origem: string;                // Origem etimológica
  nivel_uso: string;             // Nível de uso (comum, raro, etc.)
  registro: string;              // Registro (formal, informal)
  significados: Significado[];   // Lista de significados
  expressoes: Expressao[];       // Lista de expressões
  sinonimos: string[];           // Sinônimos
  antonimos: string[];           // Antônimos
  regioes_uso: string[];         // Regiões onde é usado
  frequencia: number;            // Frequência de uso (0-100)
}

// ============================================================================
// COMPONENTE PRINCIPAL DICIOBASE
// ============================================================================

const DicioBase = () => {
  // ============================================================================
  // ESTADOS (STATES) DO COMPONENTE
  // ============================================================================
  
  // Estado para controlar o modo escuro/claro
  const [darkMode, setDarkMode] = useState(false);
  
  // Estado para armazenar o termo de busca digitado pelo usuário
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para armazenar a palavra selecionada pelo usuário
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  
  // Estado para controlar se a microestrutura deve ser exibida
  const [showMicrostructure, setShowMicrostructure] = useState(false);

  // ============================================================================
  // DADOS DE EXEMPLO - SIMULAÇÃO DE UM BANCO DE DADOS
  // ============================================================================
  
  // Array com palavras de exemplo para demonstrar a funcionalidade
  // Em uma aplicação real, estes dados viriam de uma API ou banco de dados
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

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================
  
  // Filtra as palavras baseado no termo de busca
  // Converte tudo para minúsculas para fazer busca case-insensitive
  const filteredWords = sampleWords.filter(word => 
    word.palavra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para alternar entre modo escuro e claro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Função chamada quando o usuário seleciona uma palavra
  const selectWord = (word: Word) => {
    setSelectedWord(word);                    // Define a palavra selecionada
    setShowMicrostructure(false);            // Esconde a microestrutura
  };

  // Função para simular a reprodução da pronúncia
  // Em uma aplicação real, usaria Web Speech API ou arquivos de áudio
  const playPronunciation = (word: Word) => {
    console.log(`Playing pronunciation for: ${word.palavra}`);
    // Aqui seria implementada a funcionalidade real de pronúncia
  };

  // ============================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ============================================================================
  
  return (
    // Container principal com classes condicionais para modo escuro/claro
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      
      {/* ============================================================================
          CABEÇALHO (HEADER) DA APLICAÇÃO
          ============================================================================ */}
      <header className={`sticky top-0 z-10 border-b transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e título da aplicação */}
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-2xl font-bold tracking-tight">DicioBase</h1>
              <span className="text-sm opacity-60">Dicionário Brasileiro</span>
            </div>
            
            {/* Botão para alternar modo escuro/claro */}
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

      {/* ============================================================================
          CONTEÚDO PRINCIPAL
          ============================================================================ */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* ============================================================================
              PAINEL DE BUSCA (COLUNA ESQUERDA)
              ============================================================================ */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              
              {/* Campo de busca com ícone */}
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

              {/* Lista de resultados da busca */}
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

          {/* ============================================================================
              PAINEL DE EXIBIÇÃO DA PALAVRA (COLUNA DIREITA)
              ============================================================================ */}
          <div className="lg:col-span-2">
            {selectedWord ? (
              // Se uma palavra foi selecionada, mostra os detalhes
              <div className={`rounded-2xl p-8 shadow-sm border transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                
                {/* ============================================================================
                    CABEÇALHO DA PALAVRA SELECIONADA
                    ============================================================================ */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    {/* Título da palavra e botão de pronúncia */}
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
                    
                    {/* Informações básicas da palavra */}
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

                  {/* Botão para mostrar/ocultar microestrutura */}
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

                {/* ============================================================================
                    SEÇÃO DE MICROESTRUTURA (OPCIONAL)
                    ============================================================================ */}
                {showMicrostructure && (
                  <div className={`mb-8 p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                    darkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h3 className="font-semibold mb-4 text-lg">Microestrutura Completa</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Palavra:</strong> {selectedWord.palavra}<br/>
                        <strong>Classe:</strong> {selectedWord.classe_gramatical}<br/>
                        <strong>Pronúncia:</strong> {selectedWord.pronuncia}<br/>
                        <strong>Plural:</strong> {selectedWord.plural}<br/>
                        <strong>Origem:</strong> {selectedWord.origem}
                      </div>
                      <div>
                        <strong>Nível de uso:</strong> {selectedWord.nivel_uso}<br/>
                        <strong>Registro:</strong> {selectedWord.registro}<br/>
                        <strong>Frequência:</strong> {selectedWord.frequencia}%<br/>
                        <strong>Regiões:</strong> {selectedWord.regioes_uso.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================================
                    SEÇÃO DE SIGNIFICADOS
                    ============================================================================ */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 text-lg">Significados</h3>
                  <div className="space-y-6">
                    {selectedWord.significados.map((sig, index) => (
                      <div key={index} className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          {/* Número do significado */}
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sig.numero}
                          </span>
                          <div className="flex-1">
                            {/* Definição */}
                            <p className="font-medium mb-2">{sig.definicao}</p>
                            {/* Exemplo de uso */}
                            <p className={`italic text-sm mb-2 ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              "{sig.exemplo}"
                            </p>
                            {/* Contexto */}
                            <span className={`text-xs px-2 py-1 rounded ${
                              darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {sig.contexto}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================================================
                    SEÇÃO DE EXPRESSÕES
                    ============================================================================ */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 text-lg">Expressões</h3>
                  <div className="space-y-3">
                    {selectedWord.expressoes.map((expr, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <span className="font-medium">{expr.expressao}</span>
                        <span className="opacity-60 ml-2">— {expr.significado}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================================================
                    SEÇÃO DE SINÔNIMOS E ANTÔNIMOS
                    ============================================================================ */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sinônimos */}
                  <div>
                    <h3 className="font-semibold mb-3">Sinônimos</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWord.sinonimos.map((sin, index) => (
                        <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          {sin}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Antônimos */}
                  <div>
                    <h3 className="font-semibold mb-3">Antônimos</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWord.antonimos.map((ant, index) => (
                        <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                        }`}>
                          {ant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Se nenhuma palavra foi selecionada, mostra tela de boas-vindas
              <div className={`rounded-2xl p-12 text-center shadow-sm border transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h2 className="text-2xl font-bold mb-2">DicioBase</h2>
                <p className="text-lg opacity-60 mb-4">
                  Dicionário moderno do português brasileiro
                </p>
                <p className="opacity-40">
                  Selecione uma palavra para ver sua microestrutura completa
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