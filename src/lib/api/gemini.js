// API service for Gemini AI
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MAX_HISTORY = 20;

/**
 * Primary Gemini API call with enhanced context handling
 * @param {Array} conversationHistory - Chat history for context
 * @returns {Promise<string>} AI response text
 */
export async function getGeminiResponse(conversationHistory) {
  try {
    // Format the conversation history for Gemini's expected structure
    const formattedHistory = conversationHistory.slice(-MAX_HISTORY).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts[0].text }]
    }));

    // First, try with Gemini 1.5 Flash for better context handling
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedHistory,
          generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Gemini API HTTP Error:", response.status);
      return await getGeminiProResponse(conversationHistory);
    }

    const responseData = await response.json();
    
    // Check for errors in the response
    if (responseData.error) {
      console.error("Gemini API Error:", responseData.error);
      // Fall back to Gemini Pro if needed
      return await getGeminiProResponse(conversationHistory);
    }

    // Check if we have a valid response with candidates
    if (!responseData.candidates || responseData.candidates.length === 0) {
      console.error("Gemini API: No valid response candidates");
      return await getGeminiProResponse(conversationHistory);
    }
    
    const responseText = responseData.candidates[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error("Gemini API: No text in response");
      return await getGeminiProResponse(conversationHistory);
    }

    return responseText;
  } catch (error) {
    console.error("API Error:", error);
    // Try fallback to Gemini Pro
    return await getGeminiProResponse(conversationHistory);
  }
}

/**
 * Fallback to Gemini Pro if the newer model isn't available
 * @param {Array} conversationHistory - Chat history for context
 * @returns {Promise<string>} AI response text
 */
export async function getGeminiProResponse(conversationHistory) {
  try {
    // Format the conversation history for Gemini's expected structure
    const formattedHistory = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts[0].text }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedHistory,
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            maxOutputTokens: 800
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Gemini Pro API HTTP Error:", response.status);
      return "Connection issue. Thoda wait karein?";
    }

    const responseData = await response.json();
    
    // Check for errors in the response
    if (responseData.error) {
      console.error("Gemini Pro API Error:", responseData.error);
      return "Connection issue. Thoda wait karein?";
    }
    
    // Check if we have a valid response
    const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error("Gemini Pro API: No valid response text");
      return "Connection issue. Thoda wait karein?";
    }

    return responseText;
  } catch (error) {
    console.error("Fallback API Error:", error);
    return "Oops! Technical issue. Thodi der baad try karte hain?";
  }
}
