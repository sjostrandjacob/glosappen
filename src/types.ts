export type LanguageCode = 'es-ES' | 'en-GB';

export type TabType = 'flashcards' | 'spell' | 'pronounce' | 'list';

export interface WordItem {
  id: string;
  sv: string;
  target: string;
  example: string;
  mastered: boolean;
  createdAt: number;
}

export interface ScanResult {
  detectedLang: LanguageCode;
  words: Array<{
    sv: string;
    target: string;
    example: string;
    mastered?: boolean;
  }>;
}

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  flag: string;
  name: string;
  targetLangName: string;
  demoWords: WordItem[];
  specialChars?: string[];
}
