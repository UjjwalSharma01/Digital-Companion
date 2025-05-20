import * as romantic from './romantic';
import * as mentalHealth from './mentalHealth';
import * as teacher from './teacher';

export const personas = {
  romantic: {
    id: 'romantic',
    name: 'Isha',
    description: 'Your caring and emotionally connected digital companion',
    SYSTEM_PROMPTS: romantic.SYSTEM_PROMPTS,
    DEFAULT_GREETINGS: romantic.DEFAULT_GREETINGS,
    PERSONA_DETAILS: romantic.PERSONA_DETAILS,
    MESSAGE_DELAY_RANGE: romantic.MESSAGE_DELAY_RANGE,
    MESSAGE_PATTERNS: romantic.MESSAGE_PATTERNS,
    EMOTIONAL_STATES: romantic.EMOTIONAL_STATES,
    OPINION_FRAMEWORK: romantic.OPINION_FRAMEWORK,
    MEMORY_FRAMEWORK: romantic.MEMORY_FRAMEWORK,
    CONVERSATION_DYNAMICS: romantic.CONVERSATION_DYNAMICS
  },
  mentalHealth: {
    id: 'mentalHealth',
    name: 'Dr. Sameer',
    description: 'Your supportive mental health companion',
    SYSTEM_PROMPTS: mentalHealth.SYSTEM_PROMPTS,
    DEFAULT_GREETINGS: mentalHealth.DEFAULT_GREETINGS,
    PERSONA_DETAILS: mentalHealth.PERSONA_DETAILS,
    MESSAGE_DELAY_RANGE: mentalHealth.MESSAGE_DELAY_RANGE
  },
  teacher: {
    id: 'teacher',
    name: 'Ms. Priya',
    description: 'Your personal programming and CS teacher',
    SYSTEM_PROMPTS: teacher.SYSTEM_PROMPTS,
    DEFAULT_GREETINGS: teacher.DEFAULT_GREETINGS,
    PERSONA_DETAILS: teacher.PERSONA_DETAILS,
    MESSAGE_DELAY_RANGE: teacher.MESSAGE_DELAY_RANGE
  }
};

export const defaultPersona = 'romantic';
