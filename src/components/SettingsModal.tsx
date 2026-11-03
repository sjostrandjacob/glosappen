import React, { useState, useEffect } from 'react';
import { X, Key, Volume2, ShieldCheck, Info, Check } from 'lucide-react';
import { getCustomApiKey, saveCustomApiKey } from '../utils/storage';
import { speakText } from '../utils/speech';
import { LanguageCode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [customKey, setCustomKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ hasServerApiKey: boolean; model: string } | null>(null);
  const [speechRate, setSpeechRate] = useState(0.9);

  useEffect(() => {
    if (isOpen) {
      setCustomKey(getCustomApiKey());
      setSavedSuccess(false);

      // Check server status
      fetch('/api/status')
        .then((res) => res.json())
        .then((data) => setServerStatus(data))
        .catch(() => setServerStatus(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomApiKey(customKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestAudio = () => {
    const testPhrase = currentLang === 'es-ES' ? '¡Hola Melker! Muy bien hecho.' : 'Hello Melker! Well done.';
    speakText(testPhrase, currentLang, speechRate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <span>⚙️ Inställningar</span>
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Hantera AI-anslutning och rösthastighet för Melkers Glos-Coach.
        </p>

        {/* Server status indicator */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-5 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Server AI-status:</span>
            {serverStatus?.hasServerApiKey ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Ansluten & Redo
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                Lokal nyckel aktiv
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>AI-modell:</span>
            <span className="font-mono text-slate-400">{serverStatus?.model || 'gemini-2.5-flash'}</span>
          </div>
        </div>

        {/* Custom API Key input */}
        <form onSubmit={handleSaveKey} className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fallback Gemini API-nyckel</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">(valfritt)</span>
            </label>
            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Behövs bara om du vill använda en egen privat Google Gemini-nyckel istället för serverns förvalda.
            </p>
          </div>

          <div className="flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> Sparad!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Spara nyckel
            </button>
          </div>
        </form>

        {/* Speech Test & Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Uppläsningshastighet ({speechRate}x)</span>
            </span>
            <button
              type="button"
              onClick={handleTestAudio}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 text-[11px] font-bold hover:bg-indigo-600/50 cursor-pointer transition-colors"
            >
              Testa röst 🔊
            </button>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.1"
            step="0.05"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Help box */}
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300/80 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
          <span>
            Melkers Glos-Coach sparar automatiskt alla spanska och engelska ord säkert i din webbläsares minne.
          </span>
        </div>
      </div>
    </div>
  );
};
