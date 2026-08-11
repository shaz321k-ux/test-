import React from 'react';

interface LumusLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LumusCardsIcon: React.FC<{ sizeClass?: string }> = ({ sizeClass = 'w-8 h-8' }) => {
  return (
    <div className={`relative flex items-center justify-center ${sizeClass} select-none flex-shrink-0`}>
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-purple-500/30 blur-md rounded-xl pointer-events-none" />

      {/* SVG Vector Logo matching the user's uploaded dual glowing cards */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(168,85,247,0.4)]"
      >
        <defs>
          <linearGradient id="cardGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Back Card (Tilted left) */}
        <g transform="rotate(-18, 42, 52)">
          <rect
            x="20"
            y="18"
            width="44"
            height="64"
            rx="10"
            fill="#e9d5ff"
            fillOpacity="0.85"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
        </g>

        {/* Front Card (Stacked front, tilted right) */}
        <g transform="rotate(6, 56, 50)">
          <rect
            x="32"
            y="16"
            width="46"
            height="66"
            rx="11"
            fill="url(#cardGlowGrad)"
            stroke="#ffffff"
            strokeWidth="3"
            filter="drop-shadow(0px 6px 10px rgba(0, 0, 0, 0.25))"
          />

          {/* 4-Point Sparkle Star Symbol Cutout in center of front card */}
          <path
            d="M55 35 C55 44 51 49 42 49 C51 49 55 54 55 63 C55 54 59 49 68 49 C59 49 55 44 55 35 Z"
            fill="url(#starGrad)"
          />
        </g>
      </svg>
    </div>
  );
};

export const LumusLogo: React.FC<LumusLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LumusCardsIcon sizeClass={iconSize} />

      {!iconOnly && (
        <div className="flex items-center whitespace-nowrap">
          <span
            className={`${textSize} font-bold text-white tracking-tight lowercase`}
            style={{ fontFamily: "'Comfortaa', 'Quicksand', system-ui, sans-serif" }}
          >
            lumus cards
          </span>
        </div>
      )}
    </div>
  );
};
