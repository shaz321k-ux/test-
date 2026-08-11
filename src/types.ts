export type RatingType = 'again' | 'hard' | 'good' | 'easy';

export interface CardReviewLog {
  id: string;
  date: string;
  rating: RatingType;
  xpGained: number;
}

export interface Card {
  id: string;
  front: string;
  back: string;
  hint?: string;
  extra?: string;
  imageUrl?: string;
  tags: string[];
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  nextReviewDate: string; // ISO string
  lastReviewedDate?: string;
  reviewHistory?: CardReviewLog[];
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  coverImage?: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface StudySessionRecord {
  id: string;
  deckId: string;
  deckTitle: string;
  timestamp: string;
  cardsStudied: number;
  ratingBadge: 'Amazing' | 'Great' | 'Good' | 'Not the best';
  coverImage?: string;
}

export interface UserProfile {
  name: string;
  educationLevel: string; // 'High School' | 'University / College' | 'Graduate' | 'Self-Learner / Professional'
  useCase: string; // 'cs' | 'business' | 'history' | 'science' | 'languages' | 'medicine' | 'general'
  primaryGoal: string;
  dailyGoal: number; // number of cards
  isOnboarded: boolean;
  lifetimeXP: number; // Starts at 0
  streakDays: number;
  lastStudyDate: string;
  unlockedThemes: string[];
  activeTheme: string;
  soundPack: 'default' | 'retro8bit' | 'zen';
  cardBackStyle: 'classic' | 'holographic' | 'glowing_neon' | 'golden_minimal';
}

export type GenerationSourceType = 'photo' | 'camera' | 'video' | 'youtube' | 'text';

export interface CardGenerationRequest {
  sourceType: GenerationSourceType;
  text?: string;
  image?: string; // base64
  youtubeUrl?: string;
  videoDescription?: string;
  specialization?: string; // optional user custom prompt
  cardCount?: number;
  deckTitle?: string;
}

export interface CardGenerationResponse {
  deckTitle: string;
  description: string;
  category: string;
  tags: string[];
  cards: Array<{
    front: string;
    back: string;
    hint?: string;
    extra?: string;
    tags?: string[];
  }>;
}

export interface UnlockableReward {
  level: number;
  id: string;
  title: string;
  description: string;
  type: 'theme' | 'sound' | 'card_back' | 'badge';
  iconName: string;
}
