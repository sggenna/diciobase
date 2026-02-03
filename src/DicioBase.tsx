
import React, { useState, useMemo, useCallback } from 'react';
import { Search, Moon, Sun, Volume2, BookOpen, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// interface para representar um topônimo
interface Toponym {
  idverbete: number;
  lema: string;
  estrutura_morfologica: string;
  categoria_gramatical: string;
}

// Static demo data: used when no Supabase/API (e.g. Vercel with no env vars) so the app shows all features
const DEMO_TOPONYMS: Toponym[] = [
  { idverbete: 1, lema: 'Paranaguá', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 2, lema: 'Araguaia', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 3, lema: 'Curitiba', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 4, lema: 'Santos', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 5, lema: 'Iguaçu', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 6, lema: 'Brasília', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 7, lema: 'Amazonas', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 8, lema: 'Fernando de Noronha', estrutura_morfologica: 'Composto', categoria_gramatical: 'Substantivo' },
  { idverbete: 9, lema: 'Salvador', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 10, lema: 'Ouro Preto', estrutura_morfologica: 'Composto', categoria_gramatical: 'Substantivo' },
  { idverbete: 11, lema: 'Pantanal', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 12, lema: 'Copacabana', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 13, lema: 'Ipanema', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 14, lema: 'Recife', estrutura_morfologica: 'Simples', categoria_gramatical: 'Substantivo' },
  { idverbete: 15, lema: 'São Paulo', estrutura_morfologica: 'Composto', categoria_gramatical: 'Substantivo' },
];

const DicioBase = () => {
  
  // controlar o modo escuro/claro - salvar preferência no localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // armazenar o termo de busca digitado pelo usuário
  const [searchTerm, setSearchTerm] = useState('');
  
  //armazenar o topônimo selecionado pelo usuário
  const [selectedToponym, setSelectedToponym] = useState<Toponym | null>(null);
  
  // controlar se a microestrutura deve ser exibida
  const [showMicrostructure, setShowMicrostructure] = useState(false);

  
  // estados para dados do banco
  const [toponyms, setToponyms] = useState<Toponym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When deployed on Supabase: use Supabase client (set REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY)
  const supabase = useMemo(() => {
    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (url && key) return createClient(url, key);
    return null;
  }, []);

  const useSupabase = Boolean(supabase);

  // Static demo: no Supabase/API – embedded data + browser pronunciation (ideal for Vercel with no backend)
  const useStaticDemo =
    process.env.REACT_APP_USE_STATIC_DEMO === 'true' ||
    (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_SUPABASE_URL);

  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || 'https://us-central1-diciobase.cloudfunctions.net')
    : 'http://localhost:3001';

  const fetchToponyms = useCallback(async () => {
    setLoading(true);
    try {
      if (useStaticDemo) {
        setToponyms(DEMO_TOPONYMS);
        setError(null);
        return;
      }
      if (useSupabase && supabase) {
        const { data, error: e } = await supabase
          .from('toponyms_view')
          .select('idverbete, lema, estrutura_morfologica, categoria_gramatical')
          .order('idverbete');
        if (e) throw new Error(e.message);
        setToponyms(data ?? []);
      } else {
        const response = await fetch(`${API_BASE_URL}/toponyms`);
        const result = await response.json();
        if (result.success) {
          setToponyms(result.data);
          setError(null);
        } else {
          setToponyms(DEMO_TOPONYMS);
          setError(null);
        }
      }
    } catch (err) {
      setToponyms(DEMO_TOPONYMS);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [useStaticDemo, useSupabase, supabase, API_BASE_URL]);

  const searchToponyms = async (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      await fetchToponyms();
      return;
    }
    if (useStaticDemo) {
      setToponyms(DEMO_TOPONYMS.filter(t => t.lema.toLowerCase().includes(q)));
      return;
    }
    try {
      if (useSupabase && supabase) {
        const { data, error: e } = await supabase
          .from('toponyms_view')
          .select('idverbete, lema, estrutura_morfologica, categoria_gramatical')
          .ilike('lema', `%${q}%`)
          .order('idverbete');
        if (e) throw new Error(e.message);
        setToponyms(data ?? []);
      } else {
        const response = await fetch(`${API_BASE_URL}/searchToponyms?q=${encodeURIComponent(query)}`);
        const result = await response.json();
        if (result.success) setToponyms(result.data);
        else setToponyms(DEMO_TOPONYMS.filter(t => t.lema.toLowerCase().includes(q)));
      }
    } catch (err) {
      setToponyms(DEMO_TOPONYMS.filter(t => t.lema.toLowerCase().includes(q)));
    }
  };

  // carregar dados na inicialização
  React.useEffect(() => {
    fetchToponyms();
  }, [fetchToponyms]);

  // filtrar topônimos baseado no termo de busca
  const filteredToponyms = toponyms.filter(toponym => 
    toponym.lema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // alternar entre modo escuro e claro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  // quando o usuário seleciona um topônimo
  const selectToponym = (toponym: Toponym) => {
    setSelectedToponym(toponym);                    
    setShowMicrostructure(false);           
  };

  const playPronunciation = async (toponym: Toponym) => {
    // In static demo (Vercel no Supabase) or when using Supabase: use browser TTS only
    if (!useStaticDemo && !useSupabase) {
      const pronunciationUrl = `${API_BASE_URL}/pronunciation?lema=${encodeURIComponent(toponym.lema)}`;
      try {
        const res = await fetch(pronunciationUrl);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          await audio.play();
          return;
        }
      } catch {
        // Fall through to browser TTS
      }
    }
    // Browser speech synthesis (pt-BR) – works everywhere, no backend needed
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser');
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(toponym.lema);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    const getVoices = (): SpeechSynthesisVoice[] => speechSynthesis.getVoices();
    let voices = getVoices();
    if (voices.length === 0) {
      await new Promise<void>(resolve => {
        const onVoices = () => {
          voices = getVoices();
          speechSynthesis.onvoiceschanged = null;
          resolve();
        };
        speechSynthesis.onvoiceschanged = onVoices;
        setTimeout(resolve, 500);
      });
      voices = getVoices();
    }
    const pt = voices.find(v => v.lang.startsWith('pt-BR')) ?? voices.find(v => v.lang.startsWith('pt'));
    if (pt) utterance.voice = pt;
    speechSynthesis.speak(utterance);
  };

  
   
  return (
    // container principal com classes condicionais para modo escuro/claro
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