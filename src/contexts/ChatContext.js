'use client';

import { createContext, useContext } from 'react';
import { useChat } from '../lib/hooks/useChat';

// Create chat context
const ChatContext = createContext(null);

/**
 * Provider component that wraps chat functionality
 */
export function ChatProvider({ children }) {
  const chatState = useChat();
  
  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Hook to use chat context
 */
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
