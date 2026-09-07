import React, { useEffect } from 'react';
import { Award, X, Sparkles, Trophy } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievements,
  onDismiss,
}) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      role="region"
      aria-label="Achievements Notifications"
    >
      {achievements.map((achievement) => (
        <SingleAchievementToastItem
          key={achievement.id}
          achievement={achievement}
          onDismiss={() => onDismiss(achievement.id)}
        />
      ))}
    </div>
  );
};

interface SingleItemProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const SingleAchievementToastItem: React.FC<SingleItemProps> = ({
  achievement,
  onDismiss,
}) => {
  useEffect(() => {
    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="pointer-events-auto relative overflow-hidden bg-[#0a0c0a] border-2 border-[#ffb000] text-[#e0e0e0] font-mono shadow-[0_0_25px_rgba(255,176,0,0.45)] rounded-sm animate-in slide-in-from-top-5 duration-300 select-none"
      role="alert"
      aria-live="assertive"
    >
      {/* Subtle CRT Scanlines inside toast */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-10" />

      {/* Top Gold Header Strip */}
      <div className="bg-[#241702] border-b border-[#a87400] px-3 py-1 flex items-center justify-between text-[11px] text-[#ffc844] font-bold tracking-wider relative z-20">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-[#ffd700] animate-bounce" />
          <span>★ RETRO ACHIEVEMENT UNLOCKED ★</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#ffb000] text-black font-bold px-1.5 py-0.2 text-[10px] rounded-xs">
            +{achievement.points} PTS
          </span>
          <button
            onClick={onDismiss}
            className="text-[#ffc844] hover:text-white p-0.5 transition-colors cursor-pointer"
            aria-label="Dismiss Achievement"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Achievement Body */}
      <div className="p-3 flex items-start gap-3 relative z-20">
        <div className="w-10 h-10 rounded-sm bg-[#1a1405] border border-[#ffb000] flex items-center justify-center text-xl shrink-0 shadow-[0_0_10px_rgba(255,176,0,0.3)]">
          {achievement.badge}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-bold text-[#ffdd66] tracking-wide flex items-center gap-1">
            <span>{achievement.title}</span>
            <Sparkles className="w-3 h-3 text-[#ffb000] inline shrink-0" />
          </div>
          <p className="text-[11px] sm:text-xs text-[#aaffaa] mt-1 leading-snug break-words">
            {achievement.description}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-[#888]">
            <span className="text-[#ffb000]">CATEGORY: {achievement.category.toUpperCase()}</span>
            <span>•</span>
            <span>STORED: AT&T ROM 0x3F8</span>
          </div>
        </div>
      </div>

      {/* Bottom Ticking Progress Line */}
      <div className="h-0.5 bg-[#ffb000] w-full animate-[shrink_6s_linear_forwards] opacity-80" />
    </div>
  );
};
