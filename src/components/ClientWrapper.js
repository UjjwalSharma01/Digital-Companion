'use client';

import Chat from './chat/Chat';
import { ChatProvider } from '@/contexts/ChatContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ChatWrapper() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <Chat />
      </ChatProvider>
    </ThemeProvider>
  );
}
