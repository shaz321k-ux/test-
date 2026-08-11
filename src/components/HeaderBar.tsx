import React from 'react';
import { Search, Flame } from 'lucide-react';
import { UserProfile } from '../types';
import { getLevelFromXP } from '../lib/xpEngine';
import { soundEngine } from '../lib/soundEngine';

interface HeaderBarProps {
  userProfile: UserProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPreferences: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  userProfile,
  searchQuery,
  setSearchQuery,
  onOpenPreferences,
}) => {
  const { level, xpInCurrentLevel, xpNeededForNextLevel, progressPercent } =
    getLevelFromXP(userProfile.lifetimeXP || 0);

  return (
    <header className="w-full bg-zinc-950/80 backdrop-blur-xl px-6 sm:px-8 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 text-zinc-100 shadow-lg">
      
      {/* Search Input Box */}
      <div className="relative w-full sm:w-96">
        <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search decks..."
          className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-all font-medium"
        />
      </div>

      {/* Right User Stats Section */}
      <div className="flex items-center justify-end flex-1 sm:flex-initial">
        
        {/* XP Level Badge & Spacious Progress Bar */}
        <div 
          onClick={() => {
            soundEngine.playClick();
            onOpenPreferences();
          }}
          className="w-full sm:w-auto flex items-center gap-4 glass-card px-5 py-2.5 cursor-pointer hover:border-white/20 transition-all shadow-md group"
          title="Click to manage settings"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-zinc-950 bg-white px-2.5 py-1 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              LVL {level}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[180px] sm:min-w-[260px] md:min-w-[320px]">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-tight">
              <span className="text-zinc-300">Level Progress</span>
              <span className="text-zinc-400">
                {xpInCurrentLevel} / {xpNeededForNextLevel} XP
              </span>
            </div>

            {/* Long & Clean Progress Bar with White Aura Glow */}
            <div className="w-full h-2.5 bg-zinc-950/90 border border-white/30 rounded-full p-0.5 shadow-[0_0_15px_rgba(255,255,255,0.25)] relative">
              <div
                className="h-full bg-white rounded-full transition-all duration-300 shadow-[0_0_10px_#ffffff,0_0_20px_#ffffff,0_0_35px_rgba(255,255,255,0.9)]"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-extrabold pl-3 border-l border-white/10">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>{userProfile.streakDays || 0}d</span>
          </div>
        </div>

      </div>
    </header>
  );
};
