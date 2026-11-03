/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageCode, TabType, WordItem } from './types';
import { 
  getStoredCurrentLang, 
  getStoredWords, 
  saveStoredCurrentLang, 
  saveStoredWords,
  getStoredStreak,
  saveStoredStreak
} from './utils/storage';
import { DEMO_WORDS_EN, DEMO_WORDS_ES, LANGUAGES } from './utils/constants';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { FlashcardMode } from './components/FlashcardMode';
import { SpellMode } from './components/SpellMode';
import { PronounceMode } from './components/PronounceMode';
import { WordListMode } from './components/WordListMode';
import { CameraModal } from './components/CameraModal';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => getStoredCurrentLang());
  const [esWords, setEsWords] = useState<WordItem[]>(() => getStoredWords('es-ES'));
  const [enWords, setEnWords] = useState<WordItem[]>(() => getStoredWords('en-GB'));
  const [activeTab, setActiveTab] = useState<TabType>('flashcards');
  const [streak, setStreak] = useState<number>(() => getStoredStreak());
  const [filterUnmasteredOnly, setFilterUnmasteredOnly] = useState<boolean>(false);

  // Modals state
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Sync currentLang changes to localStorage
  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLang(lang);
    saveStoredCurrentLang(lang);
    showToast(`Växlade till ${LANGUAGES[lang].name} ${LANGUAGES[lang].flag}`);
  };

  // Active word list based on currentLang
  const activeWords = currentLang === 'es-ES' ? esWords : enWords;

  const setActiveWords = (updater: WordItem[] | ((prev: WordItem[]) => WordItem[])) => {
    if (currentLang === 'es-ES') {
      setEsWords((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveStoredWords('es-ES', next);
        return next;
      });
    } else {
      setEnWords((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveStoredWords('en-GB', next);
        return next;
      });
    }
  };

  // Filtered list (if user chooses "bara kvarvarande")
  const displayWords = filterUnmasteredOnly
    ? activeWords.filter((w) => !w.mastered)
    : activeWords;

  const masteredCount = activeWords.filter((w) => w.mastered).length;

  // Toggle single word mastered status
  const handleToggleMastered = (id: string) => {
    setActiveWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, mastered: !w.mastered } : w))
    );
  };

  // Delete word from active list
  const handleDeleteWord = (id: string) => {
    setActiveWords((prev) => prev.filter((w) => w.id !== id));
    showToast('Glosan togs bort');
  };

  // Add manual word to active list
  const handleAddWord = (wordData: Omit<WordItem, 'id' | 'createdAt'>) => {
    const newWord: WordItem = {
      ...wordData,
      id: `word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setActiveWords((prev) => [newWord, ...prev]);
    showToast(`Glosan "${newWord.target}" lades till i listan! 🌟`);
  };

  // Import words from Camera scan
  const handleImportWords = (
    scannedWords: Array<Omit<WordItem, 'id' | 'createdAt'>>,
    detectedLang: LanguageCode
  ) => {
    const formattedWords: WordItem[] = scannedWords.map((w, idx) => ({
      ...w,
      id: `scan-${Date.now()}-${idx}`,
      createdAt: Date.now() + idx,
      mastered: false,
    }));

    if (detectedLang === 'es-ES') {
      setEsWords((prev) => {
        const updated = [...formattedWords, ...prev];
        saveStoredWords('es-ES', updated);
        return updated;
      });
    } else {
      setEnWords((prev) => {
        const updated = [...formattedWords, ...prev];
        saveStoredWords('en-GB', updated);
        return updated;
      });
    }

    // Switch language if detected language differs from current
    if (detectedLang !== currentLang) {
      setCurrentLang(detectedLang);
      saveStoredCurrentLang(detectedLang);
      showToast(
        `📸 Läxa på ${LANGUAGES[detectedLang].targetLangName} upptäckt! Bytte automatiskt till ${LANGUAGES[detectedLang].name} ${LANGUAGES[detectedLang].flag} (+${scannedWords.length} glosor)`
      );
    } else {
      showToast(
        `📸 Lade till ${scannedWords.length} nya ${LANGUAGES[detectedLang].targetLangName} glosor!`
      );
    }
  };

  // Game mode events
  const handleSuccess = (wordId: string) => {
    // Increase streak
    setStreak((prev) => {
      const next = prev + 1;
      saveStoredStreak(next);
      return next;
    });

    // Mark mastered
    setActiveWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, mastered: true } : w))
    );
  };

  const handleFail = () => {
    setStreak(0);
    saveStoredStreak(0);
  };

  // Bulk actions
  const handleResetDemoWords = () => {
    const demo = currentLang === 'es-ES' ? DEMO_WORDS_ES : DEMO_WORDS_EN;
    setActiveWords(demo);
    showToast('Återställde 5 demoglosor.');
  };

  const handleClearAllWords = () => {
    if (window.confirm(`Vill du verkligen rensa alla glosor i ${LANGUAGES[currentLang].name}?`)) {
      setActiveWords([]);
      showToast('Alla glosor rensades.');
    }
  };

  const handleUnmasterAll = () => {
    setActiveWords((prev) => prev.map((w) => ({ ...w, mastered: false })));
    showToast('Nollställde alla bockar.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 md:pb-8 selection:bg-indigo-500 selection:text-white">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] p-3 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-md flex items-center justify-between text-xs sm:text-sm font-semibold text-white animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        streak={streak}
        totalWords={activeWords.length}
        masteredWords={masteredCount}
        filterUnmasteredOnly={filterUnmasteredOnly}
        onToggleFilter={() => setFilterUnmasteredOnly(!filterUnmasteredOnly)}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Desktop/Tablet Nav Tabs (also renders sticky bottom on mobile) */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        wordCount={activeWords.length}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-4 py-3 sm:py-6">
        {activeTab === 'flashcards' && (
          <FlashcardMode
            words={displayWords}
            currentLang={currentLang}
            onToggleMastered={handleToggleMastered}
            onResetFilter={() => setFilterUnmasteredOnly(false)}
          />
        )}

        {activeTab === 'spell' && (
          <SpellMode
            words={displayWords}
            currentLang={currentLang}
            onSuccess={handleSuccess}
            onFail={handleFail}
            onResetFilter={() => setFilterUnmasteredOnly(false)}
          />
        )}

        {activeTab === 'pronounce' && (
          <PronounceMode
            words={displayWords}
            currentLang={currentLang}
            onSuccess={handleSuccess}
            onResetFilter={() => setFilterUnmasteredOnly(false)}
          />
        )}

        {activeTab === 'list' && (
          <WordListMode
            words={activeWords}
            currentLang={currentLang}
            onToggleMastered={handleToggleMastered}
            onDeleteWord={handleDeleteWord}
            onAddWord={handleAddWord}
            onResetDemoWords={handleResetDemoWords}
            onClearAllWords={handleClearAllWords}
            onUnmasterAll={handleUnmasterAll}
          />
        )}
      </main>

      {/* Camera / AI Scan Modal */}
      <CameraModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        currentLang={currentLang}
        onImportWords={handleImportWords}
      />

      {/* Settings Gear Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}
