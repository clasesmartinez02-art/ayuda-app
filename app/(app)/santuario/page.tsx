'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, 
  Heart, 
  Moon, 
  Sparkles, 
  MessageSquare, 
  Users, 
  Quote,
  ArrowRight,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';

const positivePhrases = [
  "No estás solo/a en esto, estamos contigo.",
  "Está bien no estar bien. Date permiso para sentir.",
  "Tu valor no depende de tu productividad hoy.",
  "Eres más fuerte de lo que tus pensamientos te dicen.",
  "Mañana es una nueva oportunidad para intentarlo.",
  "Tu presencia en este mundo es importante.",
  "Respira profundo. Este momento también pasará."
];

export default function SantuarioPage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'refugio' | 'compania' | 'diario'>('refugio');
  const [phrase, setPhrase] = useState(positivePhrases[0]);
  const [isSilentMode, setIsSilentMode] = useState(false);

  const enterSilence = () => {
    haptic.medium();
    setIsSilentMode(true);
  };

  const exitSilence = () => {
    haptic.light();
    setIsSilentMode(false);
  };

  const changePhrase = () => {
    haptic.light();
    const next = positivePhrases[Math.floor(Math.random() * positivePhrases.length)];
    setPhrase(next);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Local Emotional Micro-animations */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Soft rain for Santuario */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            initial={{ y: -100, x: Math.random() * 100 + 'vw', opacity: 0 }}
            animate={{ y: '110vh', opacity: [0, 0.4, 0] }}
            transition={{ 
              duration: 1.5 + Math.random(), 
              repeat: Infinity, 
              ease: 'linear',
              delay: Math.random() * 2
            }}
            className="absolute w-px h-8 bg-indigo-400/40"
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CloudRain className="w-8 h-8 text-indigo-400" />
            Santuario
          </h1>
          <p className="text-xs text-muted-foreground">Un espacio para el descanso del alma y el desahogo sin juicio.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl">
        {['refugio', 'compania', 'diario'].map((tab) => (
          <button
            key={tab}
            onClick={() => { haptic.light(); setActiveTab(tab as any); }}
            className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
              activeTab === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'refugio' && (
          <motion.div
            key="refugio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Daily Support Card */}
            <div className="glass-strong rounded-[2.5rem] p-8 border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-20 h-20 text-primary" />
              </div>
              <div className="relative space-y-6">
                <p className="text-xl font-light italic leading-relaxed text-foreground/90">
                  "{phrase}"
                </p>
                <button 
                  onClick={changePhrase}
                  className="px-6 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  Necesito otra frase
                </button>
              </div>
            </div>

            {/* Quick Support Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="glass rounded-3xl p-6 text-left space-y-3 hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">Audios Relax</h3>
                <p className="text-[10px] text-muted-foreground">Melodías para momentos de vacío.</p>
              </button>
              <button className="glass rounded-3xl p-6 text-left space-y-3 hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">Mensajes de Luz</h3>
                <p className="text-[10px] text-muted-foreground">Palabras reales de otros usuarios.</p>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'compania' && (
          <motion.div
            key="compania"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-8 border border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Compañía Silenciosa</h3>
                  <p className="text-xs text-muted-foreground">Estar con otros sin la presión de hablar.</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Únete a una sala donde el único objetivo es sentir la presencia de otros. Sin chat, solo avatares que respiran juntos.
              </p>
              <button 
                onClick={enterSilence}
                className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
              >
                Entrar al Silencio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Silent Mode Overlay */}
      <AnimatePresence>
        {isSilentMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center space-y-12 p-8 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-foreground/80 tracking-widest uppercase">Compañía Silenciosa</h2>
              <p className="text-xs text-muted-foreground">Estás respirando con 12 personas en este momento.</p>
            </div>

            {/* Pulsing "Souls" */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl"
              />
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [0.8, 1.1, 0.8],
                    opacity: [0.1, 0.4, 0.1],
                    x: [0, Math.sin(i) * 30, 0],
                    y: [0, Math.cos(i) * 30, 0]
                  }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                  className="absolute w-10 h-10 rounded-full bg-primary/20 blur-xl"
                />
              ))}
              <div className="text-4xl relative z-10">🕯️</div>
            </div>

            <p className="text-sm italic text-muted-foreground max-w-xs leading-relaxed">
              "El silencio no es la ausencia de sonido, sino la presencia de paz."
            </p>

            <button
              onClick={exitSilence}
              className="px-8 py-3 rounded-2xl bg-secondary/50 text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-foreground transition-colors border border-white/5"
            >
              Salir del Silencio
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommended for you */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Recomendado para ti
        </h2>
        <div className="space-y-3">
          <Link href="/diario" className="block">
            <div className="glass rounded-2xl p-4 flex items-center gap-4 hover:bg-secondary/30 transition-all cursor-pointer border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">Escribe lo que sientes</h4>
                <p className="text-[10px] text-muted-foreground">Tu diario te espera para soltar el peso.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
