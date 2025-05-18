/**
 * Personas module - Centralizes all AI personas for the Digital Companion
 * 
 * This file imports all individual persona definitions and exports:
 * - A combined personas object with all personas
 * - Helper functions for managing personas
 * - Default export of the personas object
 */

// Import individual persona definitions
import defaultPersona from './definitions/default';
import romanticPersona from './definitions/romantic';
import professionalPersona from './definitions/professional';
import creativePersona from './definitions/creative';
import motivationalPersona from './definitions/motivational';
import wellnessPersona from './definitions/wellness';

// Combine all personas into a single object for easy access
const personas = {
  default: defaultPersona,
  romantic: romanticPersona,
  professional: professionalPersona,
  creative: creativePersona,
  motivational: motivationalPersona,
  wellness: wellnessPersona
};

/**
 * Get the system prompt for a specific persona
 * @param {string} personaId - The ID of the persona
 * @returns {string} The system prompt for the specified persona
 */
export const getPersonaPrompt = (personaId) => {
  const persona = personas[personaId];
  return persona ? persona.systemPrompt : personas.default.systemPrompt;
};

/**
 * Get all available personas for display purposes
 * @returns {Array} Array of persona objects with id, name, emoji, and description
 */
export const getAvailablePersonas = () => {
  return Object.values(personas).map(persona => ({
    id: persona.id,
    name: persona.name,
    emoji: persona.emoji,
    description: persona.description
  }));
};

export default personas;
