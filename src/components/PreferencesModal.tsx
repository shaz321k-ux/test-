import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { soundEngine } from '../lib/soundEngine';
import {
  X,
  User,
  Sliders,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  GraduationCap,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface PreferencesModalProps {
  userProfile: UserProfile;
  initialTab?: 'profile' | 'preferences';
  onClose: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData?: () => void;
  onTabChange?: (tab: 'profile' | 'preferences') => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  userProfile,
  initialTab = 'profile',
  onClose,
  onUpdateProfile,
  onResetData,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>(initialTab);

  const handleTabSwitch = (tab: 'profile' | 'preferences') => {
    soundEngine.playClick();
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  
  // Profile state
  const [name, setName] = useState<string>(userProfile.name || 'Scholar');
  const [educationLevel, setEducationLevel] = useState<string>(
    userProfile.educationLevel || 'University / College'
  );
  const [useCase, setUseCase] = useState<string>(userProfile.useCase || 'cs');
  const [dailyGoal, setDailyGoal] = useState<number>(userProfile.dailyGoal || 25);

  // Preferences state
  const [soundPack, setSoundPack] = useState<'default' | 'retro8bit' | 'zen'>(
    userProfile.soundPack || 'default'
  );
  
  // Notice banner state
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const educationOptions = [
    'High School',
    'University / College',
    'Graduate / Post-Grad',
    'Self-Learner / Professional',
    'Other',
  ];

  const useCaseOptions = [
    { id: 'cs', label: 'Computer Science & Tech' },
    { id: 'business', label: 'Business & Finance' },
    { id: 'history', label: 'History & Humanities' },
    { id: 'science', label: 'Natural Sciences' },
    { id: 'languages', label: 'Languages & Vocab' },
    { id: 'medicine', label: 'Medicine & Health' },
    { id: 'general', label: 'General & Custom' },
    { id: 'other', label: 'Other Subject' },
  ];

  const [customEducationLevel, setCustomEducationLevel] = useState<string>(
    userProfile.educationLevel && !educationOptions.includes(userProfile.educationLevel)
      ? userProfile.educationLevel
      : ''
  );
  const [customUseCase, setCustomUseCase] = useState<string>(
    userProfile.useCase && !useCaseOptions.some((o) => o.id === userProfile.useCase)
      ? userProfile.useCase
      : ''
  );

  const handleSave = () => {
    soundEngine.playClick();
    const finalEducation = educationLevel === 'Other' ? (customEducationLevel.trim() || 'Other') : educationLevel;
    const finalUseCase = useCase === 'other' ? (customUseCase.trim() || 'Other') : useCase;

    onUpdateProfile({
      name: name.trim() || 'Scholar',
      educationLevel: finalEducation,
      useCase: finalUseCase,
      dailyGoal,
      soundPack,
    });
    soundEngine.setSoundPack(soundPack);

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      id="preferences-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-fade-in"
    >
      <div
        id="preferences-card"
        className="w-full max-w-xl glass-panel rounded-3xl text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center font-bold shadow-md">
              {activeTab === 'profile' ? <User className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                {activeTab === 'profile' ? 'Edit Profile' : 'Preferences'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Customize your account settings and app behavior
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="px-6 pt-4 pb-1 border-b border-white/10 flex items-center gap-3">
          <button
            onClick={() => handleTabSwitch('profile')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer select-none ${
              activeTab === 'profile'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {activeTab === 'profile' && (
              <motion.div
                layoutId="activePrefTabPill"
                className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 33, mass: 0.8 }}
              />
            )}
            <User className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Profile Settings</span>
          </button>

          <button
            onClick={() => handleTabSwitch('preferences')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer select-none ${
              activeTab === 'preferences'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {activeTab === 'preferences' && (
              <motion.div
                layoutId="activePrefTabPill"
                className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 33, mass: 0.8 }}
              />
            )}
            <Sliders className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">App Preferences</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              
              {/* Display Name */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name..."
                  className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-white/25 transition-all"
                />
              </div>

              {/* Education Level */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Education Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {educationOptions.map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        soundEngine.playClick();
                        setEducationLevel(level);
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5 ${
                        educationLevel === level
                          ? 'bg-white/10 backdrop-blur-md text-white border-white/30 shadow-md'
                          : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {educationLevel === 'Other' && (
                  <input
                    type="text"
                    value={customEducationLevel}
                    onChange={(e) => setCustomEducationLevel(e.target.value)}
                    placeholder="Specify education or grade level..."
                    className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-white/25 mt-2"
                  />
                )}
              </div>

              {/* Primary Subject Domain */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Primary Domain / Subject
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {useCaseOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setUseCase(opt.id);
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer hover:-translate-y-0.5 ${
                        useCase === opt.id
                          ? 'bg-white/10 backdrop-blur-md text-white border-white/30 shadow-md'
                          : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {useCase === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
                {useCase === 'other' && (
                  <input
                    type="text"
                    value={customUseCase}
                    onChange={(e) => setCustomUseCase(e.target.value)}
                    placeholder="Specify custom subject or topic..."
                    className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-white/25 mt-2"
                  />
                )}
              </div>

              {/* Daily Card Goal */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Daily Review Target
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        soundEngine.playClick();
                        setDailyGoal(count);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-mono border transition-all cursor-pointer hover:-translate-y-0.5 ${
                        dailyGoal === count
                          ? 'bg-white text-zinc-950 border-white font-black shadow-md'
                          : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {count} Cards
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              
              {/* Sound Audio Pack */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Audio Sound FX
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'default', label: 'Minimalist' },
                    { id: 'retro8bit', label: '8-Bit Arcade' },
                    { id: 'zen', label: 'Zen Synth' },
                  ].map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => {
                        setSoundPack(pack.id as any);
                        soundEngine.setSoundPack(pack.id as any);
                        soundEngine.playGood();
                      }}
                      className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                        soundPack === pack.id
                          ? 'bg-white/10 backdrop-blur-md text-white border-white/30 shadow-md'
                          : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {pack.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Data Danger Zone */}
              {onResetData && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Danger Zone
                  </label>
                  
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setConfirmReset(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Application Data</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer with Save Action */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-md bg-zinc-950/60">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="btn-premium btn-premium-dark px-4 py-2 text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="btn-premium btn-premium-white px-6 py-2.5 text-xs"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Confirmation Popup Modal */}
      {confirmReset && (
        <div
          id="reset-confirm-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-fade-in"
        >
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-5 animate-scale-up">
            {/* Symmetrical Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Reset Application Data
              </h3>
              <button
                onClick={() => setConfirmReset(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-zinc-100">
                Are you sure you want to reset everything?
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This action will permanently delete all your custom decks, flashcards, review history, and lifetime XP progress. This cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setConfirmReset(false);
                }}
                className="btn-premium btn-premium-dark px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setConfirmReset(false);
                  if (onResetData) {
                    onResetData();
                  }
                  onClose();
                }}
                className="btn-premium btn-premium-dark px-5 py-2 text-xs border-red-500/40 text-red-400 hover:text-red-300 hover:border-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Reset Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
