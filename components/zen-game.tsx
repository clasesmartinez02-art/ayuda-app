'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { Sparkles, X, Trophy } from 'lucide-react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  word: string;
}

const stressWords = [
  'Preocupación', 'Ansiedad', 'Miedo', 'Estrés', 'Tensión', 
  'Duda', 'Ruido', 'Presión', 'Pasado', 'Futuro', 'Juicio'
];

export function ZenGame() {
  const { addXP, incrementStat } = useAppStore();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  const spawnBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const size = Math.random() * 60 + 60;
    const x = Math.random() * (window.innerWidth - size);
    const y = window.innerHeight + 100;
    const color = `oklch(${0.6 + Math.random() * 0.2} ${0.1 + Math.random() * 0.1} ${200 + Math.random() * 100} / 0.4)`;
    const word = stressWords[Math.floor(Math.random() * stressWords.length)];
    
    setBubbles(prev => [...prev, { id, x, y, size, color, word }]);
  }, []);

  useEffect(() => {
    if (!gameActive) return;
    const interval = setInterval(spawnBubble, 1200);
    return () => clearInterval(interval);
  }, [gameActive, spawnBubble]);

  const popBubble = (id: number) => {
    haptic.light();
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
    addXP(1);
    
    if (score > 0 && score % 10 === 0) {
      incrementStat('totalXP', 5); // Bonus
    }
  };

  const startGame = () => {
    setScore(0);
    setBubbles([]);
    setGameActive(true);
  };

  return (
    <div className="relative w-full h-[60vh] overflow-hidden rounded-[2.5rem] glass-strong border border-primary/20 bg-black/20">
      <AnimatePresence>
        {!gameActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 z-10"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl animate-breathe">
              🫧
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Burbujas de Calma</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Toca las burbujas para liberar pensamientos estresantes. 
                Relájate con el movimiento y el sonido visual.
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              Comenzar
            </button>
          </motion.div>
        ) : (
          <>
            {/* HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20 pointer-events-none">
              <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">{score} liberados</span>
              </div>
              <button
                onClick={() => setGameActive(false)}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground pointer-events-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bubbles */}
            {bubbles.map((bubble) => (
              <motion.button
                key={bubble.id}
                initial={{ y: window.innerHeight, x: bubble.x, opacity: 0, scale: 0.8 }}
                animate={{ 
                  y: -200, 
                  opacity: 1, 
                  scale: 1,
                  x: bubble.x + (Math.sin(bubble.id) * 50) 
                }}
                transition={{ 
                  y: { duration: 8, ease: "linear" },
                  x: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                onUpdate={(latest: any) => {
                  if (latest.y < -150) {
                    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
                  }
                }}
                onClick={() => popBubble(bubble.id)}
                className="absolute flex items-center justify-center rounded-full backdrop-blur-md border border-white/20 shadow-inner group"
                style={{ 
                  width: bubble.size, 
                  height: bubble.size, 
                  backgroundColor: bubble.color 
                }}
              >
                <span className="text-[10px] font-bold text-white/60 group-hover:text-white transition-colors px-2 text-center leading-tight uppercase tracking-tighter">
                  {bubble.word}
                </span>
                
                {/* Shine effect */}
                <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/20 rounded-full blur-[2px]" />
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Decorative background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-twinkle"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
