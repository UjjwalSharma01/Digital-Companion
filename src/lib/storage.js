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

/**
 * Exports chat history to a JSON file
 * @param {string} personaId - ID of the persona whose chat to export
 * @returns {Object} An object containing file data and success status
 */
export function exportChatToJSON(personaId = 'romantic') {
  try {
    const chatData = loadChat(personaId);
    if (!chatData) {
      return { success: false, error: "No chat data available to export" };
    }
    
    // Create a sanitized version of the chat data to export
    const sanitizedData = {
      messages: chatData.messages, // UI messages are safe to export as-is
      history: chatData.history
        .filter(msg => 
          // Only include user and model messages, exclude system prompts
          msg.role === 'user' || msg.role === 'model'
        )
        .map(msg => {
          if (msg.role === 'user' || msg.role === 'model') {
            // Keep the original message for user and model
            return msg;
          }
          return { 
            role: msg.role,
            parts: [{ text: "[Content sanitized for privacy]" }]
          };
        })
    };
    
    // Add metadata to the export
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        personaId,
        version: "1.0"
      },
      chat: sanitizedData
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `chat-export-${personaId}-${timestamp}.json`;
    
    return {
      success: true,
      url,
      filename,
      cleanup: () => URL.revokeObjectURL(url)
    };
  } catch (e) {
    console.error("Error exporting chat:", e);
    return { success: false, error: e.message };
  }
}

/**
 * Imports chat history from a JSON file
 * @param {File} file - JSON file to import
 * @param {string} personaId - ID of the persona to import chat for
 * @returns {Promise<Object>} Promise resolving to success status and imported data
 */
export function importChatFromJSON(file, personaId = 'romantic') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Validate imported data
        if (!importedData.chat || !importedData.chat.messages || !importedData.chat.history) {
          return reject({ success: false, error: "Invalid chat data format" });
        }
        
        const existingChat = loadChat(personaId);
        
        // If we have an existing chat with system prompts, we need to preserve them
        let finalHistoryToSave;
        if (existingChat && existingChat.history && existingChat.history.length > 0) {
          // Find system messages from the existing chat
          const systemMessages = existingChat.history.filter(msg => msg.role === 'system');
          
          // Start with system messages, then add user and model messages from the imported chat
          finalHistoryToSave = [
            ...systemMessages,
            ...importedData.chat.history
          ];
        } else {
          // If no existing chat, we'll need to add default system prompts based on the persona
          // We'll just use the imported history as-is and rely on the initChat function to handle this
          finalHistoryToSave = importedData.chat.history;
        }
        
        // Save imported chat to localStorage
        saveChat(importedData.chat.messages, finalHistoryToSave, personaId);
        
        resolve({
          success: true,
          data: importedData,
          personaId: importedData.metadata?.personaId || personaId
        });
      } catch (e) {
        console.error("Error parsing imported chat:", e);
        reject({ success: false, error: e.message });
      }
    };
    
    reader.onerror = () => {
      reject({ success: false, error: "Error reading file" });
    };
    
    reader.readAsText(file);
  });
}
