import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Deck } from '../types';
import { soundEngine } from '../lib/soundEngine';
import { Plus, Camera, Search, Trash2, GraduationCap, Check, X, Tag, Layers } from 'lucide-react';

interface DeckListProps {
  decks: Deck[];
  onSelectStudy: (deck: Deck) => void;
  onBrowseDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onOpenGenerator: () => void;
  onCreateEmptyDeck: () => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  onSelectStudy,
  onBrowseDeck,
  onDeleteDeck,
  onOpenGenerator,
  onCreateEmptyDeck,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All Subjects');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Custom Subjects List
  const [subjects, setSubjects] = useState<string[]>(['All Subjects']);
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');

  // Add new custom subject handler
  const handleAddSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSubjectName.trim();
    if (
      trimmed &&
      !subjects.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())
    ) {
      soundEngine.playClick();
      setSubjects([...subjects, trimmed]);
      setFilterCategory(trimmed);
      setNewSubjectName('');
      setIsAddingSubject(false);
    }
  };

  const filteredDecks = decks.filter((deck) => {
    const matchesCategory =
      filterCategory === 'All Subjects' ||
      deck.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch =
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-8 text-zinc-100">
      
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Flashcard Decks
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Organize, study, and generate active recall cards for all your subjects
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onCreateEmptyDeck();
            }}
            className="btn-premium btn-premium-dark px-4 py-2.5"
          >
            <Plus className="w-4 h-4 text-zinc-300" />
            <span>Create Custom Deck</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenGenerator();
            }}
            className="btn-premium btn-premium-purple px-4 py-2.5"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>Photo to Cards</span>
          </button>
        </div>
      </motion.div>

      {/* Subject Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {subjects.map((subj) => {
            const isActive = filterCategory === subj;
            return (
              <button
                key={subj}
                onClick={() => {
                  soundEngine.playClick();
                  setFilterCategory(subj);
                }}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'text-zinc-950 font-black'
                    : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDeckFilterPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-md pointer-events-none"
                    transition={{ type: 'spring', stiffness: 400, damping: 33, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10">{subj}</span>
              </button>
            );
          })}

          {/* Add Subject Tab */}
          {isAddingSubject ? (
            <form
              onSubmit={handleAddSubject}
              className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md border border-purple-500 rounded-xl px-2.5 py-1 shadow-md"
            >
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Subject name..."
                autoFocus
                className="bg-transparent text-xs text-white placeholder-zinc-500 font-medium focus:outline-none w-28"
              />
              <button
                type="submit"
                className="p-1 rounded bg-purple-600 text-white hover:bg-purple-500 transition-colors cursor-pointer"
                title="Save Subject"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsAddingSubject(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-zinc-900/60 backdrop-blur-md text-zinc-400 border border-white/10 hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>Add Subject</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks..."
            className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-all font-medium"
          />
        </div>

      </div>

      {/* Grid of Decks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        
        {/* Create Deck Card Tile */}
        <div
          onClick={() => {
            soundEngine.playClick();
            onCreateEmptyDeck();
          }}
          className="glass-card border-2 border-dashed border-white/15 hover:border-purple-400/60 p-6 flex flex-col justify-between items-center text-center transition-all min-h-[260px] group cursor-pointer hover:bg-white/[0.02]"
        >
          <div className="my-auto flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-purple-300 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-400 transition-all shadow-md group-hover:scale-105">
              <Plus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Add Flashcard Deck
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                Click here to create custom flashcards or upload a photo to generate cards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full pt-4 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                onOpenGenerator();
              }}
              className="btn-premium btn-premium-purple flex-1 py-2.5 px-3"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
              <span>Photo Mode</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                onCreateEmptyDeck();
              }}
              className="btn-premium btn-premium-dark flex-1 py-2.5 px-3"
            >
              Custom Deck
            </button>
          </div>
        </div>

        {/* Existing Decks */}
        {filteredDecks.map((deck) => {
          const totalCards = deck.cards.length;
          const dueCards = deck.cards.filter(
            (c) => new Date(c.nextReviewDate) <= new Date()
          ).length;

          return (
            <motion.div
              key={deck.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6 flex flex-col justify-between min-h-[260px] relative group"
            >
              <div>
                {/* Category Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-zinc-800/80 text-purple-300 border border-white/10">
                    {deck.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    {totalCards} Cards
                  </span>
                </div>

                {/* Deck Title & Description */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-purple-300 flex items-center justify-center flex-shrink-0 font-bold group-hover:border-white/30 transition-all">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight group-hover:text-purple-300 transition-colors leading-snug">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-1">
                      {deck.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onBrowseDeck(deck);
                    }}
                    className="btn-premium btn-premium-dark px-3 py-2 text-xs"
                  >
                    Manage ({totalCards})
                  </button>

                  <button
                    onClick={() => onDeleteDeck(deck.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-zinc-800/80 cursor-pointer"
                    title="Delete Deck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectStudy(deck);
                  }}
                  disabled={totalCards === 0}
                  className={`btn-premium px-4 py-2 ${
                    totalCards === 0
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                      : 'btn-premium-purple'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Study {dueCards > 0 ? `(${dueCards})` : ''}</span>
                </button>
              </div>

            </motion.div>
          );
        })}

      </motion.div>

    </div>
  );
};
