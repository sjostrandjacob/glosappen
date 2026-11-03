import React, { useState, useRef, useEffect } from 'react';
import { Check, ArrowRight, HelpCircle, RotateCcw, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageCode, WordItem } from '../types';
import { checkSpelling, SpellCheckResult } from '../utils/comparison';
import { speakText } from '../utils/speech';
import { LANGUAGES } from '../utils/constants';

interface SpellModeProps {
  words: WordItem[];
  currentLang: LanguageCode;
  onSuccess: (wordId: string) => void;
  onFail: () => void;
  onResetFilter?: () => void;
}

export const SpellMode: React.FC<SpellModeProps> = ({
  words,
  currentLang,
  onSuccess,
  onFail,
  onResetFilter,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<SpellCheckResult | null>(null);
  const [hasRevealedAnswer, setHasRevealedAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync index if words change
  useEffect(() => {
    if (currentIndex >= words.length) {
      setCurrentIndex(Math.max(0, words.length - 1));
    }
    resetState();
  }, [words.length]);

  const currentWord = words[currentIndex];

  const resetState = () => {
    setUserInput('');
    setFeedback(null);
    setHasRevealedAnswer(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInsertChar = (char: string) => {
    if (!inputRef.current) {
      setUserInput((prev) => prev + char);
      return;
    }
    const start = inputRef.current.selectionStart || userInput.length;
    const end = inputRef.current.selectionEnd || userInput.length;
    const nextVal = userInput.substring(0, start) + char + userInput.substring(end);
    setUserInput(nextVal);

    // Keep focus and position cursor right after inserted character
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + char.length, start + char.length);
      }
    }, 10);
  };

  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentWord || !userInput.trim()) return;

    const result = checkSpelling(userInput, currentWord.target);
    setFeedback(result);

    if (result.status === 'exact') {
      // Confetti celebration!
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Pronounce the word
      speakText(currentWord.target, currentLang, 0.9);

      // Increase streak & mark mastered
      onSuccess(currentWord.id);
    } else if (result.status === 'almost_accent') {
      // Retain streak, don't call onFail, let user correct it!
    } else if (result.status === 'wrong') {
      // Reset streak
      onFail();
    }
  };

  const handleNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    resetState();
  };

  const handleRevealAnswer = () => {
    setHasRevealedAnswer(true);
    speakText(currentWord.target, currentLang, 0.9);
  };

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 border border-emerald-500/30">
          🏆
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Inga glosor att stava just nu!</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Du har stavat alla ord rätt. Slå av filtret eller lägg till fler glosor!
        </p>
        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Öva på alla glosor igen
          </button>
        )}
      </div>
    );
  }

  const specialChars = LANGUAGES[currentLang]?.specialChars || [];

  return (
    <div className="max-w-xl mx-auto px-4 py-3 flex flex-col items-center">
      {/* Top progress indicator */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Ord {currentIndex + 1} av {words.length}</span>
        </div>
        {currentWord.mastered && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Redan klarad
          </span>
        )}
      </div>

      {/* Main Task Card */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center">
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
          Stava detta ord på {currentLang === 'es-ES' ? 'spanska' : 'engelska'}:
        </div>

        {/* Swedish Prompt Word */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight capitalize mb-6">
          {currentWord.sv}
        </h2>

        {/* Form Input */}
        <form onSubmit={handleCheck} className="w-full max-w-md">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (feedback?.status === 'wrong') {
                  setFeedback(null);
                }
              }}
              placeholder={`Skriv här på ${currentLang === 'es-ES' ? 'spanska' : 'engelska'}...`}
              disabled={feedback?.status === 'exact'}
              className={`w-full px-5 py-4 text-center text-lg sm:text-xl font-semibold rounded-2xl bg-slate-950 border-2 transition-all outline-none ${
                feedback?.status === 'exact'
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                  : feedback?.status === 'almost_accent'
                  ? 'border-amber-500 text-amber-200 bg-amber-950/20 focus:ring-4 focus:ring-amber-500/20'
                  : feedback?.status === 'wrong'
                  ? 'border-rose-500 text-rose-200 bg-rose-950/20 focus:ring-4 focus:ring-rose-500/20'
                  : 'border-slate-700 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
              }`}
            />
          </div>

          {/* Quick-character bar for Spanish special characters */}
          {specialChars.length > 0 && feedback?.status !== 'exact' && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Snabbtecken:</span>
              {specialChars.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleInsertChar(char)}
                  className="min-w-[42px] min-h-[42px] sm:min-w-[44px] sm:min-h-[44px] px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 hover:text-white font-mono text-base font-bold border border-slate-700/80 shadow-sm transition-transform active:scale-90 cursor-pointer"
                  title={`Infoga ${char}`}
                >
                  {char}
                </button>
              ))}
            </div>
          )}

          {/* Action Button: Rätta or Nästa */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {feedback?.status === 'exact' ? (
              <button
                type="button"
                onClick={handleNextWord}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 cursor-pointer"
              >
                <span>Nästa ord</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className={`w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                  userInput.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>Rätta svar</span>
              </button>
            )}
          </div>
        </form>

        {/* Feedback Messages */}
        {feedback && (
          <div className="w-full max-w-md mt-6 transition-all">
            {feedback.status === 'exact' && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-center flex flex-col items-center">
                <div className="flex items-center gap-2 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>{feedback.message}</span>
                </div>
                <div className="mt-2 text-xs text-emerald-400/90 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-300" />
                  <span>Streak +1 & Glosan är nu klarad!</span>
                </div>
              </div>
            )}

            {feedback.status === 'almost_accent' && (
              <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-center">
                <p className="font-bold text-sm sm:text-base">{feedback.message}</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  Du har rätt bokstäver! Ändra accenter och klicka Rätta igen. Streaken är kvar!
                </p>
              </div>
            )}

            {feedback.status === 'wrong' && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-center flex flex-col items-center">
                <p className="font-bold text-sm sm:text-base">{feedback.message}</p>
                {feedback.hint && !hasRevealedAnswer && (
                  <p className="text-xs text-rose-300/90 mt-1 font-mono font-medium">
                    {feedback.hint}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserInput('');
                      inputRef.current?.focus();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Försök igen</span>
                  </button>
                  {!hasRevealedAnswer && (
                    <button
                      type="button"
                      onClick={handleRevealAnswer}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-xs text-rose-300 font-semibold border border-rose-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Visa rätt svar</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revealed Answer Box */}
        {hasRevealedAnswer && (
          <div className="w-full max-w-md mt-4 p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 text-center">
            <span className="text-xs text-slate-400 block mb-1">Rätt stavning är:</span>
            <span className="text-xl font-extrabold text-emerald-300 font-mono tracking-wide">
              {currentWord.target}
            </span>
            {currentWord.example && (
              <p className="text-xs text-slate-400 mt-2 italic">"{currentWord.example}"</p>
            )}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleNextWord}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Gå vidare till nästa ord ➡️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Skip Button */}
      {feedback?.status !== 'exact' && (
        <div className="mt-4">
          <button
            onClick={handleNextWord}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1 px-3"
          >
            Hoppa över det här ordet just nu ⏩
          </button>
        </div>
      )}
    </div>
  );
};
