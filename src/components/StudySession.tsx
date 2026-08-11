import React, { useState, useEffect } from 'react';
import { Deck, Card, RatingType } from '../types';
import { soundEngine } from '../lib/soundEngine';
import { calculateCardXP } from '../lib/xpEngine';
import { Confetti } from './Confetti';
import { Clock, Flame, HelpCircle, X, CheckCircle, ArrowRight, Award } from 'lucide-react';

interface StudySessionProps {
  deck: Deck;
  cardBackStyle?: string;
  onFinishSession: (updatedDeck: Deck, sessionXPEarned: number) => void;
  onClose: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  deck,
  cardBackStyle = 'classic',
  onFinishSession,
  onClose,
}) => {
  const [queue, setQueue] = useState<Card[]>(deck.cards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  
  // Gamification tracking
  const [comboCount, setComboCount] = useState<number>(0);
  const [totalSessionXP, setTotalSessionXP] = useState<number>(0);
  const [cardsReviewedCount, setCardsReviewedCount] = useState<number>(0);
  
  // Speedrun timer (5 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [isSpeedrunValid, setIsSpeedrunValid] = useState<boolean>(true);
  
  // Session completion state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentCard = queue[currentIndex];

  // High-contrast glassmorphic flashcard styling
  const getCardThemeClasses = () => {
    return 'glass-panel text-white rounded-3xl hover:border-white/25 transition-all shadow-2xl';
  };

  // 5-second Speedrun Timer Reset on card change
  useEffect(() => {
    setTimeLeft(5);
    setIsSpeedrunValid(true);
    setIsFlipped(false);
    setShowHint(false);

    if (!currentCard) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsSpeedrunValid(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, currentCard]);

  // Handle Card SRS Rating
  const handleRate = (rating: RatingType) => {
    if (!currentCard) return;

    // Determine new combo count
    const isSuccess = rating === 'good' || rating === 'easy';
    const newCombo = isSuccess ? comboCount + 1 : 0;
    setComboCount(newCombo);

    // Calculate XP
    const { totalXP } = calculateCardXP(rating, newCombo, isSpeedrunValid);
    setTotalSessionXP((prev) => prev + totalXP);
    setCardsReviewedCount((prev) => prev + 1);

    // Audio Feedback
    if (newCombo >= 5 && newCombo % 5 === 0) {
      soundEngine.playCombo();
    } else if (rating === 'easy') {
      soundEngine.playEasy();
    } else if (rating === 'good') {
      soundEngine.playGood();
    } else if (rating === 'hard') {
      soundEngine.playHard();
    } else {
      soundEngine.playAgain();
    }

    // Spaced repetition interval updates
    let newInterval = currentCard.interval;
    let newEase = currentCard.easeFactor;
    let newRep = currentCard.repetition;

    if (rating === 'again') {
      newRep = 0;
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (rating === 'hard') {
      newInterval = Math.max(1, Math.round(newInterval * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
    } else if (rating === 'good') {
      newRep += 1;
      newInterval = Math.round(newInterval * newEase);
    } else if (rating === 'easy') {
      newRep += 1;
      newInterval = Math.round(newInterval * newEase * 1.3);
      newEase += 0.15;
    }

    const updatedCard: Card = {
      ...currentCard,
      interval: newInterval,
      repetition: newRep,
      easeFactor: newEase,
      nextReviewDate: new Date(Date.now() + newInterval * 86400000).toISOString(),
      lastReviewedDate: new Date().toISOString(),
    };

    // Update queue
    const updatedQueue = [...queue];
    updatedQueue[currentIndex] = updatedCard;

    if (rating === 'again') {
      // Re-insert missed card at end of queue
      updatedQueue.push(updatedCard);
    }

    setQueue(updatedQueue);

    // Advance to next or complete
    if (currentIndex + 1 < updatedQueue.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Queue cleared bonus!
      const clearQueueBonus = 150;
      const finalXP = totalSessionXP + totalXP + clearQueueBonus;
      setTotalSessionXP(finalXP);
      setIsCompleted(true);
      soundEngine.playLevelUp();
    }
  };

  const handleFinish = () => {
    const updatedDeck: Deck = {
      ...deck,
      cards: queue.slice(0, deck.cards.length),
      updatedAt: new Date().toISOString(),
    };
    onFinishSession(updatedDeck, totalSessionXP);
  };

  if (isCompleted || !currentCard) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-fade-in">
        <Confetti durationMs={4000} />
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center text-white shadow-2xl relative">
          
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight mb-1 text-white">Queue Cleared</h2>
          <p className="text-xs text-zinc-400 mb-6">
            Finished reviewing <span className="text-white font-bold">{deck.title}</span>
          </p>

          <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3 mb-6 text-left font-mono">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Cards Reviewed:</span>
              <span className="font-bold text-white">{cardsReviewedCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Queue Clear Bonus:</span>
              <span className="font-bold text-white">+150 XP</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
              <span className="font-bold text-white">Total Session XP:</span>
              <span className="font-bold text-white text-base">+{totalSessionXP} XP</span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="btn-premium btn-premium-white w-full py-3 text-xs"
          >
            <span>Claim Session XP</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>

        </div>
      </div>
    );
  }

  return (
    <div id="study-session-overlay" className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white animate-fade-in">
      
      {/* Top Header */}
      <div className="w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between shadow-md">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white">{deck.title}</h2>
          <span className="text-xs text-zinc-400 font-mono">
            Card {currentIndex + 1} of {queue.length}
          </span>
        </div>

        {/* Combo & Speedrun Widgets */}
        <div className="flex items-center gap-4">
          {comboCount >= 5 && (
            <div className="px-3 py-1 rounded-full bg-zinc-900/80 border border-amber-400/30 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{comboCount}x Combo (1.5x XP)</span>
            </div>
          )}

          {/* 5s Time Attack Speedrun Timer */}
          <div className="flex items-center gap-1.5 font-mono text-xs bg-zinc-900/80 border border-white/10 px-3 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className={isSpeedrunValid ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
              {timeLeft}s Speedrun
            </span>
            {isSpeedrunValid && <span className="text-[10px] text-emerald-400">(+5 XP)</span>}
          </div>

          <button
            onClick={onClose}
            className="btn-premium btn-premium-dark px-3 py-1 text-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center items-center">
        
        {/* 3D Flip Card Container */}
        <div
          onClick={() => {
            soundEngine.playFlip();
            setIsFlipped(!isFlipped);
          }}
          className="w-full min-h-[340px] cursor-pointer perspective-1000 my-auto"
        >
          <div
            className={`w-full h-full min-h-[340px] rounded-2xl p-8 sm:p-12 flex flex-col justify-between transition-transform duration-500 transform-style-3d ${getCardThemeClasses()} ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT SIDE */}
            {!isFlipped ? (
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>QUESTION / FRONT</span>
                  <span>Click or Space to reveal</span>
                </div>

                <div className="my-auto flex flex-col items-center justify-center gap-4 py-4">
                  {currentCard.imageUrl && (
                    <img
                      src={currentCard.imageUrl}
                      alt="Flashcard attachment"
                      className="max-h-48 max-w-full rounded-2xl object-contain border border-zinc-800 bg-black/50 p-1 shadow-md"
                    />
                  )}
                  <div className="text-xl sm:text-2xl font-medium tracking-tight text-white text-center leading-relaxed">
                    {currentCard.front}
                  </div>
                </div>

                {currentCard.hint && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                    {showHint ? (
                      <p className="text-xs text-zinc-300 font-mono bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Hint: {currentCard.hint}</span>
                      </p>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playClick();
                          setShowHint(true);
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-300 font-mono underline underline-offset-4"
                      >
                        Show Hint
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* BACK SIDE */
              <div className="flex flex-col justify-between h-full transform rotate-y-180">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span>ANSWER / BACK</span>
                  <span>Select recall confidence</span>
                </div>

                <div className="text-xl sm:text-2xl font-semibold tracking-tight text-white my-auto text-center leading-relaxed">
                  {currentCard.back}
                </div>

                {currentCard.extra && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400 font-mono text-center">
                    {currentCard.extra}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Anki SRS Grading Rating Buttons */}
        {isFlipped ? (
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <button
              onClick={() => handleRate('again')}
              className="p-3.5 rounded-2xl glass-panel border-red-500/40 hover:border-red-400 text-white transition-all hover:-translate-y-1 flex flex-col items-center cursor-pointer shadow-lg active:scale-95"
            >
              <span className="font-bold text-sm">Again</span>
              <span className="text-[11px] font-mono text-red-400 font-bold">+2 XP • 1d</span>
            </button>

            <button
              onClick={() => handleRate('hard')}
              className="p-3.5 rounded-2xl glass-panel border-amber-500/40 hover:border-amber-400 text-white transition-all hover:-translate-y-1 flex flex-col items-center cursor-pointer shadow-lg active:scale-95"
            >
              <span className="font-bold text-sm">Hard</span>
              <span className="text-[11px] font-mono text-amber-400 font-bold">+5 XP</span>
            </button>

            <button
              onClick={() => handleRate('good')}
              className="p-3.5 rounded-2xl glass-panel border-blue-500/40 hover:border-blue-400 text-white transition-all hover:-translate-y-1 flex flex-col items-center cursor-pointer shadow-lg active:scale-95"
            >
              <span className="font-bold text-sm">Good</span>
              <span className="text-[11px] font-mono text-blue-400 font-bold">+10 XP</span>
            </button>

            <button
              onClick={() => handleRate('easy')}
              className="p-3.5 rounded-2xl glass-panel border-emerald-500/40 hover:border-emerald-400 text-white transition-all hover:-translate-y-1 flex flex-col items-center cursor-pointer shadow-lg active:scale-95"
            >
              <span className="font-bold text-sm">Easy</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">+15 XP</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              soundEngine.playFlip();
              setIsFlipped(true);
            }}
            className="btn-premium btn-premium-purple w-full max-w-sm py-3.5 text-xs mt-6"
          >
            <span>Show Answer (Spacebar)</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>
        )}

      </div>
    </div>
  );
};
