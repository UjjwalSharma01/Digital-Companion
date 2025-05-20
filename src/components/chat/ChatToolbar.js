'use client';

/**
 * Toolbar component with actions like clearing chat
 * @param {Object} props - Component props
 * @param {Function} props.onClearChat - Function to clear chat history
 */
export default function ChatToolbar({ onClearChat }) {
  return (
    <div className="chat-toolbar">
      <button 
        onClick={onClearChat}
        className="clear-chat-btn"
        title="Clear chat history"
      >
        🗑️ Clear Chat
      </button>
    </div>
  );
}
