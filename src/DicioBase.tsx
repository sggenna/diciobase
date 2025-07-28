
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
  return (
    <div>
      <h1>DicioBase</h1>
      <p>Dicionário Brasileiro</p>
    </div>
  );
};

export default DicioBase;