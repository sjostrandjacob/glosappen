import { LanguageCode, WordItem } from '../types';
import { DEMO_WORDS_EN, DEMO_WORDS_ES, STORAGE_KEYS } from './constants';

export function getStoredWords(lang: LanguageCode): WordItem[] {
  const key = STORAGE_KEYS[lang];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const demo = lang === 'es-ES' ? DEMO_WORDS_ES : DEMO_WORDS_EN;
      saveStoredWords(lang, demo);
      return demo;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array was explicitly set or invalid
    const demo = lang === 'es-ES' ? DEMO_WORDS_ES : DEMO_WORDS_EN;
    saveStoredWords(lang, demo);
    return demo;
  } catch (err) {
    console.error(`Error loading stored words for ${lang}:`, err);
    return lang === 'es-ES' ? DEMO_WORDS_ES : DEMO_WORDS_EN;
  }
}

export function saveStoredWords(lang: LanguageCode, words: WordItem[]): void {
  const key = STORAGE_KEYS[lang];
  try {
    localStorage.setItem(key, JSON.stringify(words));
  } catch (err) {
    console.error(`Error saving words for ${lang}:`, err);
  }
}

export function getStoredCurrentLang(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_LANG);
    if (saved === 'es-ES' || saved === 'en-GB') {
      return saved;
    }
  } catch (err) {
    console.warn('Error reading current lang:', err);
  }
  return 'es-ES';
}

export function saveStoredCurrentLang(lang: LanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LANG, lang);
  } catch (err) {
    console.warn('Error saving current lang:', err);
  }
}

export function getStoredStreak(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch (err) {
    console.warn('Error reading streak:', err);
  }
  return 0;
}

export function saveStoredStreak(streak: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString());
  } catch (err) {
    console.warn('Error saving streak:', err);
  }
}

export function getCustomApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_API_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCustomApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_API_KEY, key.trim());
  } catch (err) {
    console.warn('Error saving custom API key:', err);
  }
}
