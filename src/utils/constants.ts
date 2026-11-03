import { LanguageCode, LanguageMeta, WordItem } from '../types';

export const DEMO_WORDS_ES: WordItem[] = [
  {
    id: 'demo-es-1',
    sv: 'en fotbollsmatch',
    target: 'un partido de fútbol',
    example: '¡Hoy jugamos un partido de fútbol muy divertido!',
    mastered: false,
    createdAt: Date.now() - 500000,
  },
  {
    id: 'demo-es-2',
    sv: 'mål (i sport)',
    target: 'el gol',
    example: '¡Melker marcó un gol fantástico en el último minuto!',
    mastered: false,
    createdAt: Date.now() - 400000,
  },
  {
    id: 'demo-es-3',
    sv: 'skolan',
    target: 'la escuela',
    example: 'Vamos a la escuela juntos en bicicleta por la mañana.',
    mastered: false,
    createdAt: Date.now() - 300000,
  },
  {
    id: 'demo-es-4',
    sv: 'kompisen / vännen',
    target: 'el amigo',
    example: 'Mi mejor amigo y yo jugamos en el recreo.',
    mastered: false,
    createdAt: Date.now() - 200000,
  },
  {
    id: 'demo-es-5',
    sv: 'läxan',
    target: 'los deberes',
    example: 'Melker hace los deberes antes de jugar con los videojuegos.',
    mastered: false,
    createdAt: Date.now() - 100000,
  },
];

export const DEMO_WORDS_EN: WordItem[] = [
  {
    id: 'demo-en-1',
    sv: 'en utmaning',
    target: 'a challenge',
    example: 'Learning ten new words every day is a cool challenge!',
    mastered: false,
    createdAt: Date.now() - 500000,
  },
  {
    id: 'demo-en-2',
    sv: 'fotbollsplan',
    target: 'a football pitch',
    example: 'We meet all our friends at the football pitch after school.',
    mastered: false,
    createdAt: Date.now() - 400000,
  },
  {
    id: 'demo-en-3',
    sv: 'äventyr',
    target: 'an adventure',
    example: 'Our class trip to the science museum was an awesome adventure.',
    mastered: false,
    createdAt: Date.now() - 300000,
  },
  {
    id: 'demo-en-4',
    sv: 'rasten / pausen',
    target: 'the break',
    example: 'Everyone loves playing basketball in the schoolyard during the break.',
    mastered: false,
    createdAt: Date.now() - 200000,
  },
  {
    id: 'demo-en-5',
    sv: 'ansträngning / insats',
    target: 'effort',
    example: 'With great effort, you will master all your English vocabulary!',
    mastered: false,
    createdAt: Date.now() - 100000,
  },
];

export const LANGUAGES: Record<LanguageCode, LanguageMeta> = {
  'es-ES': {
    code: 'es-ES',
    label: 'Spanska',
    flag: '🇪🇸',
    name: 'Spanska',
    targetLangName: 'spanska',
    demoWords: DEMO_WORDS_ES,
    specialChars: ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'],
  },
  'en-GB': {
    code: 'en-GB',
    label: 'Engelska',
    flag: '🇬🇧',
    name: 'Engelska',
    targetLangName: 'engelska',
    demoWords: DEMO_WORDS_EN,
  },
};

export const STORAGE_KEYS = {
  'es-ES': 'melker_words_es',
  'en-GB': 'melker_words_en',
  CURRENT_LANG: 'melker_current_lang',
  STREAK: 'melker_streak',
  CUSTOM_API_KEY: 'melker_gemini_api_key',
  VOICE_RATE: 'melker_voice_rate',
} as const;
