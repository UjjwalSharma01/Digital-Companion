'use client';

import { useChat } from '@/lib/hooks/useChat';
import ThemeToggle from '@/components/ui/ThemeToggle';
import BurgerMenu from '@/components/ui/BurgerMenu';
import { useState, useEffect } from 'react';

/**
 * Toolbar component with actions like clearing chat and switching personas
 * @param {Object} props - Component props
 * @param {Function} props.onClearChat - Function to clear chat history
 */
export default function ChatToolbar({ onClearChat }) {
  const { currentPersona, switchPersona, personas, exportChat, importChat } = useChat();
  const [isImporting, setIsImporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if window width is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleExport = () => {
    // Show privacy message when exporting
    if (confirm('Your export will include visible messages only. System prompts and internal data will be removed for privacy. Continue?')) {
      const result = exportChat();
      if (!result.success) {
        alert('Export failed: ' + (result.error || 'No chat data to export'));
      }
    }
  };

  const handleImport = (file) => {
    setIsImporting(true);
    
    importChat(file)
      .then(result => {
        if (!result.success) {
          alert('Import failed: ' + (result.error || 'Invalid file format'));
        }
      })
      .finally(() => {
        setIsImporting(false);
      });
  };

  return (
    <div className="chat-toolbar">
      <div className="persona-switcher">
        <select 
          value={currentPersona} 
          onChange={(e) => switchPersona(e.target.value)}
          className="persona-select"
          title="Switch persona"
        >
          {personas.map(persona => (
            <option key={persona.id} value={persona.id}>
              {persona.name} - {persona.description}
            </option>
          ))}
        </select>
      </div>
      <div className="toolbar-actions">
        <ThemeToggle />
        
        {/* Show burger menu on mobile, buttons on desktop */}
        {isMobile ? (
          <BurgerMenu
            onExport={handleExport}
            onImport={handleImport}
            onClear={onClearChat}
            isImporting={isImporting}
          />
        ) : (
          <div className="chat-actions-group desktop-actions">
            <button 
              onClick={handleExport}
              className="chat-action-btn export-btn"
              title="Export visible chat messages to JSON file (system prompts excluded)"
            >
              📤 Export
            </button>
            <button 
              className="chat-action-btn import-btn"
              title="Import chat from JSON file"
              onClick={() => document.getElementById('file-input').click()}
            >
              📥 Import
              <input
                id="file-input"
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleImport(file);
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
            </button>
            <button 
              onClick={onClearChat}
              className="clear-chat-btn"
              title="Clear chat history"
              disabled={isImporting}
            >
              🗑️ Clear Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
