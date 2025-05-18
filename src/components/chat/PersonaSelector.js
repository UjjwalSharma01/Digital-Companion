'use client';

import { useState, useEffect, useRef } from 'react';
import { getAvailablePersonas } from '@/personas';

export default function PersonaSelector({ selectedPersona, setSelectedPersona }) {
  const [isOpen, setIsOpen] = useState(false);
  const [personas, setPersonas] = useState([]);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Load personas from the personas module
  useEffect(() => {
    setPersonas(getAvailablePersonas());
  }, []);

  const selectedPersonaInfo = personas.find(persona => persona.id === selectedPersona);
  
  // Persona-specific colors and backgrounds
  const getPersonaStyle = (personaId) => {
    switch(personaId) {
      case 'romantic':
        return { textColor: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-100' };
      case 'professional':
        return { textColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' };
      case 'creative':
        return { textColor: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100' };
      case 'motivational':
        return { textColor: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' };
      case 'wellness':
        return { textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' };
      case 'default':
      default:
        return { textColor: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-100' };
    }
  };

  // Persona specific color for currently selected persona
  const currentStyle = selectedPersonaInfo ? getPersonaStyle(selectedPersonaInfo.id) : getPersonaStyle('default');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center border rounded-lg px-3 py-2 hover:shadow-sm transition-shadow ${
          isOpen ? 'border-indigo-300 ring-1 ring-indigo-300' : 'border-gray-300 hover:border-gray-400'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${currentStyle.bgColor} ${currentStyle.textColor} text-base`}>
          {selectedPersonaInfo?.emoji || '😀'}
        </span>
        <span>
          <span className="text-sm text-gray-600">Persona</span>
          <span className="block text-sm font-medium text-gray-900">{selectedPersonaInfo?.name || 'Select Persona'}</span>
        </span>
        <svg 
          className={`w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-1 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transform origin-top-right transition-all duration-200 opacity-100 scale-100">
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Choose personality
            </div>
            <ul role="listbox">
              {personas.map(persona => {
                const style = getPersonaStyle(persona.id);
                return (
                  <li key={persona.id}>
                    <button
                      role="option"
                      aria-selected={persona.id === selectedPersona}
                      onClick={() => {
                        setSelectedPersona(persona.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 flex items-center hover:bg-gray-50 transition-colors ${
                        persona.id === selectedPersona ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <span className={`flex items-center justify-center w-10 h-10 mr-3 rounded-full ${style.bgColor} ${style.textColor} text-xl`}>
                        {persona.emoji}
                      </span>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          persona.id === selectedPersona ? 'text-indigo-700' : 'text-gray-900'
                        }`}>
                          {persona.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {persona.description}
                        </div>
                      </div>
                      {persona.id === selectedPersona && (
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
