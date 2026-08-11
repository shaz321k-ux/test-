import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingRocketProps {
  message?: string;
  subMessage?: string;
}

export const LoadingRocket: React.FC<LoadingRocketProps> = ({
  message = "Synthesizing Flashcards...",
  subMessage = "AI model processing image visual features & key knowledge points",
}) => {
  return (
    <div id="loading-rocket-container" className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-zinc-200 shadow-lg relative overflow-hidden min-h-[300px]">
      
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-md animate-bounce">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Message Text */}
      <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-1.5">
        {message}
      </h3>
      <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
        {subMessage}
      </p>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 mt-6">
        <div className="w-2 h-2 rounded-full bg-zinc-900 animate-bounce"></div>
        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};
