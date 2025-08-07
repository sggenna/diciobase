
import React, { useState } from 'react';
import { Search, Moon, Sun, Volume2, BookOpen, Eye, EyeOff } from 'lucide-react';

// interface para representar um topônimo
interface Toponym {
  idverbete: number;
  lema: string;
  estrutura_morfologica: string;
  categoria_gramatical: string;
}

// interface para detalhes completos de um verbete
interface VerbeteDetail {
  tipodicionario: string;
  dicionario: string;
  microestrutura: string;
  elemento: string;
  idverbete: number;
  conteudo: string;
}

const DicioBase = () => {
  
  // controlar o modo escuro/claro
  const [darkMode, setDarkMode] = useState(false);
  
  // armazenar o termo de busca digitado pelo usuário
  const [searchTerm, setSearchTerm] = useState('');
  
  //armazenar o topônimo selecionado pelo usuário
  const [selectedToponym, setSelectedToponym] = useState<Toponym | null>(null);
  
  // controlar se a microestrutura deve ser exibida
  const [showMicrostructure, setShowMicrostructure] = useState(false);

  
  // Estados para dados do banco
  const [toponyms, setToponyms] = useState<Toponym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do banco
  const fetchToponyms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/toponyms');
      const result = await response.json();
      
      if (result.success) {
        setToponyms(result.data);
      } else {
        setError('Failed to load toponyms');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Buscar topônimos
  const searchToponyms = async (query: string) => {
    if (!query.trim()) {
      await fetchToponyms();
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/toponyms/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        setToponyms(result.data);
      }
    } catch (err) {
      setError('Error searching toponyms');
    }
  };

  // Carregar dados na inicialização
  React.useEffect(() => {
    fetchToponyms();
  }, []);

  // Filtrar topônimos baseado no termo de busca
  const filteredToponyms = toponyms.filter(toponym => 
    toponym.lema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // alternar entre modo escuro e claro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // quando o usuário seleciona um topônimo
  const selectToponym = (toponym: Toponym) => {
    setSelectedToponym(toponym);                    
    setShowMicrostructure(false);           
  };

  const playPronunciation = (toponym: Toponym) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(toponym.lema);
      utterance.lang = 'pt-BR'; // Portuguese (Brazil)
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to get a Brazilian Portuguese voice
      const voices = speechSynthesis.getVoices();
      const brazilianVoice = voices.find(voice => 
        voice.lang.includes('pt-BR') || voice.lang.includes('pt') || voice.name.includes('Brazil')
      );
      
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      console.log(`Playing pronunciation for: ${toponym.lema}`);
      alert('Speech synthesis not supported in this browser');
    }
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
                  placeholder="Pesquisar topônimo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchToponyms(e.target.value);
                  }}
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
                  Resultados ({filteredToponyms.length})
                </h3>
                {loading ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : error ? (
                  <div className="text-red-500 text-center py-4">{error}</div>
                ) : (
                  filteredToponyms.map(toponym => (
                    <button
                      key={toponym.idverbete}
                      onClick={() => selectToponym(toponym)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedToponym?.idverbete === toponym.idverbete
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
                          <div className="font-medium">{toponym.lema}</div>
                          <div className="text-sm opacity-60">{toponym.categoria_gramatical}</div>
                        </div>
                        <div className="text-xs opacity-40">
                          {toponym.estrutura_morfologica}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PAINEL de exibição do topônimo */}
          <div className="lg:col-span-2">
            {selectedToponym ? (
              // se um topônimo foi selecionado, mostra os detalhes
              <div className={`rounded-2xl p-8 shadow-sm border transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                
                {/* cabeçalho do topônimo selecionado */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    {/* título do topônimo e botão de pronúncia */}
                    <div className="flex items-center space-x-4 mb-4">
                      <h1 className="text-4xl font-bold">{selectedToponym.lema}</h1>
                      <button
                        onClick={() => playPronunciation(selectedToponym)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* informações básicas do topônimo */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full ${
                        darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedToponym.categoria_gramatical}
                      </span>
                      <span className={`px-3 py-1 rounded-full ${
                        darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedToponym.estrutura_morfologica}
                      </span>
                      <span className="opacity-60">ID: {selectedToponym.idverbete}</span>
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

                {/* seção de microestrutura */}
                {showMicrostructure && (
                  <div className={`mb-8 p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                    darkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h3 className="font-semibold mb-4 text-lg">Microestrutura Completa</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Lema:</strong> {selectedToponym.lema}<br/>
                        <strong>Categoria Gramatical:</strong> {selectedToponym.categoria_gramatical}<br/>
                        <strong>Estrutura Morfológica:</strong> {selectedToponym.estrutura_morfologica}<br/>
                        <strong>ID do Verbete:</strong> {selectedToponym.idverbete}
                      </div>
                      <div>
                        <strong>Tipo de Dicionário:</strong> Topônimos<br/>
                        <strong>Dicionário:</strong> DTMS<br/>
                        <strong>Microestrutura:</strong> Microestrutura de Topônimos
                      </div>
                    </div>
                  </div>
                )}

                {/* seção de elementos do verbete */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 text-lg">Elementos do Verbete</h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          1
                        </span>
                        <div className="flex-1">
                          <p className="font-medium mb-2">Lema: {selectedToponym.lema}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            Elemento principal
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          darkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                        }`}>
                          2
                        </span>
                        <div className="flex-1">
                          <p className="font-medium mb-2">Estrutura Morfológica: {selectedToponym.estrutura_morfologica}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            Característica morfológica
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'
                        }`}>
                          3
                        </span>
                        <div className="flex-1">
                          <p className="font-medium mb-2">Categoria Gramatical: {selectedToponym.categoria_gramatical}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            Classificação gramatical
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // se nenhuma palavra foi selecionada mostra tela de boas-vindas
              <div className={`rounded-2xl p-12 text-center shadow-sm border transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h2 className="text-2xl font-bold mb-2">DicioBase</h2>
                <p className="text-lg opacity-60 mb-4">
                  Dicionário Brasileiro
                </p>
                <p className="opacity-40">
                  Selecione uma palavra para ver suas diferentes microestruturas!
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