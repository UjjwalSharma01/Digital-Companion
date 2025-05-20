'use client';

import { useRef, useEffect } from 'react';
import { useChat } from '../../lib/hooks/useChat';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import ChatToolbar from './ChatToolbar';
import LanguageSelector from './LanguageSelector';

/**
 * Main chat container component
 */
export default function Chat() {
  const { messages, isTyping, sendMessage, clearChat, setLanguage } = useChat();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container">
      <LanguageSelector onLanguageSelect={setLanguage} />
      <div className="chat-container">
        <ChatHeader />
        <ChatToolbar onClearChat={clearChat} />
        
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <Message
              key={index}
              content={msg.content}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
              emojiReaction={msg.emojiReaction}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <TypingIndicator isVisible={isTyping} />
        
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}
