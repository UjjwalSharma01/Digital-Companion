import * as romantic from './romantic';
import * as mentalHealth from './mentalHealth';

export const personas = {
  romantic: {
    id: 'romantic',
    name: 'Isha',
    description: 'Your caring and emotionally connected digital companion',
    SYSTEM_PROMPTS: romantic.SYSTEM_PROMPTS,
    DEFAULT_GREETINGS: romantic.DEFAULT_GREETINGS,
    PERSONA_DETAILS: romantic.PERSONA_DETAILS,
    MESSAGE_DELAY_RANGE: romantic.MESSAGE_DELAY_RANGE
  },
  mentalHealth: {
    id: 'mentalHealth',
    name: 'Dr. Sameer',
    description: 'Your supportive mental health companion',
    SYSTEM_PROMPTS: mentalHealth.SYSTEM_PROMPTS,
    DEFAULT_GREETINGS: mentalHealth.DEFAULT_GREETINGS,
    PERSONA_DETAILS: mentalHealth.PERSONA_DETAILS,
    MESSAGE_DELAY_RANGE: mentalHealth.MESSAGE_DELAY_RANGE
  }
};

export const defaultPersona = 'romantic';
