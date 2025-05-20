'use client';

import { useChat } from '@/lib/hooks/useChat';
import { useState, useEffect } from 'react';

/**
 * Chat header with title and status
 */
export default function ChatHeader() {
  const { currentPersona, personas } = useChat();
  const [title, setTitle] = useState("Digital Companion 💬");

  useEffect(() => {
    const currentPersonaDetails = personas.find(p => p.id === currentPersona);
    setTitle(currentPersonaDetails ? `Chat with ${currentPersonaDetails.name} 💬` : "Digital Companion 💬");
  }, [currentPersona, personas]);

  return (
    <div className="chat-header">
      <h2>{title}</h2>
      <div className="status">Online</div>
    </div>
  );
}
