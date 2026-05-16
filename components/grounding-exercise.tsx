'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const steps = [
  { sense: 'Ver', prompt: '5 cosas que puedes ver', count: 5, icon: '👁️', color: 'text-calm' },
  { sense: 'Tocar', prompt: '4 cosas que puedes tocar', count: 4, icon: '✋', color: 'text-warm' },
  { sense: 'Escuchar', prompt: '3 cosas que puedes escuchar', count: 3, icon: '👂', color: 'text-hope' },
  { sense: 'Oler', prompt: '2 cosas que puedes oler', count: 2, icon: '👃', color: 'text-peace' },
  { sense: 'Saborear', prompt: '1 cosa que puedes saborear', count: 1, icon: '👅', color: 'text-primary' },
];

interface GroundingExerciseProps {
  onComplete?: () => void;
  className?: string;
}

export function GroundingExercise({ onComplete, className }: GroundingExerciseProps) {
  const { addXP, incrementStat } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const step = steps[currentStep];

  const handleNext = () => {
    setCompleted(prev => [...prev, currentStep]);
    if (currentStep + 1 >= steps.length) {
      setIsFinished(true);
      addXP(20);
      incrementStat('groundingCompleted');
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompleted([]);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('text-center space-y-6 py-8', className)}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl">🌿</motion.div>
        <div className="space-y-2">
          <p className="text-foreground text-xl font-light">Bien hecho.</p>
          <p className="text-muted-foreground text-sm">Estás aquí. Estás presente. Estás seguro/a.</p>
        </div>
        <button onClick={handleRestart} className="text-primary/60 text-xs hover:text-primary underline underline-offset-4 transition-colors">
          Repetir ejercicio
        </button>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all',
            completed.includes(i) ? 'bg-primary' : i === currentStep ? 'bg-primary/40' : 'bg-secondary')}>
          </div>
        ))}
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="text-center space-y-6 py-4">
          <div className="text-5xl">{step.icon}</div>
          <div className="space-y-2">
            <p className="text-foreground text-2xl font-light">{step.prompt}</p>
            <p className="text-muted-foreground text-sm">
              Mira a tu alrededor. Tómate tu tiempo.
            </p>
          </div>

          {/* Count indicators */}
          <div className="flex justify-center gap-3">
            {Array.from({ length: step.count }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30" />
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleNext}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl bg-primary/20 border border-primary/30 text-primary text-sm hover:bg-primary/30 transition-all">
            <span>Listo</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
