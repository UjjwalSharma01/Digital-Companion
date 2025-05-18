'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import ModelSelector from '@/components/chat/ModelSelector';
import PersonaSelector from '@/components/chat/PersonaSelector';
import { getAvailablePersonas } from '@/personas';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [selectedPersona, setSelectedPersona] = useState('wellness');
  const [isLoading, setIsLoading] = useState(true);

  // This will be replaced with Firebase fetching logic
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Temporary mock data - add more conversations for a realistic feel
        const mockConversations = [
          { 
            id: 'conv1', 
            title: 'Wellness Journey Planning', 
            createdAt: new Date() 
          },
          { 
            id: 'conv2', 
            title: 'Creative Writing Help', 
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) 
          },
          { 
            id: 'conv3', 
            title: 'Career Advice Discussion', 
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) 
          },
          { 
            id: 'conv4', 
            title: 'Relationship Tips', 
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) 
          }
        ];
        
        setConversations(mockConversations);
        setActiveConversation('conv1');
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        {/* Chat Sidebar - drawer on mobile, fixed on desktop */}
        <ChatSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
        />
        
        {/* Main Chat Area - positioned using absolute width calculations for desktop */}
        <div className="flex flex-col h-full w-full lg:w-[calc(100%-16rem)] lg:absolute lg:right-0">
          {/* Settings Bar */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-white shadow-sm space-x-3 z-10 lg:pl-6 lg:pr-6 mt-14 lg:mt-0">
            <ModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
            <PersonaSelector
              selectedPersona={selectedPersona}
              setSelectedPersona={setSelectedPersona}
            />
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-grow items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-indigo-600 border-gray-200 animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading conversation...</p>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <ChatInterface
              conversationId={activeConversation}
              modelId={selectedModel}
              personaId={selectedPersona}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
