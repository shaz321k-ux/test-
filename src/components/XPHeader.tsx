import React from 'react';
import { UserProfile } from '../types';
import { getLevelFromXP } from '../lib/xpEngine';
import { Flame, Award } from 'lucide-react';

interface XPHeaderProps {
  userProfile: UserProfile;
  onOpenRewards: () => void;
  onOpenGenerator: () => void;
}

// Minimalist Premium LC Logo Badge (White & Black High Contrast)
const LogoBadge: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`${className} rounded-xl bg-white text-zinc-900 border border-zinc-200 font-black text-sm tracking-tighter flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.3)] flex-shrink-0 select-none`}>
    LC
  </div>
);

export const XPHeader: React.FC<XPHeaderProps> = ({
  userProfile,
}) => {
  const { level, xpInCurrentLevel, xpNeededForNextLevel, progressPercent } =
    getLevelFromXP(userProfile.lifetimeXP);

  return (
    <header className="w-full bg-black/60 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & User Name Tile */}
        <div className="flex items-center gap-4 bg-zinc-900/80 text-white border border-zinc-800/80 rounded-2xl px-6 py-3 sm:px-8 sm:py-3.5 shadow-lg hover-glow transition-all min-w-[240px] sm:min-w-[280px]">
          <LogoBadge className="w-11 h-11" />

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight">
                Hello {userProfile.name || 'Scholar'}!
              </span>
              {userProfile.unlockedThemes.includes('galaxy_brain_badge') && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 font-mono font-medium flex items-center gap-1 border border-zinc-700">
                  <Award className="w-3 h-3 text-purple-400" /> Galaxy Brain
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Level Progress Tile: Contains Level, XP, Streak, and Neon Purple Progress Bar */}
        <div className="flex-1 max-w-xl mx-auto w-full bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 shadow-lg hover-glow flex flex-col justify-center gap-2">
          
          <div className="flex items-center justify-between text-xs font-mono text-zinc-300 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded-md text-[10px]">
                Level {level}
              </span>
              <span className="text-zinc-400 text-[11px]">
                {xpInCurrentLevel} / {xpNeededForNextLevel} XP
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span>
                Total: <strong className="text-white font-bold">{userProfile.lifetimeXP.toLocaleString()} XP</strong>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1 text-zinc-200 font-medium">
                <Flame className="w-3.5 h-3.5 text-purple-400 fill-purple-950" /> {userProfile.streakDays}d Streak
              </span>
            </div>
          </div>

          {/* Glowing White Aura Progress Bar */}
          <div className="w-full h-2.5 bg-zinc-950/90 rounded-full p-0.5 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.25)] relative">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_#ffffff,0_0_20px_#ffffff,0_0_35px_rgba(255,255,255,0.9)]"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            ></div>
          </div>

        </div>

      </div>
    </header>
  );
};
