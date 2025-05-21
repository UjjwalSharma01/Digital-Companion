'use client';

import { useTheme, THEMES } from '@/contexts/ThemeContext';

/**
 * Toggle button for switching between light and dark mode
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === THEMES.DARK;
  
  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
