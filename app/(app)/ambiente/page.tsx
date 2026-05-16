'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingExercise } from '@/components/breathing-exercise';
import { SoundMixer } from '@/components/sound-mixer';
import { StarsAnimation } from '@/components/stars-animation';
import { RainAnimation } from '@/components/rain-animation';
import { Waves, Wind, Moon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'sounds' | 'breathing' | 'night';
type BreathingPattern = 'calm' | 'box' | 'relax';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'sounds', label: 'Sonidos', icon: Waves },
  { id: 'breathing', label: 'Respiración', icon: Wind },
  { id: 'night', label: 'Noche', icon: Moon },
];

const nightMessages = [
  'No estás solo/a esta noche.',
  'La noche pasará. Tú sigues aquí.',
  'Incluso en la oscuridad, hay estrellas.',
  'Respira. Este momento es tuyo.',
  'La calma viene cuando dejas de buscarla.',
  'Mereces descansar. Mereces paz.',
  'Las mejores noches empiezan con un respiro profundo.',
  'Estoy aquí contigo, en silencio.',
];

export default function AmbientePage() {
  const [activeTab, setActiveTab] = useState<Tab>('sounds');
  const [breathingPattern, setBreathingPattern] = useState<BreathingPattern>('calm');
  const [nightMessageIdx, setNightMessageIdx] = useState(0);

  const cycleNightMessage = () => {
    setNightMessageIdx(prev => (prev + 1) % nightMessages.length);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6 relative">
      {/* Night mode overlay */}
      {activeTab === 'night' && (
        <>
          <StarsAnimation count={50} />
          <RainAnimation intensity="light" />
        </>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-calm/20 to-peace/10 flex items-center justify-center">
          <Waves className="w-5 h-5 text-calm" />
        </div>
        <div>
          <h1 className="text-xl font-medium text-foreground">Ambiente y Relajación</h1>
          <p className="text-xs text-muted-foreground">Encuentra tu calma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all flex-1 justify-center',
                activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50')}>
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'sounds' && (
          <motion.div key="sounds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SoundMixer />
          </motion.div>
        )}

        {activeTab === 'breathing' && (
          <motion.div key="breathing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6">
            {/* Pattern selector */}
            <div className="flex gap-2">
              {(['calm', 'box', 'relax'] as BreathingPattern[]).map(p => (
                <button key={p} onClick={() => setBreathingPattern(p)}
                  className={cn('flex-1 px-3 py-2 rounded-xl text-xs transition-all',
                    breathingPattern === p ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50')}>
                  {p === 'calm' ? '4-7-8' : p === 'box' ? '4-4-4-4' : 'Profunda'}
                </button>
              ))}
            </div>
            
            <div className="py-8">
              <BreathingExercise pattern={breathingPattern} />
            </div>
          </motion.div>
        )}

        {activeTab === 'night' && (
          <motion.div key="night" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8 py-8">
            {/* Night message */}
            <div className="text-center space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 1 }}
                className="text-6xl"
              >
                🌙
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={nightMessageIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl md:text-2xl font-light text-foreground/90 leading-relaxed px-4"
                >
                  {nightMessages[nightMessageIdx]}
                </motion.p>
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={cycleNightMessage}
                className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary/80 text-sm hover:bg-primary/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Otro mensaje
              </motion.button>
            </div>

            {/* Quick breathing */}
            <div className="glass rounded-2xl p-6">
              <p className="text-muted-foreground text-sm mb-4 text-center">Respira conmigo</p>
              <BreathingExercise pattern="relax" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
