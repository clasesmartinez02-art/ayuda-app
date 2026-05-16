'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Wind, 
  Waves, 
  ShieldAlert, 
  Clock, 
  Heart,
  ArrowRight,
  Loader2,
  X,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { BreathingExercise } from '@/components/breathing-exercise';
import Link from 'next/link';

export default function ZonaCalmaPage() {
  const [activeMode, setActiveMode] = useState<'normal' | 'emergency' | 'timer'>('normal');
  const [panicLevel, setPanicLevel] = useState(0);

  const startEmergency = () => {
    haptic.error();
    setActiveMode('emergency');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Breathing Background Pulse for Anxiety */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,var(--anxiety)_0%,transparent_70%)]"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            Zona Calma
          </h1>
          <p className="text-xs text-muted-foreground">Tu kit de herramientas para frenar el estrés y la ansiedad.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'normal' && (
          <motion.div
            key="normal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* SOS Button */}
            <button
              onClick={startEmergency}
              className="w-full glass-strong rounded-[2.5rem] p-8 border border-destructive/30 relative overflow-hidden group bg-destructive/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-destructive/20 flex items-center justify-center text-destructive animate-pulse">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-destructive">MODO SOS</h3>
                  <p className="text-xs text-muted-foreground">Úsalo si sientes que pierdes el control ahora.</p>
                </div>
                <ArrowRight className="w-6 h-6 text-destructive ml-auto" />
              </div>
            </button>

            {/* Anxiety Tools Grid */}
            <div className="grid grid-cols-1 gap-4">
              <Link href="/ambiente" className="glass rounded-3xl p-6 flex items-center gap-4 hover:bg-primary/5 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Sonidos Calmantes</h3>
                  <p className="text-[10px] text-muted-foreground">Lluvia, olas y ruido blanco para bajar el ruido mental.</p>
                </div>
              </Link>

              <div className="glass rounded-3xl p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Wind className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Respiración Guiada</h3>
                    <p className="text-[10px] text-muted-foreground">Técnicas 4-7-8 y cuadrada.</p>
                  </div>
                </div>
                <BreathingExercise />
              </div>
            </div>
          </motion.div>
        )}

        {activeMode === 'emergency' && (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] bg-background p-6 flex flex-col items-center justify-center space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Estamos aquí</h2>
              <p className="text-muted-foreground">Sigue mi voz y estas instrucciones sencillas.</p>
            </div>

            {/* Steps for panic attack */}
            <div className="w-full max-w-sm space-y-4">
              {[
                "Pon tus pies firmes en el suelo.",
                "Nombra 3 cosas que ves ahora mismo.",
                "Toca algo que esté cerca de ti.",
                "Inhala en 4, mantén 4, exhala en 4."
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.5 }}
                  className="glass rounded-2xl p-5 flex items-center gap-4 border border-primary/20"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium">{step}</p>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setActiveMode('normal')}
              className="mt-8 px-8 py-4 rounded-2xl bg-secondary text-foreground font-bold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Ya me siento mejor
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
