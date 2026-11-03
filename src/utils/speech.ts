import { LanguageCode } from '../types';

let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voices listener
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export function getVoicesForLang(lang: LanguageCode): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  const prefix = lang === 'es-ES' ? 'es' : 'en';
  return cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
}

export function speakText(
  text: string,
  lang: LanguageCode,
  rate = 0.9
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported in this browser.');
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Select best matching voice if available
      const voices = getVoicesForLang(lang);
      if (voices.length > 0) {
        // Prefer local or high-quality voices
        const naturalVoice =
          voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri')) ||
          voices[0];
        utterance.voice = naturalVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech synthesis:', err);
      resolve();
    }
  });
}

export interface SpeechRecognitionResultEvent {
  transcript: string;
  confidence: number;
}

// Check speech recognition support
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createSpeechRecognition(
  lang: LanguageCode,
  onResult: (result: SpeechRecognitionResultEvent) => void,
  onError: (error: string) => void,
  onEnd: () => void
): { start: () => void; stop: () => void; abort: () => void } | null {
  if (typeof window === 'undefined') return null;

  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRec) {
    return null;
  }

  try {
    const recognition = new SpeechRec();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const topResult = event.results[0][0];
        onResult({
          transcript: topResult.transcript || '',
          confidence: topResult.confidence || 0,
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      onError(event.error || 'Något gick fel med mikrofonen');
    };

    recognition.onend = () => {
      onEnd();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e: any) {
          console.warn('Recognition start error:', e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch (e) {
          // ignore
        }
      },
    };
  } catch (err) {
    console.error('Failed to initialize speech recognition:', err);
    return null;
  }
}
