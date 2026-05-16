'use client';

import { useMemo } from 'react';

interface StarsAnimationProps {
  count?: number;
  className?: string;
}

export function StarsAnimation({ count = 40, className = '' }: StarsAnimationProps) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: 3 + Math.random() * 5,
      opacity: 0.2 + Math.random() * 0.6,
    })),
  [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
