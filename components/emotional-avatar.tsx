'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmotionalAvatarProps {
  type?: 'silhouette' | 'star' | 'cloud' | 'moon';
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function EmotionalAvatar({ 
  type = 'silhouette', 
  color = 'bg-primary', 
  size = 'md',
  className = '' 
}: EmotionalAvatarProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={cn(
      "relative rounded-3xl overflow-hidden flex items-center justify-center",
      sizeMap[size],
      color,
      className
    )}>
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]" />
      
      <AnimatePresence>
        {type === 'silhouette' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full h-full flex items-end justify-center"
          >
            {/* Abstract silhouette shape */}
            <div className="w-4/5 h-4/5 bg-background/40 rounded-t-full blur-[1px]" />
            <div className="absolute top-[20%] w-2/5 h-2/5 bg-background/60 rounded-full blur-[0.5px]" />
          </motion.div>
        )}

        {type === 'star' && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-white text-2xl"
          >
            ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glossy effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
