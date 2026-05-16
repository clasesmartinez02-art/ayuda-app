'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getProfile } from '@/lib/storage';
import { emotions, type EmotionKey } from '@/lib/emotions';
import { EmotionSelector } from '@/components/emotion-selector';
import { MatchEmocional } from '@/components/match-emocional';
import { EmotionalAvatar } from '@/components/emotional-avatar';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  BookHeart,
  Users,
  Waves,
  AlertCircle,
  Moon,
  ChevronRight,
  Shield,
  ShieldCheck,
  Lock,
  EyeOff,
  Sparkles,
  Gamepad2,
  CloudRain,
  Zap,
  MapPin
} from 'lucide-react';

const greetings: Record<string, string> = {
  morning: 'Buenos días',
  afternoon: 'Buenas tardes', 
  evening: 'Buenas noches',
  night: 'Buenas noches',
};

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
};

const emotionalMessages: Record<string, string[]> = {
  anxious: [
    'Respira. No todo debe resolverse ahora mismo.',
    'Tu mente está haciendo mucho ruido, pero aquí hay paz.',
    'Un paso a la vez. El futuro puede esperar un momento.',
  ],
  sad: [
    'Descansar también es avanzar. Está bien pausar.',
    'Tu tristeza no es un estorbo, es parte de tu historia.',
    'Hoy solo necesitas existir. Eso es suficiente.',
  ],
  lonely: [
    'Hay personas sintiendo algo parecido ahora mismo.',
    'Estamos contigo en este silencio. No estás solo/a.',
    'Tu voz importa, incluso si solo te escuchas tú hoy.',
  ],
  default: [
    'Estás haciendo lo mejor que puedes, y eso es suficiente.',
    'Mereces momentos de paz y tranquilidad.',
    'Tus sentimientos son válidos, todos ellos.',
    'Respira. Este momento es tuyo.',
  ],
};

const quickActions = [
  {
    href: '/chat',
    icon: MessageCircle,
    label: 'Hablar con alguien',
    description: 'Chat de apoyo emocional',
    gradient: 'from-primary/20 to-accent/10',
    iconColor: 'text-primary',
  },
  {
    href: '/diario',
    icon: BookHeart,
    label: 'Escribir en mi diario',
    description: 'Espacio privado para ti',
    gradient: 'from-warm/20 to-hope/10',
    iconColor: 'text-warm',
  },
  {
    href: '/salas',
    icon: Users,
    label: 'Salas de apoyo',
    description: 'Compartir con otros',
    gradient: 'from-hope/20 to-calm/10',
    iconColor: 'text-hope',
  },
  {
    href: '/ambiente',
    icon: Waves,
    label: 'Relajarme',
    description: 'Sonidos y respiración',
    gradient: 'from-calm/20 to-peace/10',
    iconColor: 'text-calm',
  },
  {
    href: '/juego',
    icon: Gamepad2,
    label: 'Zona de Calma',
    description: 'Juego anti-estrés',
    gradient: 'from-accent/20 to-primary/10',
    iconColor: 'text-accent',
  },
];

