'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGeminiResponse } from '../api/gemini';
import { saveChat, loadChat, clearChat as clearLocalStorage } from '../storage';
import { personas, defaultPersona } from '../personas';
import { LAST_PERSONA_KEY, SUPPORTED_LANGUAGES } from '../constants/chat';

/**
 * Custom hook for chat functionality
 * @returns {Object} Chat related state and functions
 */
export function useChat() {
  // Helper functions
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);
  
  const getRandomEmoji = useCallback(() => {
    const emojis = ['❤️', '😊', '😍', '🥰', '💕', '💖', '😘', '💓', '💗', '💞'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }, []);
  
  // Initialize state
  const [currentPersona, setCurrentPersona] = useState(defaultPersona);
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES.HINGLISH);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  
  const persona = personas[currentPersona];
  
  // Add a message to chat
  const addMessage = useCallback((content, isUser, options = {}) => {
    const newMessage = {
      content,
      isUser,
      timestamp: options.timestamp || getCurrentTime(),
      emojiReaction: (!isUser && Math.random() > 0.7 && !options.isMultiPart) ? getRandomEmoji() : null
    };

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      saveChat(updatedMessages, conversationHistory, currentPersona);
      return updatedMessages;
    });
  }, [conversationHistory, getCurrentTime, getRandomEmoji, currentPersona]);

  // Initialize or restore chat
  const initializeChat = useCallback(() => {
    const savedChat = loadChat(currentPersona);
    
    if (savedChat?.history?.length > 0) {
      setMessages(savedChat.messages);
      // Always ensure correct persona details at start of history
      const initialSystemMessage = { role: "system", parts: [{ text: JSON.stringify({...persona.PERSONA_DETAILS, language}) }] };
      setConversationHistory([initialSystemMessage, ...savedChat.history.slice(1)]);
    } else {
      // Start fresh chat with current persona
      const initialSystemMessage = { role: "system", parts: [{ text: JSON.stringify({...persona.PERSONA_DETAILS, language}) }] };
      const initialUserPrompt = { role: "user", parts: [{ text: persona.SYSTEM_PROMPTS[language] }] };
      
      let initialGreetingMessages = [];
      const greetings = persona.DEFAULT_GREETINGS[language];
      if (Array.isArray(greetings)) {
        initialGreetingMessages = greetings.map(greet => ({
          role: "model",
          parts: [{ text: greet }]
        }));
      } else {
        initialGreetingMessages = [{ role: "model", parts: [{ text: persona.DEFAULT_GREETING }] }];
      }

      const initialConversationHistory = [
        initialSystemMessage,
        initialUserPrompt,
        ...initialGreetingMessages
      ];

      // Set up initial UI messages
      const greetingUiMessages = initialGreetingMessages.map(greetMsg => ({
        content: greetMsg.parts[0].text,
        isUser: false,
        timestamp: getCurrentTime()
      }));
      setMessages(greetingUiMessages);
      setConversationHistory(initialConversationHistory);
    }
  }, [currentPersona, persona, getCurrentTime, language]);

  // Initialize chat when persona changes
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Load saved persona after mount
  useEffect(() => {
    const savedPersona = localStorage.getItem(LAST_PERSONA_KEY);
    if (savedPersona && personas[savedPersona]) {
      setCurrentPersona(savedPersona);
    }
  }, []);

  // Send message to AI and get response
  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    setInput('');
    addMessage(message, true);
    
    const userMessageForHistory = { role: "user", parts: [{ text: message }] };
    const currentHistory = [...conversationHistory, userMessageForHistory];
    setConversationHistory(currentHistory);
    
    setIsTyping(true);
    
    try {
      const limitedHistory = currentHistory.slice(-200);
      await new Promise(resolve => setTimeout(resolve, persona.MESSAGE_DELAY_RANGE.minimum / 2));
      
      const responsePromise = getGeminiResponse(limitedHistory);
      const thinkingTime = persona.MESSAGE_DELAY_RANGE.minimum + 
        Math.random() * (persona.MESSAGE_DELAY_RANGE.maximum - persona.MESSAGE_DELAY_RANGE.minimum);
      
      const [rawResponse] = await Promise.all([
        responsePromise,
        new Promise(resolve => setTimeout(resolve, thinkingTime))
      ]);

      setIsTyping(false);

      const responseParts = rawResponse.split('\\n').filter(part => part.trim() !== '');
      let aiResponseHistory = [...currentHistory];

      for (let i = 0; i < responseParts.length; i++) {
        const part = responseParts[i];
        addMessage(part, false, { isMultiPart: true });
        
        aiResponseHistory = [...aiResponseHistory, { role: "model", parts: [{ text: part }] }];
        setConversationHistory(aiResponseHistory);

        if (i < responseParts.length - 1) {
          const partDelay = persona.MESSAGE_DELAY_RANGE.minimum + 
            Math.random() * (persona.MESSAGE_DELAY_RANGE.maximum - persona.MESSAGE_DELAY_RANGE.minimum);
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, partDelay));
          setIsTyping(false);
        }
      }
      
      setMessages(prevUiMessages => {
        saveChat(prevUiMessages, aiResponseHistory, currentPersona);
        return prevUiMessages;
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage("Oops! Kuch technical problem hai. Thoda wait karein...", false);
      setIsTyping(false);
    }
  }, [addMessage, conversationHistory, persona, setInput, currentPersona]);

  // Switch persona
  const switchPersona = useCallback((personaId) => {
    if (personas[personaId] && personaId !== currentPersona) {
      localStorage.setItem(LAST_PERSONA_KEY, personaId);
      setMessages([]);
      setConversationHistory([]);
      setCurrentPersona(personaId);
    }
  }, [currentPersona]);

  // Clear chat
  const clearChat = useCallback(() => {
    clearLocalStorage(currentPersona);
    initializeChat();
  }, [currentPersona, initializeChat]);

  return {
    messages,
    isTyping,
    input,
    setInput,
    sendMessage,
    clearChat,
    currentPersona,
    switchPersona,
    setLanguage,
    personas: Object.values(personas)
  };
}
