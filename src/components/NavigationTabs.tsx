import React from 'react';
import { Layers, Keyboard, Mic, ListCheck } from 'lucide-react';
import { TabType } from '../types';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  wordCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  wordCount,
}) => {
  const tabs = [
    {
      id: 'flashcards' as TabType,
      label: 'Flashcards',
      icon: Layers,
      emoji: '🃏',
    },
    {
      id: 'spell' as TabType,
      label: 'Stava',
      icon: Keyboard,
      emoji: '⌨️',
    },
    {
      id: 'pronounce' as TabType,
      label: 'Uttal',
      icon: Mic,
      emoji: '🎤',
    },
    {
      id: 'list' as TabType,
      label: 'Gloslista',
      icon: ListCheck,
      emoji: '📋',
      badge: wordCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe md:static md:bg-transparent md:border-t-0 md:backdrop-blur-none">
      <div className="max-w-md mx-auto md:max-w-2xl px-2 py-1.5 md:py-3">
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`min-h-[52px] sm:min-h-[56px] flex flex-col items-center justify-center rounded-xl p-1 transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-indigo-400' : ''}`} />
                  {typeof tab.badge === 'number' && (
                    <span className="absolute -top-1.5 -right-3 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs mt-1 truncate tracking-tight">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
