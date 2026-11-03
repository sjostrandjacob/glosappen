import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Volume2, 
  CheckCircle2, 
  Circle, 
  Search, 
  Sparkles, 
  RotateCcw,
  BookOpen,
  X
} from 'lucide-react';
import { LanguageCode, WordItem } from '../types';
import { speakText } from '../utils/speech';

interface WordListModeProps {
  words: WordItem[];
  currentLang: LanguageCode;
  onToggleMastered: (id: string) => void;
  onDeleteWord: (id: string) => void;
  onAddWord: (word: Omit<WordItem, 'id' | 'createdAt'>) => void;
  onResetDemoWords: () => void;
  onClearAllWords: () => void;
  onUnmasterAll: () => void;
}

export const WordListMode: React.FC<WordListModeProps> = ({
  words,
  currentLang,
  onToggleMastered,
  onDeleteWord,
  onAddWord,
  onResetDemoWords,
  onClearAllWords,
  onUnmasterAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'mastered' | 'unmastered'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Form state for adding word
  const [newSv, setNewSv] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newExample, setNewExample] = useState('');
  const [formError, setFormError] = useState('');

  const masteredCount = words.filter((w) => w.mastered).length;
  const percent = words.length > 0 ? Math.round((masteredCount / words.length) * 100) : 0;

  const handlePlayWord = async (word: WordItem) => {
    if (speakingId) return;
    setSpeakingId(word.id);
    await speakText(word.target, currentLang, 0.9);
    setSpeakingId(null);
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSv.trim() || !newTarget.trim()) {
      setFormError('Både svenska och målspråk måste fyllas i.');
      return;
    }

    onAddWord({
      sv: newSv.trim(),
      target: newTarget.trim(),
      example: newExample.trim(),
      mastered: false,
    });

    setNewSv('');
    setNewTarget('');
    setNewExample('');
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Filter words
  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.sv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.example.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterState === 'mastered') return w.mastered;
    if (filterState === 'unmastered') return !w.mastered;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-3">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
            {words.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Glosor totalt</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {masteredCount}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Klarade (✅)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            {percent}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Mästarnivå</div>
        </div>
      </div>

      {/* Action Bar: Search, Add Word, Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök bland glosor..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Add Word Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-transform cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Lägg till ord</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterState === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alla ({words.length})
          </button>
          <button
            onClick={() => setFilterState('unmastered')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterState === 'unmastered'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kvar ({words.length - masteredCount})
          </button>
          <button
            onClick={() => setFilterState('mastered')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterState === 'mastered'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Klarade ({masteredCount})
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Visar {filteredWords.length} ord
        </span>
      </div>

      {/* Word List Items */}
      <div className="space-y-2">
        {filteredWords.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Inga glosor matchar</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Pröva en annan sökterm.' : 'Lägg till ditt första ord eller fota din läxa!'}
            </p>
          </div>
        ) : (
          filteredWords.map((word) => (
            <div
              key={word.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                word.mastered
                  ? 'bg-slate-900/50 border-emerald-900/40 hover:border-emerald-800/60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Checkmark Mastered Toggle */}
              <button
                type="button"
                onClick={() => onToggleMastered(word.id)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title={word.mastered ? 'Markera som inte klarad' : 'Markera som klarad'}
              >
                {word.mastered ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                )}
              </button>

              {/* Word Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {word.target}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">
                    = {word.sv}
                  </span>
                </div>

                {word.example && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate italic">
                    "{word.example}"
                  </p>
                )}
              </div>

              {/* Actions: Listen & Delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePlayWord(word)}
                  disabled={speakingId === word.id}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Lyssna på uttal"
                >
                  <Volume2 className={`w-4 h-4 ${speakingId === word.id ? 'text-emerald-400 animate-bounce' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteWord(word.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Radera ord"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Management Actions */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onUnmasterAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nollställ framsteg</span>
          </button>
          <button
            onClick={onResetDemoWords}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Återställ demoglosor</span>
          </button>
        </div>

        <button
          onClick={onClearAllWords}
          className="px-3 py-1.5 rounded-lg hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          Rensa alla {currentLang === 'es-ES' ? 'spanska' : 'engelska'} glosor
        </button>
      </div>

      {/* Add Word Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Lägg till glosa manuellt</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Läggs till i {currentLang === 'es-ES' ? 'spanska' : 'engelska'} listan.
            </p>

            <form onSubmit={handleCreateWord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Svenskt ord / fras *
                </label>
                <input
                  type="text"
                  required
                  value={newSv}
                  onChange={(e) => setNewSv(e.target.value)}
                  placeholder="t.ex. en hund"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  På {currentLang === 'es-ES' ? 'spanska' : 'engelska'} *
                </label>
                <input
                  type="text"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder={currentLang === 'es-ES' ? 't.ex. un perro' : 't.ex. a dog'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Exempelmening (valfri)
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="t.ex. El perro corre en el parque"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {formError && (
                <div className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Spara glosa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
