// Local storage utilities for chat persistence
import { CHAT_STORAGE_KEY, TIMESTAMP_STORAGE_KEY, CHAT_EXPIRY_TIME } from './constants/chat';

/**
 * Saves chat history and messages to localStorage
 * @param {Array} messages - UI messages to display
 * @param {Array} conversationHistory - Complete conversation history for AI context
 */
export function saveChat(messages, conversationHistory, personaId = 'romantic') {
  try {
    localStorage.setItem(
      `${CHAT_STORAGE_KEY}_${personaId}`, 
      JSON.stringify({
        messages,
        history: conversationHistory
      })
    );
    localStorage.setItem(`${TIMESTAMP_STORAGE_KEY}_${personaId}`, String(new Date().getTime()));
  } catch (e) {
    console.error("Error saving chat:", e);
  }
}

/**
 * Loads chat history from localStorage if available and not expired
 * @returns {Object|null} The saved chat data or null if not available
 */
export function loadChat(personaId = 'romantic') {
  try {
    const savedChat = localStorage.getItem(`${CHAT_STORAGE_KEY}_${personaId}`);
    if (!savedChat) return null;
    
    // Check if chat is expired (older than CHAT_EXPIRY_TIME)
    const lastTimestamp = localStorage.getItem(`${TIMESTAMP_STORAGE_KEY}_${personaId}`);
    if (!lastTimestamp) return null;
    
    const now = new Date().getTime();
    if (now - parseInt(lastTimestamp) > CHAT_EXPIRY_TIME) return null;
    
    return JSON.parse(savedChat);
  } catch (e) {
    console.error("Error restoring chat:", e);
    return null;
  }
}

/**
 * Clear all chat data from localStorage
 */
export function clearChat(personaId = 'romantic') {
  localStorage.removeItem(`${CHAT_STORAGE_KEY}_${personaId}`);
  localStorage.removeItem(`${TIMESTAMP_STORAGE_KEY}_${personaId}`);
}
