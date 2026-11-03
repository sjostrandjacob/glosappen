/**
 * Comparison and normalization utilities for Melkers Glos-Coach
 */

// Strip punctuation and excess whitespace
export function cleanPunctuation(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Remove Spanish accents for comparing base characters
export function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export interface SpellCheckResult {
  status: 'exact' | 'almost_accent' | 'wrong';
  message?: string;
  hint?: string;
}

/**
 * Checks spelling according to Melkers Glos-Coach rules
 */
export function checkSpelling(input: string, target: string): SpellCheckResult {
  const cleanInput = cleanPunctuation(input);
  const cleanTarget = cleanPunctuation(target);

  if (!cleanInput) {
    return { status: 'wrong', message: 'Skriv in ditt svar för att rätta.' };
  }

  // 1. Exact match (ignoring case & surrounding punctuation)
  if (cleanInput === cleanTarget) {
    return {
      status: 'exact',
      message: 'Snyggt! Helt rätt! 🎯',
    };
  }

  // 2. Almost match: Base characters are identical, but missing/wrong accent or ñ
  const unaccentedInput = removeAccents(cleanInput);
  const unaccentedTarget = removeAccents(cleanTarget);

  if (unaccentedInput === unaccentedTarget) {
    return {
      status: 'almost_accent',
      message: `🤏 Nästan! Glöm inte accenten: ${target}`,
    };
  }

  // 3. Wrong: Give a helpful hint
  const hintLength = Math.min(2, cleanTarget.length);
  const hintPrefix = cleanTarget.slice(0, hintLength);

  return {
    status: 'wrong',
    message: 'Inte riktigt rätt den här gången!',
    hint: `Ledtråd: Börjar på "${hintPrefix}..."`,
  };
}

/**
 * Forgiving pronunciation check
 * Strips articles (el, la, los, las, un, una, the, a, an, to) and accents
 */
export function checkPronunciation(spoken: string, target: string): { matched: boolean; score: number } {
  if (!spoken || !target) return { matched: false, score: 0 };

  const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'the', 'to', 'a', 'an'];
  
  const stripArticles = (s: string) => {
    const words = s.split(' ');
    return words.filter((w) => !articles.includes(w)).join(' ');
  };

  const cleanSpoken = removeAccents(cleanPunctuation(stripArticles(spoken)));
  const cleanTarget = removeAccents(cleanPunctuation(stripArticles(target)));

  // Direct match without articles
  if (cleanSpoken === cleanTarget) {
    return { matched: true, score: 1.0 };
  }

  // One contains the other
  if (cleanSpoken.length >= 3 && cleanTarget.includes(cleanSpoken)) {
    return { matched: true, score: 0.9 };
  }
  if (cleanTarget.length >= 3 && cleanSpoken.includes(cleanTarget)) {
    return { matched: true, score: 0.9 };
  }

  // Check individual key words match
  const spokenWords = cleanSpoken.split(' ').filter(Boolean);
  const targetWords = cleanTarget.split(' ').filter(Boolean);

  const matchedWordsCount = targetWords.filter((tw) =>
    spokenWords.some((sw) => sw === tw || (tw.length > 4 && (sw.startsWith(tw) || tw.startsWith(sw))))
  ).length;

  if (targetWords.length > 0 && matchedWordsCount / targetWords.length >= 0.65) {
    return { matched: true, score: 0.8 };
  }

  return { matched: false, score: 0 };
}
