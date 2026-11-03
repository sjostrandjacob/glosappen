import React, { useState, useEffect } from 'react';
import { Volume2, ChevronLeft, ChevronRight, CheckCircle2, RotateCw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageCode, WordItem } from '../types';
import { speakText } from '../utils/speech';

interface FlashcardModeProps {
  words: WordItem[];
  currentLang: LanguageCode;
  onToggleMastered: (id: string) => void;
  onResetFilter?: () => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  currentLang,
  onToggleMastered,
  onResetFilter,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reset index if words list changes
  useEffect(() => {
    if (currentIndex >= words.length) {
      setCurrentIndex(Math.max(0, words.length - 1));
    }
    setIsFlipped(false);
  }, [words.length]);

  const currentWord = words[currentIndex];

  const handleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    // If flipping to the back (target language), speak the word automatically!
    if (nextFlipped && currentWord) {
      playAudio(currentWord.target);
    }
  };

  const playAudio = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    await speakText(text, currentLang, 0.9);
    setIsSpeaking(false);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
  };

  const handleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;

    if (!currentWord.mastered) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    onToggleMastered(currentWord.id);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, words.length, currentWord]);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 border border-emerald-500/30">
          🎉
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Alla glosor är avklarade!</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Grymt jobbat Melker! Du har klarat alla glosor i den här listan.
        </p>
        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            Öva på alla glosor igen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-3 flex flex-col items-center">
      {/* Top indicator & counter */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Kort {currentIndex + 1} av {words.length}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>Tips: Tryck på kortet eller mellanslag för att vända</span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full h-80 sm:h-96 relative cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`w-full h-full duration-500 transform-style-preserve-3d transition-transform relative rounded-3xl shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT (Swedish) */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
            {/* Front Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
                🇸🇪 Svenska
              </span>
              {currentWord.mastered && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Klarad
                </span>
              )}
            </div>

            {/* Front Center: Swedish Word */}
            <div className="text-center my-auto py-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight capitalize">
                {currentWord.sv}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-4 flex items-center justify-center gap-1.5">
                <RotateCw className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                <span>Klicka för att se svaret & höra uttalet</span>
              </p>
            </div>

            {/* Front Footer */}
            <div className="text-center text-xs text-slate-500">
              {currentLang === 'es-ES' ? 'Vad heter det på spanska?' : 'What is it in English?'}
            </div>
          </div>

          {/* BACK (Target Language + Example) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-emerald-950/30 border-2 border-indigo-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            {/* Back Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>{currentLang === 'es-ES' ? '🇪🇸 Spanska' : '🇬🇧 Engelska'}</span>
              </span>
              <button
                type="button"
                onClick={handleMastered}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currentWord.mastered
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentWord.mastered ? 'Klarad!' : 'Markera som klarad'}</span>
              </button>
            </div>

            {/* Back Center: Target Word + Example */}
            <div className="text-center my-auto py-2">
              <div className="flex items-center justify-center gap-2 mb-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-300 tracking-tight">
                  {currentWord.target}
                </h2>
              </div>

              {/* Example sentence */}
              {currentWord.example && (
                <div className="mt-4 p-3 rounded-2xl bg-slate-900/80 border border-indigo-900/40 text-slate-300 text-sm italic">
                  "{currentWord.example}"
                </div>
              )}
            </div>

            {/* Back Footer: Swedish translation reminder */}
            <div className="text-center text-xs text-slate-400">
              Svenska: <span className="text-slate-200 font-semibold">{currentWord.sv}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 mt-6">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="min-h-[46px] min-w-[46px] sm:px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer active:scale-95"
          title="Föregående kort"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Föregående</span>
        </button>

        {/* Listen Again Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentWord) playAudio(currentWord.target);
          }}
          disabled={isSpeaking}
          className={`min-h-[46px] flex-1 px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer active:scale-95 ${
            isSpeaking
              ? 'bg-indigo-900/60 border-indigo-500/50 text-indigo-300'
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
          }`}
          title="Lyssna på uttalet"
        >
          <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce text-emerald-400' : ''}`} />
          <span>{isSpeaking ? 'Läser upp...' : 'Lyssna igen 🔊'}</span>
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="min-h-[46px] min-w-[46px] sm:px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer active:scale-95"
          title="Nästa kort"
        >
          <span className="hidden sm:inline">Nästa</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Mark Mastery Action */}
      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={handleMastered}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            currentWord.mastered
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>
            {currentWord.mastered ? 'Den här glosan sitter! (Klarad)' : 'Klarade du glosan? Klicka för att bocka av'}
          </span>
        </button>
      </div>
    </div>
  );
};
