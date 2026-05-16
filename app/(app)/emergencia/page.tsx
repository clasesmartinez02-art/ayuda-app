'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { BreathingExercise } from '@/components/breathing-exercise';
import { GroundingExercise } from '@/components/grounding-exercise';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowLeft, Phone, Heart, Wind, Eye, ShieldCheck, AlertTriangle, MapPin, PhoneCall } from 'lucide-react';

type EmergencyTab = 'breathe' | 'ground' | 'help' | 'encounter';

const supportMessages = [
  'Estoy aquí contigo. Respira.',
  'Este momento pasará. Tú eres más fuerte.',
  'No tienes que resolver nada ahora. Solo respira.',
  'Estás a salvo aquí. Nadie te juzga.',
  'Un respiro a la vez. Solo eso importa ahora.',
  'Mereces paz. Mereces estar bien.',
  'No estás solo/a. Estoy contigo.',
];

const emergencyContacts = [
  { name: 'Línea Nacional de Prevención del Suicidio', phone: '800-290-0024', country: 'México', icon: '🇲🇽' },
  { name: 'Línea 106', phone: '106', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Teléfono de la Esperanza', phone: '717-003-717', country: 'España', icon: '🇪🇸' },
  { name: 'Centro de Asistencia al Suicida', phone: '135', country: 'Argentina', icon: '🇦🇷' },
  { name: 'Línea 100', phone: '100', country: 'Perú', icon: '🇵🇪' },
  { name: 'Crisis Text Line', phone: 'Envía HOLA al 741741', country: 'Internacional', icon: '🌎' },
];

export default function EmergenciaPage() {
  const router = useRouter();
  const { setEmergencyMode } = useAppStore();
  const [activeTab, setActiveTab] = useState<EmergencyTab>('breathe');
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    setEmergencyMode(true);
    return () => setEmergencyMode(false);
  }, [setEmergencyMode]);

  // Cycle support messages
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % supportMessages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.back()}
        className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
      </motion.button>

      {/* Hero message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 py-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-warm/20 to-hope/10 border border-warm/20 flex items-center justify-center mx-auto"
        >
          <Heart className="w-8 h-8 text-warm" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={messageIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl md:text-3xl font-light text-foreground leading-relaxed"
          >
            {supportMessages[messageIdx]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'breathe' as EmergencyTab, label: 'Respirar', icon: Wind },
          { id: 'ground' as EmergencyTab, label: 'Conectar', icon: Eye },
          { id: 'help' as EmergencyTab, label: 'Ayuda', icon: Phone },
          { id: 'encounter' as EmergencyTab, label: 'SOS Encuentro', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-warm/10 text-warm border border-warm/20'
                  : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50')}>
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'breathe' && (
          <motion.div key="breathe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="py-6">
            <BreathingExercise pattern="calm" />
          </motion.div>
        )}

        {activeTab === 'ground' && (
          <motion.div key="ground" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="py-4">
            <div className="glass rounded-2xl p-6">
              <p className="text-muted-foreground text-sm text-center mb-6">
                Este ejercicio te ayuda a conectar con el presente.
              </p>
              <GroundingExercise />
            </div>
          </motion.div>
        )}

        {activeTab === 'help' && (
          <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">
            <div className="glass rounded-2xl p-4 border border-warm/10">
              <p className="text-foreground/80 text-sm font-light leading-relaxed">
                Si estás pasando por una crisis emocional severa, por favor busca ayuda profesional. 
                No tienes que enfrentar esto solo/a. 💛
              </p>
            </div>

            <div className="space-y-3">
              {emergencyContacts.map((contact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{contact.icon}</span>
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">{contact.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{contact.country}</p>
                      <a
                        href={contact.phone.startsWith('Envía') ? undefined : `tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-warm/10 text-warm text-xs hover:bg-warm/20 transition-all"
                      >
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center pt-4">
              <p className="text-muted-foreground/50 text-xs">
                Esta aplicación no reemplaza la ayuda profesional de salud mental.
              </p>
            </div>
          </motion.div>
        )}
        {activeTab === 'encounter' && (
          <motion.div key="encounter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6">
            <div className="glass rounded-3xl p-6 border border-destructive/20 bg-destructive/5 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto text-destructive animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-destructive">MODO SOS ACTIVO</h3>
                <p className="text-xs text-muted-foreground">Usa estos botones si te sientes en peligro durante un encuentro.</p>
              </div>
            </div>

            <div className="grid gap-3">
              <button className="w-full py-4 rounded-2xl bg-destructive text-white font-bold shadow-lg shadow-destructive/20 flex items-center justify-center gap-3">
                <MapPin className="w-5 h-5" />
                Compartir Ubicación Real
              </button>
              
              <a 
                href="tel:911" 
                className="w-full py-5 rounded-2xl bg-destructive border-4 border-white/20 text-white font-black text-xl flex items-center justify-center gap-3 shadow-2xl animate-pulse"
              >
                <PhoneCall className="w-7 h-7" />
                LLAMAR AL 911
              </a>

              <button className="w-full py-4 rounded-2xl bg-secondary/80 border border-destructive/30 text-destructive font-bold flex items-center justify-center gap-3">
                <PhoneCall className="w-5 h-5" />
                Alerta Rápida a Contactos
              </button>
            </div>

            <div className="glass rounded-2xl p-4 space-y-2 border border-destructive/20">
              <p className="text-[10px] uppercase font-bold tracking-widest text-destructive">Tu Ubicación para la Policía:</p>
              <div className="bg-black/20 p-3 rounded-lg font-mono text-xs text-foreground flex justify-between items-center">
                <span>Lat: 18.4861, Lon: -69.9312</span>
                <span className="text-[8px] bg-destructive/20 px-1.5 py-0.5 rounded uppercase">Copiado</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 space-y-3">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Sugerencias de Seguridad</p>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>Dirígete a un lugar con mucha gente de inmediato.</li>
                <li>Pide ayuda a personal del local (café, librería, etc).</li>
                <li>No sientas pena de irte si algo no se siente bien.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
