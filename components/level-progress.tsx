'use client';

import { motion } from 'framer-motion';
import { useAppStore, levels } from '@/lib/store';
import { Star, Sparkles } from 'lucide-react';

export function LevelProgress() {
  const { xp, level, levelName } = useAppStore();
  
  const currentLevelData = levels[level - 1];
  const nextLevelData = levels[level] || { minXP: currentLevelData.minXP + 1000 };
  
  const xpInCurrentLevel = xp - currentLevelData.minXP;
  const xpNeededForNext = nextLevelData.minXP - currentLevelData.minXP;
  const progress = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] md:left-64 pointer-events-none">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="glass-strong rounded-2xl p-3 pointer-events-auto flex items-center gap-4 shadow-lg border border-primary/20">
          {/* Level Badge */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-inner text-xs text-center leading-tight p-1">
              LVL<br/>{level}
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-1 border border-primary/30 rounded-xl pointer-events-none"
            />
          </div>

          {/* Progress Info */}
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-primary tracking-wide uppercase">{levelName}</span>
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">
                {xp} XP
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>

          {/* XP Hint */}
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
              <Star className="w-2.5 h-2.5" />
              SIGUIENTE NIVEL
            </div>
            <div className="text-[10px] font-bold text-foreground">
              {nextLevelData.minXP - xp} XP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
