'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

type BreathingPattern = 'calm' | 'box' | 'relax';

interface BreathingExerciseProps {
  pattern?: BreathingPattern;
  className?: string;
  onComplete?: () => void;
}

const patterns: Record<BreathingPattern, {
  name: string;
  description: string;
  phases: { label: string; duration: number }[];
}> = {
  calm: {
    name: 'Respiración calmante',
    description: '4-7-8: Inhala, sostén y exhala',
    phases: [
      { label: 'Inhala', duration: 4000 },
      { label: 'Sostén', duration: 7000 },
      { label: 'Exhala', duration: 8000 },
    ],
  },
  box: {
    name: 'Respiración cuadrada',
    description: '4-4-4-4: Ritmo equilibrado',
    phases: [
      { label: 'Inhala', duration: 4000 },
      { label: 'Sostén', duration: 4000 },
      { label: 'Exhala', duration: 4000 },
      { label: 'Espera', duration: 4000 },
    ],
  },
  relax: {
    name: 'Relajación profunda',
    description: 'Respiración lenta y profunda',
    phases: [
      { label: 'Inhala', duration: 5000 },
      { label: 'Sostén', duration: 3000 },
      { label: 'Exhala', duration: 7000 },
    ],
  },
};

export function BreathingExercise({ pattern = 'calm', className, onComplete }: BreathingExerciseProps) {
  const { addXP, incrementStat } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const totalCycles = 4;
  const pat = patterns[pattern];
  const phase = pat.phases[phaseIdx];

  const scale = !isActive ? 0.7 : (phase.label === 'Exhala' ? 0.7 : 1.2);
  const opacity = !isActive ? 0.4 : (phase.label === 'Inhala' ? 1 : phase.label === 'Exhala' ? 0.5 : 0.8);

  useEffect(() => {
    if (!isActive) return;
    const sec = Math.ceil(phase.duration / 1000);
    setCountdown(sec);
    const ci = setInterval(() => setCountdown(p => (p <= 1 ? 0 : p - 1)), 1000);
    const pt = setTimeout(() => {
      const next = phaseIdx + 1;
      if (next >= pat.phases.length) {
        const nc = cycles + 1;
        setCycles(nc);
        if (nc >= totalCycles) { 
          setIsActive(false); 
          setCycles(0); 
          setPhaseIdx(0); 
          addXP(25);
          incrementStat('breathingCompleted');
          onComplete?.(); 
          return; 
        }
        setPhaseIdx(0);
      } else { setPhaseIdx(next); }
    }, phase.duration);
    return () => { clearTimeout(pt); clearInterval(ci); };
  }, [isActive, phaseIdx, cycles, phase, pat.phases.length, onComplete, addXP]);

  const toggle = () => { if (isActive) { setIsActive(false); setPhaseIdx(0); setCycles(0); } else { setIsActive(true); setPhaseIdx(0); setCycles(0); } };

  return (
    <div className={cn('flex flex-col items-center gap-8', className)}>
      <div className="relative w-52 h-52 flex items-center justify-center">
        <motion.div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, oklch(0.65 0.2 270 / 0.15) 0%, transparent 70%)' }}
          animate={{ scale: isActive ? [1, 1.3, 1] : 1, opacity: isActive ? [0.3, 0.1, 0.3] : 0.2 }}
          transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }} />
        <motion.div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/20 flex items-center justify-center"
          animate={{ scale, opacity }} transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}>
          <div className="text-center">
            {isActive ? (<><motion.p key={phase.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-primary text-lg font-light">{phase.label}</motion.p><p className="text-primary/50 text-3xl font-light mt-1">{countdown}</p></>) : (<p className="text-muted-foreground font-light text-sm">Toca para iniciar</p>)}
          </div>
        </motion.div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-foreground font-medium">{pat.name}</p>
        <p className="text-muted-foreground text-sm">{pat.description}</p>
        {isActive && <p className="text-muted-foreground/50 text-xs mt-2">Ciclo {cycles + 1} de {totalCycles}</p>}
      </div>
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={toggle}
        className={cn('px-6 py-3 rounded-2xl text-sm font-medium transition-all', isActive ? 'bg-secondary text-muted-foreground' : 'bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30')}>
        {isActive ? 'Detener' : 'Comenzar'}
      </motion.button>
    </div>
  );
}