export default function HomePage() {
  const { currentEmotion, user } = useAppStore();
  const [alias, setAlias] = useState('');
  const [message, setMessage] = useState('');
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [activeUsers, setActiveUsers] = useState(12); // Mock for presence
  const timeOfDay = getTimeOfDay();

  useEffect(() => {
    const profile = getProfile();
    if (profile) setAlias(profile.alias);
    
    const category = currentEmotion && emotionalMessages[currentEmotion] ? currentEmotion : 'default';
    const messages = emotionalMessages[category];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    // Simulate slight fluctuation in presence
    const interval = setInterval(() => {
      setActiveUsers(prev => Math.max(8, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 10000);
    return () => clearInterval(interval);
  }, [currentEmotion]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Presence Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-1"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
          {activeUsers} personas {timeOfDay === 'night' || timeOfDay === 'evening' ? 'acompañando esta noche' : 'compartiendo el refugio'}
        </p>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-light text-foreground leading-tight">
          {timeOfDay === 'night' || timeOfDay === 'evening' 
            ? 'Las madrugadas pueden ser pesadas… pero no estás solo.' 
            : greetings[timeOfDay] + (alias ? `, ${alias}.` : '.')
          }
        </h1>
        {currentEmotion && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground flex items-center gap-2 italic font-light"
          >
            <span>{emotions[currentEmotion].icon}</span>
            <span>Hoy tu corazón se siente: {emotions[currentEmotion].label.toLowerCase()}</span>
          </motion.p>
        )}
      </motion.div>

      {/* Daily Pulse Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-[2.5rem] p-8 border border-primary/20 relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Tu Pulso Diario</p>
              <h3 className="text-lg font-bold text-foreground">Un susurro para tu alma</h3>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl font-light text-foreground/90 leading-tight italic">
            &ldquo;{message}&rdquo;
          </p>

          <div className="pt-2 flex items-center gap-2 text-muted-foreground/40 text-[10px] uppercase font-bold tracking-widest">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            Personalizado para tu momento actual
          </div>
        </div>
      </motion.div>

      {/* Specialized Emotional Areas */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground px-1">¿Dónde necesitas estar hoy?</h2>
        {/* Personas Cerca Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Personas Cerca de Ti
          </h2>
          <Link href="/conexiones" className="text-xs text-primary font-bold hover:underline">Ver todas</Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {[
            { id: '1', alias: 'Luna', distance: 'A 10 min', energy: 'Nocturno', verified: true, state: 'Solo/a' },
            { id: '2', alias: 'Río', distance: 'A 15 min', energy: 'Calmado', verified: true, state: 'Ansioso/a' },
            { id: '3', alias: 'Sol', distance: 'A 5 min', energy: 'Alegre', verified: false, state: 'Disponible' },
          ].map((persona, i) => (
            <motion.div
              key={persona.id}
              whileHover={{ y: -5 }}
              className="min-w-[160px] glass rounded-[2rem] p-4 border border-white/5 space-y-3 text-center"
            >
              <div className="relative inline-block mx-auto">
                <EmotionalAvatar size="md" type={i % 2 === 0 ? 'silhouette' : 'star'} />
                {persona.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border-2 border-background">
                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{persona.alias}</p>
                <div className="flex items-center justify-center gap-1 text-[8px] text-muted-foreground uppercase font-bold tracking-widest">
                  <MapPin className="w-2 h-2" /> {persona.distance}
                </div>
              </div>
              <div className="px-2 py-1 rounded-full bg-primary/10 text-[8px] font-bold text-primary uppercase tracking-widest">
                {persona.energy}
              </div>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter animate-pulse">Disponible ahora</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Depression Card */}
          <Link href="/santuario">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-strong rounded-[2.5rem] p-8 border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group h-full"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <CloudRain className="w-20 h-20 text-indigo-400" />
              </div>
              <div className="relative space-y-4">
                <h3 className="text-2xl font-bold text-indigo-400">Santuario</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para cuando te sientes vacío, cansado o solo. Encuentra compañía silenciosa y luz.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">🌧️ Santuario</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Silencio</span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Anxiety Card */}
          <Link href="/zona-calma">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-strong rounded-[2.5rem] p-8 border border-yellow-500/20 bg-yellow-500/5 relative overflow-hidden group h-full"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-20 h-20 text-yellow-400" />
              </div>
              <div className="relative space-y-4">
                <h3 className="text-2xl font-bold text-yellow-400">Zona Calma</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para cuando el ruido es demasiado fuerte. Técnicas de respiración y anti-pánico.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest">⚡ Zona Calma</span>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest">Respira</span>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Emotion check-in */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setShowEmotionPicker(!showEmotionPicker)}
          className="w-full glass rounded-3xl p-6 text-left hover:bg-secondary/30 transition-all group border border-white/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                {currentEmotion ? emotions[currentEmotion].icon : '🕯️'}
              </div>
              <div>
                <p className="text-foreground font-medium text-lg">¿Qué está pesando en tu corazón hoy?</p>
                <p className="text-muted-foreground text-sm font-light">
                  {currentEmotion ? emotions[currentEmotion].description : 'Suelta aquí lo que sientes, sin juicios.'}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground/50 transition-transform ${showEmotionPicker ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {showEmotionPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 glass rounded-2xl p-4"
          >
            <EmotionSelector 
              size="sm" 
              onSelect={() => setShowEmotionPicker(false)}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Connection & Support */}
      <MatchEmocional />

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">
          ¿Qué necesitas hoy?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Link
                  href={action.href}
                  className={`block glass rounded-2xl p-5 hover:bg-secondary/30 transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Night mode hint */}
      {(timeOfDay === 'night' || timeOfDay === 'evening') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/ambiente"
            className="block glass rounded-2xl p-5 border border-primary/10 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 flex items-center justify-center">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Modo nocturno</p>
                <p className="text-muted-foreground text-sm">
                  Sonidos suaves y calma para esta noche
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Security & Trust Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-3xl p-6 border border-white/5 space-y-4"
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Tu espacio seguro</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">Privacidad</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Conversaciones protegidas.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <EyeOff className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">Anonimato</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Nadie sabe quién eres.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Emergency button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="pt-4"
      >
        <Link
          href="/emergencia"
          className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all"
        >
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Necesito ayuda ahora</span>
        </Link>
      </motion.div>

      {/* Emotional response */}
      {currentEmotion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 border border-primary/10"
        >
          <p className="text-foreground/80 font-light leading-relaxed">
            {emotions[currentEmotion].response}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {emotions[currentEmotion].suggestions.map((suggestion) => (
              <span
                key={suggestion}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
