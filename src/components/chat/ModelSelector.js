'use client';

import { useState, useRef, useEffect } from 'react';

export default function ModelSelector({ selectedModel, setSelectedModel }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const models = [
    { 
      id: 'gemini', 
      name: 'Google Gemini', 
      description: 'Google\'s advanced AI model with multimodal capabilities',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'gpt', 
      name: 'OpenAI GPT', 
      description: 'Versatile language model with broad knowledge',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3.5V2M5.06066 5.06066L4 4M5.06066 13.0607L4 14.1213M13.0607 5.06066L14.1213 4M12 3.5V2M18.9393 5.06066L20 4M3.5 9H2M3.5 12H2M14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5C13.3807 9.5 14.5 10.6193 14.5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 17H17M12 14V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'claude', 
      name: 'Anthropic Claude', 
      description: 'Known for helpfulness, harmlessness, and honesty',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          <path d="M13 7.8C13 8.4 12.6 8.8 12 8.8C11.4 8.8 11 8.4 11 7.8C11 7.2 11.4 6.8 12 6.8C12.6 6.8 13 7.2 13 7.8Z" fill="currentColor"/>
          <path d="M15 14.2C15 16.2 13.7 17.2 12 17.2C10.3 17.2 9 16.2 9 14.2V12.2H15V14.2Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ) 
    },
    { 
      id: 'llama', 
      name: 'Meta Llama', 
      description: 'Open-source large language model by Meta',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 12C7.5 14.4853 9.51472 16.5 12 16.5C14.4853 16.5 16.5 14.4853 16.5 12V8C16.5 5.51472 14.4853 3.5 12 3.5C9.51472 3.5 7.5 5.51472 7.5 8V12Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 9H7.5M20 9H16.5M18 21.5L15.4 16.5M6 21.5L8.6 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
  ];

  const selectedModelInfo = models.find(model => model.id === selectedModel) || models[0];

  // Model-specific colors
  const getModelColor = (modelId) => {
    switch(modelId) {
      case 'gemini': return 'text-sky-600 bg-sky-50 border-sky-200';
      case 'gpt': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'claude': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'llama': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

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
        <span className={`flex items-center justify-center w-6 h-6 mr-2 rounded-md ${getModelColor(selectedModel)}`}>
          {selectedModelInfo.icon}
        </span>
        <span>
          <span className="text-sm text-gray-600">Model</span>
          <span className="block text-sm font-medium text-gray-900">{selectedModelInfo.name}</span>
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
        <div className="absolute mt-1 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transform origin-top-left transition-all duration-200 opacity-100 scale-100">
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Select a model
            </div>
            <ul role="listbox">
              {models.map(model => (
                <li key={model.id}>
                  <button
                    role="option"
                    aria-selected={model.id === selectedModel}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-start hover:bg-gray-50 transition-colors ${
                      model.id === selectedModel ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 mr-3 rounded-md ${getModelColor(model.id)}`}>
                      {model.icon}
                    </span>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        model.id === selectedModel ? 'text-indigo-700' : 'text-gray-900'
                      }`}>
                        {model.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                    </div>
                    {model.id === selectedModel && (
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
