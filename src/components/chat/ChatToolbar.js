'use client';

import { useChat } from '@/lib/hooks/useChat';
import ThemeToggle from '@/components/ui/ThemeToggle';

/**
 * Toolbar component with actions like clearing chat and switching personas
 * @param {Object} props - Component props
 * @param {Function} props.onClearChat - Function to clear chat history
 */
export default function ChatToolbar({ onClearChat }) {
  const { currentPersona, switchPersona, personas } = useChat();

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
        <button 
          onClick={onClearChat}
          className="clear-chat-btn"
          title="Clear chat history"
        >
          🗑️ Clear Chat
        </button>
      </div>
    </div>
  );
}
