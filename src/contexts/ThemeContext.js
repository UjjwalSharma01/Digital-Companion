'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Theme constants
export const THEME_KEY = 'digital-companion-theme';
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Create theme context
const ThemeContext = createContext(null);

/**
 * Provider component that manages theme state
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.LIGHT);
  
  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === THEMES.DARK || savedTheme === THEMES.LIGHT) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference if no saved preference
      setTheme(THEMES.DARK);
    }
  }, []);
  
  // Update theme and save preference
  const toggleTheme = () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Apply theme class to html element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (theme === THEMES.DARK) {
      htmlElement.classList.add('dark-theme');
    } else {
      htmlElement.classList.remove('dark-theme');
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
