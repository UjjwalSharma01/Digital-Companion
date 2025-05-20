'use client';

import { useState } from 'react';

/**
 * Chat input component with message sending functionality
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Function to handle sending messages
 */
export default function ChatInput({ onSendMessage }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input">
      <input
        type="text"
        id="user-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Apna message yahan likhen..."
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        data-form-type="other"
      />
      <button 
        type="submit" 
        id="send-button"
        disabled={!inputValue.trim()}
      >
        ➤
      </button>
    </form>
  );
}
