'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { getPersonaPrompt } from '@/personas';

export default function ChatInterface({ conversationId, modelId, personaId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Load initial messages from Firebase when conversation changes
  useEffect(() => {
    const loadConversationMessages = async () => {
      if (!conversationId) return;
      
      try {
        // Reset messages when switching conversations
        setMessages([]);
        setIsTyping(true);
        
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
          // In development, use mock data
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock initial message based on persona
          const initialMessages = [{
            id: 'system-1',
            content: `Hello! I'm your ${personaId === 'wellness' ? 'wellness advisor' : 'digital companion'}. How can I help you today?`,
            sender: 'ai',
            role: 'assistant',
            timestamp: new Date(),
            personaId: personaId
          }];
          
          setMessages(initialMessages);
        } else {
          // In production, load from Firebase
          try {
            // Import here to avoid SSR issues
            const { getConversationMessages } = await import('@/lib/firebase/conversation-service');
            const messagesData = await getConversationMessages(conversationId);
            
            if (messagesData && messagesData.length > 0) {
              setMessages(messagesData);
            } else {
              // If no messages exist, create a welcome message
              const initialMessage = {
                id: 'system-1',
                content: `Hello! I'm your ${personaId === 'wellness' ? 'wellness advisor' : 'digital companion'}. How can I help you today?`,
                sender: 'ai',
                role: 'assistant',
                timestamp: new Date(),
                personaId: personaId
              };
              setMessages([initialMessage]);
              
              // Save this initial message to Firebase
              try {
                const { addMessage } = await import('@/lib/firebase/conversation-service');
                await addMessage(conversationId, {
                  content: initialMessage.content,
                  sender: 'ai',
                  role: 'assistant',
                  personaId: personaId
                });
              } catch (err) {
                console.error('Failed to add initial message:', err);
              }
            }
          } catch (error) {
            console.error('Error loading conversation messages:', error);
            
            // Fallback to mock initial message
            const initialMessage = {
              id: 'system-1',
              content: "Hello! I'm your digital companion. How can I help you today?",
              sender: 'ai',
              role: 'assistant',
              timestamp: new Date(),
              personaId: personaId
            };
            setMessages([initialMessage]);
          }
        }
        
        setIsTyping(false);
        
        // Focus input field when conversation changes
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } catch (error) {
        console.error('Error in loadConversationMessages:', error);
        setIsTyping(false);
      }
    };
    
    loadConversationMessages();
  }, [conversationId, personaId]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSubmitting) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      role: 'user',
      timestamp: new Date()
    };
    
    setIsSubmitting(true);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Get persona-specific prompt
    const systemPrompt = getPersonaPrompt(personaId);
    
    try {
      // Prepare messages for the AI service
      const messageHistory = messages.map(msg => ({
        role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({
        role: 'user',
        content: userMessage.content
      });
      
      let aiResponse;
      
      // In development or if API keys aren't configured, use mock responses
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock response based on selected model and persona
        let mockResponse = "I'm not sure how to respond to that.";
        if (modelId === 'gemini') {
          if (personaId === 'romantic') {
            mockResponse = `That's such a thoughtful message! I really enjoy talking with you about these things. How are you feeling today? 💕`;
          } else if (personaId === 'professional') {
            mockResponse = "That's a great point. From a professional standpoint, I'd suggest considering the following factors...";
          } else if (personaId === 'wellness') {
            mockResponse = "I appreciate you sharing that. Taking care of your wellbeing is so important. Would you like to explore some mindfulness practices that might help?";
          } else if (personaId === 'creative') {
            mockResponse = "What an interesting idea! Let's explore this creative direction together. Have you considered trying...";
          } else if (personaId === 'motivational') {
            mockResponse = "You've got this! Every step you take is progress. What's one small action you could take today to move toward your goal?";
          }
        } else if (modelId === 'gpt') {
          mockResponse = "According to my knowledge, I'd recommend looking into this further. What else would you like to know?";
        } else if (modelId === 'claude') {
          mockResponse = "That's an interesting question. Let me think about this carefully...";
        } else if (modelId === 'llama') {
          mockResponse = "Based on the information available, here's what I can tell you...";
        }
        
        aiResponse = mockResponse;
      } else {
        // In production, attempt to use the AI service
        try {
          // Import here to avoid SSR issues
          const { sendMessageToAI } = await import('@/lib/models/ai-service');
          aiResponse = await sendMessageToAI(modelId, messageHistory, systemPrompt);
        } catch (apiError) {
          console.error('API service error:', apiError);
          // Fall back to mock response if API fails
          aiResponse = `I'm having trouble connecting to my knowledge services right now. Can we try again in a moment?`;
        }
      }
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        sender: 'ai',
        role: 'assistant',
        timestamp: new Date(),
        personaId: personaId
      };
      
      // Add AI message to UI state
      setMessages(prev => [...prev, aiMessage]);
      
      // In a production environment, save both messages to Firebase
      if (process.env.NODE_ENV !== 'development') {
        try {
          const { addMessage } = await import('@/lib/firebase/conversation-service');
          
          // Save user message
          await addMessage(conversationId, {
            content: userMessage.content,
            sender: 'user',
            role: 'user'
          });
          
          // Save AI response
          await addMessage(conversationId, {
            content: aiMessage.content,
            sender: 'ai',
            role: 'assistant',
            personaId: personaId
          });
        } catch (dbError) {
          console.error('Error saving messages to Firebase:', dbError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error. Please try again.",
        sender: 'system',
        role: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsSubmitting(false);
      
      // Focus on input field after message is sent
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Welcome message when no messages */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Digital Companion</h2>
          <p className="text-gray-500 max-w-md text-center">
            Choose a persona and start chatting with your AI companion. How can I assist you today?
          </p>
        </div>
      )}
      
      {/* Messages Area - fixed with absolute height constraints */}
      <div 
        className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" 
        ref={messagesContainerRef}
        style={{ 
          height: "calc(100vh - 150px)",
          maxHeight: "calc(100vh - 150px)"
        }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="py-3"></div> {/* Top spacing */}
          
          {messages.map((message, index) => {
            // Check if this is the first message from a sender or if previous message was from a different sender
            const isFirstInSequence = index === 0 || messages[index - 1].sender !== message.sender;
            // Check if this is the last message from this sender
            const isLastInSequence = index === messages.length - 1 || messages[index + 1].sender !== message.sender;
            
            return (
              <div 
                key={message.id}
                className={`mb-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                } ${isLastInSequence ? 'mb-4' : 'mb-1'}`}
              >
                {/* Message bubble */}
                <div 
                  className={`inline-block max-w-[85%] sm:max-w-md px-4 py-2.5 ${
                    message.sender === 'user' 
                      ? `bg-indigo-600 text-white 
                         ${isFirstInSequence ? 'rounded-t-2xl' : 'rounded-t-md'} 
                         ${isLastInSequence ? 'rounded-bl-2xl rounded-br-md' : 'rounded-bl-md rounded-br-md'}`
                      : message.sender === 'ai'
                        ? `bg-white shadow-sm border border-gray-100 text-gray-800
                           ${isFirstInSequence ? 'rounded-t-2xl' : 'rounded-t-md'} 
                           ${isLastInSequence ? 'rounded-br-2xl rounded-bl-md' : 'rounded-br-md rounded-bl-md'}`
                        : 'bg-gray-100 text-gray-700 rounded-xl'
                  }`}
                >
                  {/* Message content */}
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>
                
                {/* Show timestamp only for the last message in a sequence */}
                {isLastInSequence && (
                  <div className="text-xs text-gray-400 my-1 mx-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="mb-4 text-left">
              <div className="inline-block bg-white shadow-sm border border-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1.5 items-center">
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDuration: '1.2s', animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDuration: '1.2s', animationDelay: '200ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDuration: '1.2s', animationDelay: '400ms' }}></div>
                </div>
              </div>
              <div className="text-xs text-gray-400 my-1 mx-2">
                Typing...
              </div>
            </div>
          )}
          
          <div className="py-2" ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area - fixed height with proper text visibility */}
      <div className="p-3 md:p-4 border-t border-gray-200 bg-white shadow-sm" style={{ height: '90px', flexShrink: 0 }}>
        <div className="max-w-3xl mx-auto h-full">
          <form 
            className="flex items-end gap-2 h-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="flex-grow relative h-full">
              <textarea
                ref={inputRef}
                placeholder="Type your message..."
                className="w-full h-full border border-gray-300 rounded-xl px-4 py-3 pr-11 resize-none bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                style={{ 
                  minHeight: '48px', 
                  maxHeight: '60px',
                  overflow: 'auto'
                }}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
              />
              {inputMessage.trim().length > 0 && (
                <button
                  type="submit"
                  disabled={isTyping || isSubmitting}
                  className="absolute right-2 bottom-2 text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-40"
                  aria-label="Send message"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
            {!inputMessage.trim().length > 0 && (
              <button
                type="submit"
                disabled={isTyping || isSubmitting || !inputMessage.trim()}
                className={`shrink-0 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors
                  ${(isTyping || isSubmitting || !inputMessage.trim()) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </form>
          
          {/* Character hint */}
          <div className="text-xs text-gray-400 mt-1 text-center">
            Press Shift+Enter for a new line
          </div>
        </div>
      </div>
    </div>
  );
}
