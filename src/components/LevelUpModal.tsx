import React from 'react';
import { UnlockableReward } from '../types';
import { Confetti } from './Confetti';
import { soundEngine } from '../lib/soundEngine';
import { Award, Zap, Gift, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  unlockedRewards: UnlockableReward[];
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  unlockedRewards,
  onClose,
}) => {
  return (
    <>
      <Confetti durationMs={4000} />
      
      <div id="level-up-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-fade-in">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
          
          {/* Icon Badge */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-amber-300 fill-amber-300" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-1">
            LEVEL UP ACHIEVED
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-white">
            Level {level} Reached
          </h2>

          <p className="text-xs text-zinc-300 mb-6 max-w-xs mx-auto leading-relaxed">
            Your knowledge retention is growing. Keep reviewing your active recall flashcards to increase your rank!
          </p>

          {/* Unlocked Reward Box */}
          {unlockedRewards.length > 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left space-y-3 mb-6 shadow-inner">
              <div className="text-[11px] font-mono uppercase text-zinc-300 font-bold flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                <span>NEW REWARD UNLOCKED:</span>
              </div>
              {unlockedRewards.map((reward) => (
                <div key={reward.id} className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-white">{reward.title}</div>
                    <div className="text-xs text-zinc-400">{reward.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-xs text-zinc-400 mb-6">
              Next theme unlock available at Level 5!
            </div>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="btn-premium btn-premium-white w-full py-3 text-xs"
          >
            <span>Continue Studying</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>

        </div>
      </div>
    </>
  );
};
