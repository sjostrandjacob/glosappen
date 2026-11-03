import React from 'react';
import { Flame, Camera, Settings, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../utils/constants';

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  streak: number;
  totalWords: number;
  masteredWords: number;
  filterUnmasteredOnly: boolean;
  onToggleFilter: () => void;
  onOpenScanModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  streak,
  totalWords,
  masteredWords,
  filterUnmasteredOnly,
  onToggleFilter,
  onOpenScanModal,
  onOpenSettingsModal,
}) => {
  const percentMastered = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Top row: Brand & Action Controls */}
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-lg select-none">
            🚀
          </div>
          <div className="leading-tight">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Melkers Glos-Coach</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Spanska & Engelska läxkompis
            </p>
          </div>
        </div>

        {/* Center / Right: Streak & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              streak > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
            }`}
            title="Antal rätt i rad"
          >
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-sm font-bold font-mono tabular-nums">{streak}</span>
            <span className="text-xs text-slate-400 hidden xs:inline">streak</span>
          </div>

          {/* Camera Button */}
          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer shrink-0"
            title="Fota en ny glosläxa med kameran"
          >
            <Camera className="w-4 h-4" />
            <span className="whitespace-nowrap">Fota ny läxa</span>
          </button>

          {/* Settings Gear Button */}
          <button
            onClick={onOpenSettingsModal}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label="Inställningar"
            title="Inställningar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Second row: Language Switcher & Progress Bar */}
      <div className="max-w-5xl mx-auto px-4 pb-2.5 pt-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Language Switcher Tabs */}
          <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 self-start sm:self-auto shadow-inner">
            <button
              onClick={() => onLanguageChange('es-ES')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentLang === 'es-ES'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base">{LANGUAGES['es-ES'].flag}</span>
              <span>Spanska</span>
            </button>
            <button
              onClick={() => onLanguageChange('en-GB')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentLang === 'en-GB'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base">{LANGUAGES['en-GB'].flag}</span>
              <span>Engelska</span>
            </button>
          </div>

          {/* Progress bar & Filter control */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
            {/* Filter Toggle */}
            <button
              onClick={onToggleFilter}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterUnmasteredOnly
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${filterUnmasteredOnly ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{filterUnmasteredOnly ? 'Övar bara på kvarvarande' : 'Övar på alla ord'}</span>
            </button>

            {/* Mastered Progress Bar */}
            <div className="flex items-center gap-2 min-w-[130px] sm:min-w-[160px]">
              <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentMastered}%` }}
                />
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums shrink-0">
                {masteredWords}/{totalWords} ({percentMastered}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
