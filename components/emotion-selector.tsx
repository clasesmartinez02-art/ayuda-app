'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { emotions, emotionKeys, type EmotionKey } from '@/lib/emotions';
import { useAppStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';

interface EmotionSelectorProps {
  onSelect?: (emotion: EmotionKey) => void;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmotionSelector({ 
  onSelect, 
  showLabels = true, 
  size = 'md',
  className = '' 
}: EmotionSelectorProps) {
  const { currentEmotion, setEmotion } = useAppStore();

  const handleSelect = (emotion: EmotionKey) => {
    haptic.light();
    setEmotion(emotion);
    onSelect?.(emotion);
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      {emotionKeys.map((key, index) => {
        const emotion = emotions[key];
        const isSelected = currentEmotion === key;

        return (
          <motion.button
            key={key}
            onClick={() => handleSelect(key)}
            className={cn(
              'flex flex-col items-center gap-2 p-2 rounded-2xl transition-all',
              'hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50',
              isSelected && 'bg-primary/20 ring-2 ring-primary/50'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-full',
                'bg-gradient-to-br from-secondary to-secondary/50',
                sizeClasses[size],
                isSelected && 'animate-pulse-glow'
              )}
            >
              <span role="img" aria-label={emotion.label}>
                {emotion.icon}
              </span>
            </div>
            {showLabels && (
              <div className="text-center">
                <p className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {emotion.label}
                </p>
                {size !== 'sm' && (
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {emotion.description}
                  </p>
                )}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
