import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, ArrowRight, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageCode, WordItem } from '../types';
import { speakText, isSpeechRecognitionSupported, createSpeechRecognition } from '../utils/speech';
import { checkPronunciation } from '../utils/comparison';

interface PronounceModeProps {
  words: WordItem[];
  currentLang: LanguageCode;
  onSuccess: (wordId: string) => void;
  onResetFilter?: () => void;
}

export const PronounceMode: React.FC<PronounceModeProps> = ({
  words,
  currentLang,
  onSuccess,
  onResetFilter,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [heardText, setHeardText] = useState('');
  const [matchResult, setMatchResult] = useState<'success' | 'retry' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);

  // Sync index
  useEffect(() => {
    if (currentIndex >= words.length) {
      setCurrentIndex(Math.max(0, words.length - 1));
    }
    resetState();
  }, [words.length]);

  const currentWord = words[currentIndex];
  const hasSpeechApi = isSpeechRecognitionSupported();

  const resetState = () => {
    setIsListening(false);
    setHeardText('');
    setMatchResult(null);
    setErrorMessage('');
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const handleListenFirst = async () => {
    if (!currentWord || isSpeaking) return;
    setIsSpeaking(true);
    await speakText(currentWord.target, currentLang, 0.9);
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (!hasSpeechApi) {
      setErrorMessage(
        'Röstigenkänning stöds inte i denna webbläsare. Prova Chrome eller Safari på mobilen!'
      );
      return;
    }

    resetState();
    setErrorMessage('');

    const rec = createSpeechRecognition(
      currentLang,
      (result) => {
        setIsListening(false);
        const transcript = result.transcript;
        setHeardText(transcript);

        if (!currentWord) return;

        const evalResult = checkPronunciation(transcript, currentWord.target);

        if (evalResult.matched) {
          setMatchResult('success');
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
          onSuccess(currentWord.id);
        } else {
          setMatchResult('retry');
        }
      },
      (error) => {
        setIsListening(false);
        if (error === 'not-allowed') {
          setErrorMessage('Mikrofonåtkomst nekades. Tillåt mikrofon i webbläsaren för att prata.');
        } else if (error === 'no-speech') {
          setErrorMessage('Vi hörde inget ljud. Tryck på mikrofonen och prata nära telefonen!');
        } else {
          setErrorMessage(`Röstfel: ${error}`);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (rec) {
      recognitionRef.current = rec;
      setIsListening(true);
      rec.start();
    } else {
      setErrorMessage('Kunde inte starta mikrofonen.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
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

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 border border-emerald-500/30">
          🎙️
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Inga glosor kvar att uttala!</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Du har uttalat alla ord som ett proffs!
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

  return (
    <div className="max-w-xl mx-auto px-4 py-3 flex flex-col items-center">
      {/* Top indicator */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Uttalsövning {currentIndex + 1} av {words.length}</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Språkkod: {currentLang}
        </span>
      </div>

      {/* Main Pronounce Card */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center">
        {/* Swedish context */}
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
          Svenska
        </div>
        <div className="text-lg font-medium text-slate-300 mb-4 capitalize">
          {currentWord.sv}
        </div>

        {/* Target Word */}
        <div className="w-full py-4 px-6 rounded-2xl bg-slate-950 border border-slate-800 my-2">
          <span className="text-xs text-emerald-400 font-semibold block mb-1">
            Säg på {currentLang === 'es-ES' ? 'spanska' : 'engelska'}:
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {currentWord.target}
          </h2>
          {currentWord.example && (
            <p className="text-xs text-slate-400 mt-2 italic">
              "{currentWord.example}"
            </p>
          )}
        </div>

        {/* Listen First Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleListenFirst}
            disabled={isSpeaking}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer active:scale-95"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-indigo-400 animate-bounce' : 'text-slate-400'}`} />
            <span>{isSpeaking ? 'Spelar upp...' : 'Lyssna först 🔊'}</span>
          </button>
        </div>

        {/* Big Pulsing Mic Button */}
        <div className="mt-8 mb-4 flex flex-col items-center">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl relative ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50 ring-8 ring-rose-500/20'
                : matchResult === 'success'
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40 hover:scale-105 active:scale-95 ring-4 ring-indigo-500/20'
            }`}
            title={isListening ? 'Sluta lyssna' : 'Tryck för att prata'}
          >
            {isListening ? (
              <MicOff className="w-9 h-9" />
            ) : matchResult === 'success' ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : (
              <Mic className="w-9 h-9" />
            )}

            {/* Ripple rings while listening */}
            {isListening && (
              <span className="absolute -inset-3 rounded-full border-2 border-rose-500 animate-ping opacity-75 pointer-events-none" />
            )}
          </button>

          <span className="text-xs font-bold mt-4 tracking-wide uppercase text-slate-400">
            {isListening
              ? '🎙️ Lyssnar på dig... Prata nu!'
              : 'Tryck på mikrofonen och säg ordet'}
          </span>
        </div>

        {/* Heard Transcription and Result Feedback */}
        {heardText && (
          <div className="w-full max-w-md mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xs text-slate-500 block mb-1">Appen hörde:</span>
            <p className="text-base font-semibold text-white italic">"{heardText}"</p>

            {matchResult === 'success' && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">Grymt bra uttal! Rätt svar! 🎯</span>
              </div>
            )}

            {matchResult === 'retry' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200">
                <p className="font-semibold text-xs sm:text-sm">
                  🤏 Nästan! Försök säga ordet lite tydligare eller lyssna först 🔊
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={startListening}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Prata igen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="w-full max-w-md mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action button next */}
        {matchResult === 'success' && (
          <div className="mt-5">
            <button
              type="button"
              onClick={handleNextWord}
              className="min-h-[46px] px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Nästa ord</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Skip button */}
      {matchResult !== 'success' && (
        <div className="mt-4">
          <button
            onClick={handleNextWord}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1 px-3"
          >
            Hoppa till nästa glosa ⏩
          </button>
        </div>
      )}
    </div>
  );
};
