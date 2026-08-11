import React, { useState } from 'react';
import { soundEngine } from '../lib/soundEngine';
import { UserProfile } from '../types';
import { GraduationCap, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { LumusLogo } from './LumusLogo';

interface OnboardingModalProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [educationLevel, setEducationLevel] = useState<string>('University / College');
  const [customEducationLevel, setCustomEducationLevel] = useState<string>('');

  const [useCase, setUseCase] = useState<string>('cs');
  const [customUseCase, setCustomUseCase] = useState<string>('');

  const [primaryGoal, setPrimaryGoal] = useState<string>('retention');
  const [customPrimaryGoal, setCustomPrimaryGoal] = useState<string>('');

  const [dailyGoal, setDailyGoal] = useState<number>(25);

  const educationOptions = [
    { id: 'High School', title: 'High School', desc: 'Secondary education coursework & college prep' },
    { id: 'University / College', title: 'University / College', desc: 'Undergraduate degree, exams, & core subjects' },
    { id: 'Graduate / Post-Grad', title: 'Graduate / Post-Grad', desc: 'Master’s, PhD, Medical, Law, or Specialization' },
    { id: 'Self-Learner / Professional', title: 'Self-Learner / Professional', desc: 'Career advancement, tech certifications, & skills' },
    { id: 'other', title: 'Other', desc: 'Specify custom grade level or educational institution' },
  ];

  const useCaseOptions = [
    { id: 'cs', title: 'Computer Science & Tech', desc: 'Software engineering, algorithms, data structures & system design' },
    { id: 'business', title: 'Business & Finance', desc: 'Accounting, economics, corporate finance, management' },
    { id: 'history', title: 'History & Humanities', desc: 'World history, philosophy, literature & social sciences' },
    { id: 'science', title: 'Natural Sciences', desc: 'Physics, chemistry, biology, mathematics' },
    { id: 'languages', title: 'Languages & Vocab', desc: 'Spanish, French, Japanese, German, terminology' },
    { id: 'medicine', title: 'Medicine & Health', desc: 'Anatomy, pharmacology, clinical USMLE & physiology' },
    { id: 'general', title: 'General & Custom', desc: 'Personal knowledge, trivia, certifications & general subjects' },
    { id: 'other', title: 'Other Subject', desc: 'Specify any custom topic, course, or subject you are studying' },
  ];

  const goalOptions = [
    { id: 'retention', title: 'Build Long-Term Retention', desc: 'Spaced repetition algorithms for maximum memory stability' },
    { id: 'exams', title: 'Ace Upcoming Exams', desc: 'Rapidly master high-yield topics before test day' },
    { id: 'daily_habit', title: 'Forge Daily Study Habit', desc: 'Maintain daily streak and level up XP rank' },
    { id: 'other', title: 'Other Goal', desc: 'Specify a custom study goal or learning objective' },
  ];

  const dailyGoalOptions = [10, 20, 30, 50];

  const handleNextStep = () => {
    soundEngine.playClick();
    if (step === 1 && !name.trim()) return;
    if (step < 5) {
      setStep(step + 1);
    } else {
      soundEngine.playLevelUp();
      const finalEducation = educationLevel === 'other' ? (customEducationLevel.trim() || 'Other') : educationLevel;
      const finalUseCase = useCase === 'other' ? (customUseCase.trim() || 'Other') : useCase;
      const finalGoal = primaryGoal === 'other' ? (customPrimaryGoal.trim() || 'Other') : primaryGoal;

      onComplete({
        name: name.trim() || 'Scholar',
        educationLevel: finalEducation,
        useCase: finalUseCase,
        primaryGoal: finalGoal,
        dailyGoal,
        isOnboarded: true,
      });
    }
  };

  return (
    <div id="onboarding-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-fade-in">
      <div id="onboarding-card" className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 text-zinc-100 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[480px]">
        
        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-end mb-6">
            <div className="text-xs font-mono text-zinc-400 font-medium bg-zinc-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              STEP {step} OF 5
            </div>
          </div>

          {/* STEP 1: Name Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <LumusLogo size="lg" />
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome to lumus cards
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Minimalist spaced repetition flashcard platform. Let's set up your personal profile.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  What is your name?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                  placeholder="Enter your name..."
                  autoFocus
                  className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-all text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Education Level Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                  What is your education level?
                </h2>
                <p className="text-xs text-zinc-300">
                  Select your current educational standing to customize default difficulty.
                </p>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {educationOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setEducationLevel(opt.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer hover:-translate-y-0.5 ${
                      educationLevel === opt.id
                        ? 'bg-white/10 backdrop-blur-md text-white border-white/30 shadow-md'
                        : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{opt.title}</div>
                      <div className="text-xs mt-0.5 text-zinc-300">
                        {opt.desc}
                      </div>
                    </div>
                    {educationLevel === opt.id && <Check className="w-4 h-4 text-white flex-shrink-0 mt-1" />}
                  </button>
                ))}
              </div>

              {educationLevel === 'other' && (
                <div className="pt-1 animate-fade-in">
                  <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Specify Your Education / Grade Level
                  </label>
                  <input
                    type="text"
                    value={customEducationLevel}
                    onChange={(e) => setCustomEducationLevel(e.target.value)}
                    placeholder="e.g. Middle School, Boot Camp, Certification..."
                    autoFocus
                    className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 text-xs font-medium"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Subject Domain Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                  Hi {name}, what subject are you studying?
                </h2>
                <p className="text-xs text-zinc-300">
                  Choose your main focus topic for custom AI card generation.
                </p>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {useCaseOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setUseCase(opt.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer hover:-translate-y-0.5 ${
                      useCase === opt.id
                        ? 'bg-white/10 backdrop-blur-md text-white border-white/30 shadow-md'
                        : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{opt.title}</div>
                      <div className="text-xs text-zinc-300 mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                    {useCase === opt.id && <Check className="w-4 h-4 text-white flex-shrink-0 mt-1" />}
                  </button>
                ))}
              </div>

              {useCase === 'other' && (
                <div className="pt-1 animate-fade-in">
                  <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Specify Subject / What You Are Studying
                  </label>
                  <input
                    type="text"
                    value={customUseCase}
                    onChange={(e) => setCustomUseCase(e.target.value)}
                    placeholder="e.g. Organic Chemistry, Aviation, Law, Psychology..."
                    autoFocus
                    className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 text-xs font-medium"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Primary Goal & Daily Cards Target */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                  What is your primary goal?
                </h2>
                <p className="text-xs text-zinc-300">
                  Set your primary goal and daily card review target for active practice.
                </p>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setPrimaryGoal(opt.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer hover:-translate-y-0.5 ${
                      primaryGoal === opt.id
                        ? 'bg-white/10 backdrop-blur-md text-white border-white/30 shadow-md'
                        : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{opt.title}</div>
                      <div className="text-xs text-zinc-300 mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                    {primaryGoal === opt.id && <Check className="w-4 h-4 text-white flex-shrink-0 mt-1" />}
                  </button>
                ))}
              </div>

              {primaryGoal === 'other' && (
                <div className="pt-0.5 animate-fade-in">
                  <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Specify Your Goal
                  </label>
                  <input
                    type="text"
                    value={customPrimaryGoal}
                    onChange={(e) => setCustomPrimaryGoal(e.target.value)}
                    placeholder="e.g. Master 500 Spanish verbs, Pass CPA exam..."
                    autoFocus
                    className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 text-xs font-medium"
                  />
                </div>
              )}

              <div className="pt-1">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Daily Card Target
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {dailyGoalOptions.map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        soundEngine.playClick();
                        setDailyGoal(count);
                      }}
                      className={`py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer hover:-translate-y-0.5 ${
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

          {/* STEP 5: Ready to Start */}
          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Ready to Start Studying
                </h2>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                  Your clean workspace is ready. Create or generate custom decks to begin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setStep(step - 1);
              }}
              className="btn-premium btn-premium-dark px-4 py-2 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNextStep}
            disabled={step === 1 && !name.trim()}
            className={`btn-premium btn-premium-white px-6 py-2.5 text-xs ${
              step === 1 && !name.trim() ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            {step === 5 ? (
              <>
                <span>Start Workspace</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
