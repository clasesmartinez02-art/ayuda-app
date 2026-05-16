'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function EmotionalBackground() {
  const { currentEmotion } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isLateNight, setIsLateNight] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    setIsLateNight(hour >= 22 || hour <= 5);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-background">
      {/* Dynamic Ambient Gradient */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, oklch(0.15 0.05 270 / 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, oklch(0.15 0.05 300 / 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 30%, oklch(0.15 0.05 270 / 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      />

      {/* Breathing Background Layer */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.65_0.2_270/0.05)_0%,transparent_70%)]"
      />

      {/* Stars Layer */}
      <div className="absolute inset-0">
        {Array.from({ length: isLateNight ? 80 : 40 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, isLateNight ? 0.6 : 0.4, 0.1],
              scale: [1, isLateNight ? 2 : 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Mist/Neblina Layer */}
      <motion.div
        animate={{
          x: [-50, 50, -50],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full blur-sm"
            style={{
              backgroundColor: 'oklch(0.65 0.2 270 / 0.2)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Emotional Tint */}
      <AnimatePresence>
        {currentEmotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, var(--${currentEmotion}) 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
