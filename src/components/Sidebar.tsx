import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  Home,
  Layers,
  GraduationCap,
  Sliders,
  User,
  PanelLeftClose,
  PanelLeft,
  Camera,
} from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';
import { LumusLogo } from './LumusLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenGenerator: () => void;
  onOpenPreferences: (tab?: 'profile' | 'preferences') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onOpenGenerator,
  onOpenPreferences,
}) => {
  const handleTabClick = (tabId: string) => {
    soundEngine.playClick();
    if (tabId === 'preferences') {
      onOpenPreferences('preferences');
    } else if (tabId === 'profile') {
      onOpenPreferences('profile');
    } else {
      setActiveTab(tabId);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, isMatch: (t: string) => t === 'home' },
    { id: 'decks', label: 'Decks', icon: Layers, isMatch: (t: string) => t === 'decks' || t === 'study' },
  ];

  const settingsItems = [
    { id: 'preferences', label: 'Preferences', icon: Sliders, isMatch: (t: string) => t === 'preferences' },
    { id: 'profile', label: 'Edit Profile', icon: User, isMatch: (t: string) => t === 'profile' },
  ];

  const renderNavButton = (item: {
    id: string;
    label: string;
    icon: React.ElementType;
    isMatch: (t: string) => boolean;
  }) => {
    const isActive = item.isMatch(activeTab);
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => handleTabClick(item.id)}
        className={`relative flex items-center cursor-pointer select-none transition-colors duration-200 ${
          isCollapsed
            ? 'w-11 h-11 mx-auto justify-center rounded-2xl'
            : 'w-full gap-3.5 px-4 py-3 rounded-2xl font-extrabold text-sm'
        } ${
          isActive
            ? 'text-white'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`}
        title={item.label}
      >
        {isActive && (
          <motion.div
            layoutId="activeSidebarTabPill"
            className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-md pointer-events-none"
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 33,
              mass: 0.8,
            }}
          />
        )}
        <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
        {!isCollapsed && <span className="relative z-10">{item.label}</span>}
      </button>
    );
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-full md:w-20 px-3 py-6' : 'w-full md:w-64 p-5 sm:p-6'
      } bg-zinc-950/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between flex-shrink-0 transition-all duration-300 z-20 text-zinc-100 shadow-xl`}
    >
      <div className="flex flex-col items-stretch">
        {/* Logo Section - Lumus Cards */}
        <div
          onClick={() => handleTabClick('home')}
          className={`flex items-center mb-8 cursor-pointer select-none group transition-transform duration-200 hover:scale-[1.02] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="lumus cards"
        >
          <LumusLogo iconOnly={isCollapsed} size="lg" />
        </div>

        {/* Main Navigation Items */}
        <nav className="space-y-2">
          {navItems.map(renderNavButton)}

          {/* Settings Section Separator */}
          {!isCollapsed ? (
            <div className="pt-4 pb-1 px-4 text-[11px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
              Settings
            </div>
          ) : (
            <div className="my-2 border-t border-white/10 w-6 mx-auto" />
          )}

          {settingsItems.map(renderNavButton)}
        </nav>
      </div>

      {/* Bottom Section: Photo Action & Toggle Sidebar */}
      <div className="pt-5 border-t border-white/10 flex flex-col gap-2.5">
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenGenerator();
          }}
          className={`btn-premium btn-premium-white ${
            isCollapsed
              ? 'w-11 h-11 mx-auto rounded-2xl p-0'
              : 'w-full py-3 px-4 text-xs'
          }`}
          title="Photo to Flashcards"
        >
          <Camera className="w-4 h-4 text-zinc-950 flex-shrink-0" />
          {!isCollapsed && <span>Photo to Flashcards</span>}
        </button>

        {/* Toggle Collapse Sidebar */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className={`text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer flex items-center ${
            isCollapsed
              ? 'w-11 h-11 mx-auto justify-center rounded-2xl'
              : 'w-full gap-2.5 px-4 py-2 font-semibold text-xs rounded-2xl'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Hide sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Hide sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

