import React from 'react';
import { UserProfile } from '../types';
import { UNLOCKABLE_REWARDS, getLevelFromXP } from '../lib/xpEngine';
import { soundEngine } from '../lib/soundEngine';
import { Gift, X, Moon, Volume2, Palette, Award, Lock, Check } from 'lucide-react';

interface RewardsShopModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const RewardsShopModal: React.FC<RewardsShopModalProps> = ({
  userProfile,
  onUpdateProfile,
  onClose,
}) => {
  const { level } = getLevelFromXP(userProfile.lifetimeXP);

  const renderRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon':
        return <Moon className="w-5 h-5 text-amber-300" />;
      case 'Volume2':
        return <Volume2 className="w-5 h-5 text-amber-300" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-amber-300" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-300" />;
      default:
        return <Gift className="w-5 h-5 text-amber-300" />;
    }
  };

  const handleToggleTheme = (themeId: string) => {
    soundEngine.playClick();
    onUpdateProfile({ activeTheme: themeId });
  };

  const handleToggleSound = (pack: 'default' | 'retro8bit' | 'zen') => {
    soundEngine.playClick();
    soundEngine.setSoundPack(pack);
    onUpdateProfile({ soundPack: pack });
    soundEngine.playGood();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 text-zinc-100 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 border border-white/20 flex items-center justify-center shadow-lg">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Level Rewards & Customization</h2>
              <p className="text-xs text-zinc-400 font-mono">
                Level {level} Scholar • Lifetime XP: {userProfile.lifetimeXP.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unlocks Grid */}
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {UNLOCKABLE_REWARDS.map((reward) => {
            const isUnlocked = level >= reward.level;

            return (
              <div
                key={reward.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:-translate-y-0.5 ${
                  isUnlocked
                    ? 'bg-zinc-900/60 backdrop-blur-md border-white/10 shadow-sm'
                    : 'bg-zinc-950/40 backdrop-blur-sm border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-sm flex-shrink-0">
                    {renderRewardIcon(reward.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{reward.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10 font-bold">
                        Level {reward.level}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{reward.description}</p>
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="self-end sm:self-auto">
                    {reward.type === 'theme' && (
                      <button
                        onClick={() => handleToggleTheme(reward.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          userProfile.activeTheme === reward.id
                            ? 'btn-premium btn-premium-white text-xs'
                            : 'btn-premium btn-premium-dark text-xs'
                        }`}
                      >
                        {userProfile.activeTheme === reward.id ? 'Equipped' : 'Equip Theme'}
                      </button>
                    )}

                    {reward.type === 'sound' && (
                      <button
                        onClick={() => handleToggleSound('retro8bit')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          userProfile.soundPack === 'retro8bit'
                            ? 'btn-premium btn-premium-white text-xs'
                            : 'btn-premium btn-premium-dark text-xs'
                        }`}
                      >
                        {userProfile.soundPack === 'retro8bit' ? 'Equipped' : 'Equip 8-Bit Audio'}
                      </button>
                    )}

                    {reward.type === 'card_back' && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onUpdateProfile({ cardBackStyle: 'holographic' });
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          userProfile.cardBackStyle === 'holographic'
                            ? 'btn-premium btn-premium-white text-xs'
                            : 'btn-premium btn-premium-dark text-xs'
                        }`}
                      >
                        {userProfile.cardBackStyle === 'holographic' ? 'Equipped' : 'Equip Holographic'}
                      </button>
                    )}

                    {reward.type === 'badge' && (
                      <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 border border-amber-300/30">
                        <Award className="w-3.5 h-3.5 text-amber-300" /> Active Badge
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-zinc-500 flex items-center gap-1 self-end sm:self-auto px-3 py-1.5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" /> Level {reward.level}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
