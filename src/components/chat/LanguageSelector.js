'use client';

import { useEffect, useState } from 'react';
import { LANGUAGE_PREF_KEY, SUPPORTED_LANGUAGES } from '@/lib/constants/chat';

export default function LanguageSelector({ onLanguageSelect }) {
  const [isOpen, setIsOpen] = useState(true);
  
  useEffect(() => {
    // Check if language is already selected
    const savedLanguage = localStorage.getItem(LANGUAGE_PREF_KEY);
    if (savedLanguage) {
      onLanguageSelect(savedLanguage);
      setIsOpen(false);
    }
  }, [onLanguageSelect]);

  if (!isOpen) return null;

  const handleLanguageSelect = (language) => {
    localStorage.setItem(LANGUAGE_PREF_KEY, language);
    onLanguageSelect(language);
    setIsOpen(false);
  };

  return (
    <div className="language-selector-overlay">
      <div className="language-selector-modal">
        <h2>Choose Your Preferred Language</h2>
        <p>Select the language you'd like to chat in:</p>
        <div className="language-buttons">
          <button onClick={() => handleLanguageSelect(SUPPORTED_LANGUAGES.HINGLISH)}>
            Hinglish
            <small>Hindi + English Mix</small>
          </button>
          <button onClick={() => handleLanguageSelect(SUPPORTED_LANGUAGES.ENGLISH)}>
            English
            <small>Clear, Simple English</small>
          </button>
        </div>
      </div>
    </div>
  );
}
