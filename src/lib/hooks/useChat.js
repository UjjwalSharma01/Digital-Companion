'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGeminiResponse } from '../api/gemini';
import { saveChat, loadChat, clearChat as clearLocalStorage } from '../storage';
// Import from the new persona file
import { SYSTEM_PROMPT, DEFAULT_GREETING, MESSAGE_DELAY_RANGE, PERSONA_DETAILS } from '../personas/romantic';

/**
 * Custom hook for chat functionality
 * @returns {Object} Chat related state and functions
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  // Include persona details in conversation history for context
  const [conversationHistory, setConversationHistory] = useState([
    { role: "system", parts: [{ text: JSON.stringify(PERSONA_DETAILS) }] } 
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');

  // Initialize conversation on component mount
  useEffect(() => {
    initializeChat();
  }, []);

  // Initialize chat with system prompt or load from storage
  const initializeChat = useCallback(() => {
    const initialSystemMessage = { role: "system", parts: [{ text: JSON.stringify(PERSONA_DETAILS) }] };
    const initialUserPrompt = { role: "user", parts: [{ text: SYSTEM_PROMPT }] };
    
    let initialGreetingMessages = [];
    if (Array.isArray(DEFAULT_GREETING)) {
      initialGreetingMessages = DEFAULT_GREETING.map(greet => ({
        role: "model",
        parts: [{ text: greet }]
      }));
    } else {
      initialGreetingMessages = [{ role: "model", parts: [{ text: DEFAULT_GREETING }] }];
    }

    const initialConversationHistory = [
      initialSystemMessage,
      initialUserPrompt,
      ...initialGreetingMessages
    ];

    // Try to load from localStorage
    const savedChat = loadChat();
    
    if (savedChat && savedChat.history && savedChat.history.length > 0) {
      setMessages(savedChat.messages);
      // Ensure persona details are always at the start of loaded history
      if (savedChat.history[0]?.role !== 'system') {
        setConversationHistory([initialSystemMessage, ...savedChat.history]);
      } else {
        setConversationHistory(savedChat.history);
      }
    } else {
      // Start fresh chat
      const greetingUiMessages = initialGreetingMessages.map(greetMsg => ({
        content: greetMsg.parts[0].text,
        isUser: false,
        timestamp: getCurrentTime()
      }));
      setMessages(greetingUiMessages);
      setConversationHistory(initialConversationHistory);
    }
  }, []);

  // Get current time for message timestamp
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

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
      // Save to localStorage - ensure conversationHistory is up-to-date here
      // This might need adjustment based on when conversationHistory is set after AI response
      saveChat(updatedMessages, conversationHistory); 
      return updatedMessages;
    });
  }, [conversationHistory, getCurrentTime]); // Added conversationHistory dependency

  // Get random emoji for AI response reactions
  const getRandomEmoji = useCallback(() => {
    const emojis = ['❤️', '😊', '😍', '🥰', '💕', '💖', '😘', '💓', '💗', '💞'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }, []);

  // Send message to AI and get response
  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    // Clear input field and add user message
    setInput('');
    addMessage(message, true);
    
    const userMessageForHistory = { role: "user", parts: [{ text: message }] };
    // Immediately update conversation history with user's message
    const currentHistory = [...conversationHistory, userMessageForHistory];
    setConversationHistory(currentHistory);
    
    setIsTyping(true);
    
    try {
      // Add a natural-feeling delay before AI "starts typing"
      await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY_RANGE.minimum / 2));
      
      const responsePromise = getGeminiResponse(currentHistory); // Pass currentHistory
      
      // Simulate thinking time and API call
      const thinkingTime = MESSAGE_DELAY_RANGE.minimum + Math.random() * (MESSAGE_DELAY_RANGE.maximum - MESSAGE_DELAY_RANGE.minimum);
      const [rawResponse] = await Promise.all([
        responsePromise,
        new Promise(resolve => setTimeout(resolve, thinkingTime))
      ]);

      setIsTyping(false); // AI has "finished typing" the whole thought

      // Split response into multiple messages if it contains newlines
      const responseParts = rawResponse.split('\\n').filter(part => part.trim() !== '');
      
      let aiResponseHistory = [...currentHistory]; // Start with history up to user's message

      for (let i = 0; i < responseParts.length; i++) {
        const part = responseParts[i];
        addMessage(part, false, { isMultiPart: true }); // Add to UI
        
        // Add AI part to history
        aiResponseHistory = [...aiResponseHistory, { role: "model", parts: [{ text: part }] }];
        setConversationHistory(aiResponseHistory); // Update history after each part

        if (i < responseParts.length - 1) {
          // Natural delay between sending parts of a multi-part message
          const partDelay = MESSAGE_DELAY_RANGE.minimum + Math.random() * (MESSAGE_DELAY_RANGE.maximum - MESSAGE_DELAY_RANGE.minimum);
          setIsTyping(true); // Indicate AI is "typing" the next part
          await new Promise(resolve => setTimeout(resolve, partDelay));
          setIsTyping(false);
        }
      }
      
      // Final save after all parts are processed
      // Need to get the latest messages state here
      setMessages(prevUiMessages => {
        saveChat(prevUiMessages, aiResponseHistory);
        return prevUiMessages; 
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage("Oops! Kuch technical problem hai. Thoda wait karein...", false);
      setIsTyping(false);
    }
  }, [addMessage, conversationHistory, getCurrentTime]); // Removed messages from dependencies, added conversationHistory

  // Clear chat - both from state and localStorage
  const clearChat = useCallback(() => {
    setMessages([]);
    clearLocalStorage();
    initializeChat();
  }, [initializeChat]);

  return {
    messages,
    isTyping,
    input,
    setInput,
    sendMessage,
    clearChat
  };
}
