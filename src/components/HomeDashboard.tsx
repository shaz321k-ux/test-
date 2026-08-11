import React from 'react';
import { motion } from 'motion/react';
import { Deck, UserProfile, StudySessionRecord } from '../types';
import { soundEngine } from '../lib/soundEngine';
import {
  TrendingUp,
  Plus,
  Smile,
  Frown,
  ArrowRight,
  GraduationCap,
  Layers,
  Camera,
} from 'lucide-react';

interface HomeDashboardProps {
  userProfile: UserProfile;
  decks: Deck[];
  studySessions: StudySessionRecord[];
  onSelectStudy: (deck: Deck) => void;
  onBrowseDeck: (deck: Deck) => void;
  onOpenGenerator: () => void;
  onNavigateToDecks: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userProfile,
  decks,
  studySessions,
  onSelectStudy,
  onBrowseDeck,
  onOpenGenerator,
  onNavigateToDecks,
}) => {
  const userName = userProfile.name || 'Student';

  // Calculate total cards studied across recorded sessions
  const totalCardsStudied = studySessions.reduce(
    (acc, s) => acc + (s.cardsStudied || 0),
    0
  );

  // Most recent 3 decks
  const recentDecks = decks.slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-9 text-zinc-100">
      
      {/* Greeting Title with Motion Fade & Rise */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hello, {userName}!
        </h1>
        <p className="text-xs text-zinc-400 font-normal mt-1">
          Welcome back to <span className="lowercase">lumus cards</span>. Here is your study overview.
        </p>
      </motion.div>

      {/* Stats Banner Container - Glass Panel with subtle border & soft shadow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        {/* Left Stats Header */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/15 flex items-center justify-center flex-shrink-0 shadow-lg">
            <TrendingUp className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Your Stats</h2>
            <p className="text-xs text-zinc-400 font-medium mt-0.5 max-w-xs leading-relaxed">
              Real-time progress tracked directly from your completed sessions.
            </p>
          </div>
        </div>

        {/* Right Metric Columns */}
        <div className="flex items-center gap-8 sm:gap-12 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0 relative z-10">
          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-black text-white leading-none font-mono">
              {userProfile.streakDays || 0}
            </div>
            <div className="text-xs font-semibold text-zinc-400 mt-1">
              Days Streak
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-black text-white leading-none font-mono">
              {decks.length}
            </div>
            <div className="text-xs font-semibold text-zinc-400 mt-1">
              Created Decks
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-black text-white leading-none font-mono">
              {totalCardsStudied}
            </div>
            <div className="text-xs font-semibold text-zinc-400 mt-1">
              Cards Studied
            </div>
          </div>
        </div>

      </motion.div>

      {/* Most Recent Decks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Most Recent Decks
          </h2>
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigateToDecks();
            }}
            className="text-xs font-extrabold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 hover:translate-x-0.5"
          >
            <span>View All Decks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Deck Cards List */}
        {recentDecks.length === 0 ? (
          <div className="glass-card p-8 text-center space-y-4">
            <div className="text-sm font-bold text-white">No flashcard decks created yet</div>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Start by taking a photo of your notes, uploading study material, or creating a custom deck.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenGenerator();
                }}
                className="btn-premium btn-premium-white px-4 py-2.5"
              >
                <Camera className="w-4 h-4" />
                <span>Photo to Cards</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onNavigateToDecks();
                }}
                className="btn-premium btn-premium-dark px-4 py-2.5"
              >
                <span>Browse Decks</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {recentDecks.map((deck) => {
              const totalCards = deck.cards.length;
              const dueCards = deck.cards.filter(
                (c) => new Date(c.nextReviewDate) <= new Date()
              ).length;

              return (
                <motion.div
                  key={deck.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  {/* Left Deck Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center flex-shrink-0 font-extrabold text-sm shadow-xs group-hover:border-white/30 transition-all">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-purple-300 transition-colors truncate">
                          {deck.title}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-white/10">
                          {deck.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium line-clamp-1 mt-1">
                        {deck.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Side Metrics & Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    
                    {/* Card Counts */}
                    <div className="flex items-center gap-5 text-center">
                      <div>
                        <div className="text-base font-black text-white font-mono leading-none">
                          {dueCards > 0 ? dueCards : totalCards}
                        </div>
                        <div className="text-[10px] font-bold text-zinc-500 mt-1">
                          To Study
                        </div>
                      </div>

                      <div>
                        <div className="text-base font-black text-white font-mono leading-none">
                          {totalCards}
                        </div>
                        <div className="text-[10px] font-bold text-zinc-500 mt-1">
                          Total Cards
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons with Lift & Icons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onSelectStudy(deck);
                        }}
                        className="btn-premium btn-premium-white px-4 py-2.5"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Study</span>
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onBrowseDeck(deck);
                        }}
                        className="btn-premium btn-premium-dark px-3.5 py-2.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Add Card</span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Study Sessions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="space-y-4 pt-2"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Recent Study Sessions
          </h2>
        </div>

        {studySessions.length === 0 ? (
          <div className="glass-card p-6 text-center text-zinc-400 text-xs">
            No study sessions completed yet. Click <strong className="text-purple-300">Study</strong> on any deck to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studySessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="glass-card p-4 flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 text-purple-300 border border-white/15 flex items-center justify-center flex-shrink-0 font-extrabold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-white truncate">
                    {session.deckTitle}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {session.timestamp}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {session.cardsStudied} cards studied
                    </span>
                    {session.ratingBadge === 'Amazing' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold">
                        <Smile className="w-3 h-3 text-emerald-400" /> Amazing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/70 text-amber-400 border border-amber-800/80 text-[10px] font-bold">
                        <Frown className="w-3 h-3 text-amber-400" /> Good
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
};
