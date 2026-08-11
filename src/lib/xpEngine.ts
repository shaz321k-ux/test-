import { RatingType, UnlockableReward } from '../types';

export const UNLOCKABLE_REWARDS: UnlockableReward[] = [
  {
    level: 5,
    id: 'midnight_nebula',
    title: 'Midnight Nebula Theme',
    description: 'Deep cosmos ultra-sleek dark aesthetic workspace',
    type: 'theme',
    iconName: 'Moon',
  },
  {
    level: 10,
    id: 'retro_8bit_audio',
    title: '8-Bit Retro Sound Effects',
    description: 'Nostalgic arcade gaming audio feedback for card reviews',
    type: 'sound',
    iconName: 'Volume2',
  },
  {
    level: 15,
    id: 'holographic_card_back',
    title: 'Holographic Card Backs',
    description: 'Prismatic glowing edges on card flip transitions',
    type: 'card_back',
    iconName: 'Palette',
  },
  {
    level: 25,
    id: 'galaxy_brain_badge',
    title: 'Galaxy Brain Profile Badge',
    description: 'The ultimate badge of mastery to display on your profile',
    type: 'badge',
    iconName: 'Award',
  },
];

/**
 * Calculates current level from total lifetime XP.
 * Formula: XP Required for Level N = (N - 1) * 500.
 * Cumulative total XP to reach Level N = 250 * N * (N - 1)
 */
export function getLevelFromXP(totalXP: number): {
  level: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
} {
  let level = 1;
  let accumulatedXP = 0;

  while (true) {
    const xpForThisLevel = level * 500;
    if (totalXP < accumulatedXP + xpForThisLevel) {
      const xpInCurrentLevel = totalXP - accumulatedXP;
      const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpForThisLevel) * 100));
      return {
        level,
        xpInCurrentLevel,
        xpNeededForNextLevel: xpForThisLevel,
        progressPercent,
      };
    }
    accumulatedXP += xpForThisLevel;
    level++;
  }
}

/**
 * Calculate XP gained for reviewing a card.
 */
export function calculateCardXP(
  rating: RatingType,
  comboCount: number,
  answeredInSpeedrunWindow: boolean
): { baseXP: number; speedrunBonus: number; multiplier: number; totalXP: number } {
  let baseXP = 2; // Default for 'again'

  if (rating === 'easy') baseXP = 15;
  else if (rating === 'good') baseXP = 10;
  else if (rating === 'hard') baseXP = 5;
  else if (rating === 'again') baseXP = 2;

  const speedrunBonus = answeredInSpeedrunWindow ? 5 : 0;
  
  // 5+ correct in a row triggers 1.5x multiplier on base XP + bonus
  const multiplier = (rating === 'good' || rating === 'easy') && comboCount >= 5 ? 1.5 : 1.0;

  const totalXP = Math.round((baseXP + speedrunBonus) * multiplier);

  return {
    baseXP,
    speedrunBonus,
    multiplier,
    totalXP,
  };
}

/**
 * Get newly unlocked rewards based on previous level and new level
 */
export function getNewlyUnlockedRewards(prevLevel: number, newLevel: number): UnlockableReward[] {
  return UNLOCKABLE_REWARDS.filter(r => r.level > prevLevel && r.level <= newLevel);
}
