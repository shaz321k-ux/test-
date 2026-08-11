import React, { useState, useEffect } from 'react';
import { UserProfile, Deck, StudySessionRecord } from './types';
import { INITIAL_DECKS } from './data/initialDecks';
import { getLevelFromXP, getNewlyUnlockedRewards } from './lib/xpEngine';
import { soundEngine } from './lib/soundEngine';

import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { HomeDashboard } from './components/HomeDashboard';
import { DeckList } from './components/DeckList';
import { OnboardingModal } from './components/OnboardingModal';
import { CardGeneratorModal } from './components/CardGeneratorModal';
import { StudySession } from './components/StudySession';
import { DeckBrowserModal } from './components/DeckBrowserModal';
import { LevelUpModal } from './components/LevelUpModal';
import { PreferencesModal } from './components/PreferencesModal';

const STORAGE_KEY_PROFILE = 'lumuscards_user_profile_v4';
const STORAGE_KEY_DECKS = 'lumuscards_user_decks_v6';
const STORAGE_KEY_SESSIONS = 'lumuscards_user_sessions_v3';

export default function App() {
  // User Profile State - Default is NOT onboarded so popup shows up first!
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isOnboarded === 'boolean') {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: '',
      educationLevel: 'University / College',
      useCase: 'cs',
      primaryGoal: 'retention',
      dailyGoal: 25,
      isOnboarded: false,
      lifetimeXP: 0,
      streakDays: 0,
      lastStudyDate: new Date().toISOString(),
      unlockedThemes: ['minimal_dark'],
      activeTheme: 'minimal_dark',
      soundPack: 'default',
      cardBackStyle: 'classic',
    };
  });

  // Decks State
  const [decks, setDecks] = useState<Deck[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DECKS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DECKS;
  });

  // Study Sessions History - Default empty
  const [studySessions, setStudySessions] = useState<StudySessionRecord[]>(
    () => {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      return [];
    }
  );

  // Active Tab: 'home' | 'decks' | 'study'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Modals & Views
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [preferencesModalTab, setPreferencesModalTab] = useState<'profile' | 'preferences' | null>(null);
  const [activeStudyDeck, setActiveStudyDeck] = useState<Deck | null>(null);
  const [activeBrowseDeck, setActiveBrowseDeck] = useState<Deck | null>(null);

  // Level Up modal state
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    unlockedRewards: any[];
  } | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(studySessions));
  }, [studySessions]);

  // Global ASMR Creamy Keyboard Typing Sound Listener
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Ignore alone modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
        return;
      }

      const activeElement = document.activeElement;
      const isInputOrTextArea =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      // Play creamy typing sound if user is actively typing in an input/textarea or pressing typing keys
      if (isInputOrTextArea || e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Delete') {
        soundEngine.playKeypress(e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, []);

  // Handle Onboarding Completion
  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      isOnboarded: true,
    };
    setUserProfile(updated);
  };

  // Handle Study Session Completion
  const handleFinishSession = (updatedDeck: Deck, sessionXPEarned: number) => {
    const prevLevel = getLevelFromXP(userProfile.lifetimeXP).level;
    const newLifetimeXP = userProfile.lifetimeXP + sessionXPEarned;
    const newLevel = getLevelFromXP(newLifetimeXP).level;

    // Check for newly unlocked rewards
    const newlyUnlocked = getNewlyUnlockedRewards(prevLevel, newLevel);

    const updatedProfile: UserProfile = {
      ...userProfile,
      lifetimeXP: newLifetimeXP,
      streakDays: Math.max(1, userProfile.streakDays),
      lastStudyDate: new Date().toISOString(),
      unlockedThemes: [
        ...userProfile.unlockedThemes,
        ...newlyUnlocked.map((u) => u.id),
      ],
    };

    // Update Decks State
    setDecks((prevDecks) =>
      prevDecks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d))
    );

    // Record Study Session History
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} - ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRecord: StudySessionRecord = {
      id: 'session_' + Date.now(),
      deckId: updatedDeck.id,
      deckTitle: updatedDeck.title,
      timestamp: dateStr,
      cardsStudied: updatedDeck.cards.length,
      ratingBadge: sessionXPEarned >= 50 ? 'Amazing' : 'Not the best',
    };

    setStudySessions([newRecord, ...studySessions]);
    setUserProfile(updatedProfile);
    setActiveStudyDeck(null);

    // Trigger Level Up Modal if leveled up
    if (newLevel > prevLevel) {
      setLevelUpData({
        newLevel,
        unlockedRewards: newlyUnlocked,
      });
    }
  };

  // Handle Add New Manual Empty Deck
  const handleCreateEmptyDeck = () => {
    const newDeck: Deck = {
      id: 'deck_' + Date.now(),
      title: 'New Custom Deck',
      description: 'Add custom cards to build your active recall collection.',
      category: 'General',
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDecks([newDeck, ...decks]);
    setActiveBrowseDeck(newDeck);
  };

  const handleDeleteDeck = (deckId: string) => {
    soundEngine.playClick();
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  const handleUpdateDeck = (updatedDeck: Deck) => {
    setDecks((prev) =>
      prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d))
    );
    setActiveBrowseDeck(updatedDeck);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_DECKS);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    setUserProfile({
      name: '',
      educationLevel: 'University / College',
      useCase: 'cs',
      primaryGoal: 'retention',
      dailyGoal: 25,
      isOnboarded: false,
      lifetimeXP: 0,
      streakDays: 0,
      lastStudyDate: new Date().toISOString(),
      unlockedThemes: ['minimal_dark'],
      activeTheme: 'minimal_dark',
      soundPack: 'default',
      cardBackStyle: 'classic',
    });
    setDecks([]);
    setStudySessions([]);
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 font-sans antialiased selection:bg-purple-600 selection:text-white">
      
      {/* Onboarding Popup Modal */}
      {!userProfile.isOnboarded && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Main Full-Width Application Container */}
      <div className="w-full min-h-screen bg-zinc-950 flex flex-col md:flex-row">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={preferencesModalTab || activeTab}
          setActiveTab={(tab) => {
            if (tab === 'profile' || tab === 'preferences') {
              setPreferencesModalTab(tab);
            } else {
              setPreferencesModalTab(null);
              setActiveTab(tab);
            }
          }}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onOpenGenerator={() => setShowGenerator(true)}
          onOpenPreferences={(tab) => setPreferencesModalTab(tab || 'preferences')}
        />

        {/* Right Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          
          {/* Top Header Bar */}
          <HeaderBar
            userProfile={userProfile}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenPreferences={() => setPreferencesModalTab('preferences')}
          />

          {/* Main Workspace Body based on Active Tab */}
          <main className="flex-1 overflow-y-auto pb-12">
            {activeTab === 'home' && (
              <HomeDashboard
                userProfile={userProfile}
                decks={decks}
                studySessions={studySessions}
                onSelectStudy={(deck) => setActiveStudyDeck(deck)}
                onBrowseDeck={(deck) => setActiveBrowseDeck(deck)}
                onOpenGenerator={() => setShowGenerator(true)}
                onNavigateToDecks={() => setActiveTab('decks')}
              />
            )}

            {(activeTab === 'decks' || activeTab === 'study') && (
              <DeckList
                decks={decks}
                onSelectStudy={(deck) => setActiveStudyDeck(deck)}
                onBrowseDeck={(deck) => setActiveBrowseDeck(deck)}
                onDeleteDeck={handleDeleteDeck}
                onOpenGenerator={() => setShowGenerator(true)}
                onCreateEmptyDeck={handleCreateEmptyDeck}
              />
            )}
          </main>

        </div>

      </div>

      {/* AI Card Generator Modal */}
      {showGenerator && (
        <CardGeneratorModal
          onClose={() => setShowGenerator(false)}
          onDeckCreated={(newDeck) => {
            setDecks([newDeck, ...decks]);
            setShowGenerator(false);
          }}
        />
      )}

      {/* Deck Card Manager Modal */}
      {activeBrowseDeck && (
        <DeckBrowserModal
          deck={activeBrowseDeck}
          onUpdateDeck={handleUpdateDeck}
          onClose={() => setActiveBrowseDeck(null)}
        />
      )}

      {/* Active Study Session Stage */}
      {activeStudyDeck && (
        <StudySession
          deck={activeStudyDeck}
          cardBackStyle={userProfile.cardBackStyle || 'classic'}
          onFinishSession={handleFinishSession}
          onClose={() => setActiveStudyDeck(null)}
        />
      )}

      {/* RPG Level Up Celebration Modal */}
      {levelUpData && (
        <LevelUpModal
          level={levelUpData.newLevel}
          unlockedRewards={levelUpData.unlockedRewards}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {/* Preferences & Edit Profile Modal */}
      {preferencesModalTab && (
        <PreferencesModal
          userProfile={userProfile}
          initialTab={preferencesModalTab}
          onClose={() => setPreferencesModalTab(null)}
          onTabChange={(tab) => setPreferencesModalTab(tab)}
          onUpdateProfile={(updated) => {
            setUserProfile((prev) => ({ ...prev, ...updated }));
          }}
          onResetData={handleResetData}
        />
      )}

    </div>
  );
}
