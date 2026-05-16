'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RainDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface RainAnimationProps {
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export function RainAnimation({ intensity = 'light', className = '' }: RainAnimationProps) {
  const [drops, setDrops] = useState<RainDrop[]>([]);

  useEffect(() => {
    const dropCount = intensity === 'heavy' ? 100 : intensity === 'medium' ? 60 : 30;
    
    const newDrops: RainDrop[] = Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.3,
    }));
    
    setDrops(newDrops);
  }, [intensity]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
          style={{
            left: `${drop.left}%`,
            height: '80px',
            opacity: drop.opacity,
          }}
          initial={{ y: '-100vh', x: 0 }}
          animate={{ 
            y: '100vh',
            x: 20,
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
