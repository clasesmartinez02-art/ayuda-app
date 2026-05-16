'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getEarnedBadges, getNextBadges, type Badge } from '@/lib/badges';
import { 
  Trophy, 
  Flame, 
  Heart, 
  Star,
  Settings,
  LogOut,
  ChevronRight,
  MessageCircle,
  Headphones,
  Users,
  Lock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmotionalAvatar } from '@/components/emotional-avatar';

export default function PerfilPage() {
  const router = useRouter();
  const { user, level, levelName, xp, currentEmotion, setRole, stats, setUser, setOnboarded } = useAppStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editInterests, setEditInterests] = useState(user?.interests?.join(', ') || '');
  const [editPersonality, setEditPersonality] = useState(user?.personality?.join(', ') || '');
  const [editGoals, setEditGoals] = useState(user?.goals?.join(', ') || '');

  const saveProfileSettings = () => {
    if (user) {
      setUser({
        ...user,
        interests: editInterests.split(',').map(s => s.trim()).filter(Boolean),
        personality: editPersonality.split(',').map(s => s.trim()).filter(Boolean),
        goals: editGoals.split(',').map(s => s.trim()).filter(Boolean),
      });
      // Force sync is handled by setUser indirectly, but let's call it manually if we could. Since we don't expose syncWithSupabase easily, setUser updates the state.
    }
    setShowSettings(false);
  };

  const roleLabels: Record<string, string> = {
    hablar: 'Quiero hablar',
    escuchar: 'Quiero escuchar',
    ambos: 'Quiero ambas',
  };

  const earnedBadges = getEarnedBadges(stats);
  const nextBadges = getNextBadges(stats, 3);

  const statCards = [
    { label: 'Días seguidos', value: String(stats.daysActive), icon: Flame, color: 'text-orange-500' },
    { label: 'Ejercicios', value: String(stats.breathingCompleted + stats.groundingCompleted), icon: Star, color: 'text-yellow-500' },
    { label: 'Apoyo dado', value: String(stats.messagesInRooms), icon: Heart, color: 'text-red-500' },
    { label: 'Nivel', value: levelName, icon: Trophy, color: 'text-primary' },
  ];

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refugio_xp');
      localStorage.removeItem('refugio_stats');
      localStorage.removeItem('refugio_user_role');
      localStorage.removeItem('refugio_onboarded');
      localStorage.removeItem('refugio_profile');
      localStorage.removeItem('refugio_emotional_state');
    }
    setUser(null);
    setOnboarded(false);
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent p-1 shadow-xl">
            <div className="w-full h-full rounded-[1.4rem] bg-background flex items-center justify-center overflow-hidden">
              <EmotionalAvatar size="xl" type="silhouette" className="w-full h-full" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px] border-4 border-background">
            {level}
          </div>
        </motion.div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">{user?.alias || 'Explorador'}</h1>
          <p className="text-muted-foreground text-sm font-light">{levelName} • {xp} XP totales</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              {user?.role ? roleLabels[user.role] : 'Explorador de Calma'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowSettings(true)}
          className="ml-auto p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* El Jardín de Paz (Gamification Visualization) */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-lg font-medium text-foreground">Tu Jardín de Paz</h2>
          <span className="text-xs text-primary hover:underline cursor-pointer">Ver evolución</span>
        </div>
        <div className="glass-strong rounded-3xl p-8 aspect-video relative overflow-hidden flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_bottom,rgba(var(--primary),0.1)_0%,transparent_70%)]">
          {/* Dynamic Garden based on level */}
          <div className="relative w-full h-full flex items-end justify-center gap-4">
            {level >= 1 && (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-24 bg-gradient-to-t from-emerald-900 to-emerald-500/50 rounded-full blur-sm"
              />
            )}
            {level >= 2 && (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="w-20 h-40 bg-gradient-to-t from-primary/80 to-primary/20 rounded-full blur-md"
              />
            )}
            {level >= 3 && (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="w-16 h-32 bg-gradient-to-t from-accent/80 to-accent/20 rounded-full blur-sm"
              />
            )}
            {level >= 4 && (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="w-10 h-20 bg-gradient-to-t from-yellow-600/60 to-yellow-400/20 rounded-full blur-sm"
              />
            )}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
            <div className="text-center space-y-2 px-6">
              <p className="text-foreground font-light">
                {level <= 1 ? 'Tu jardín está empezando a brotar.' : 
                 level <= 3 ? 'Tu jardín está creciendo. Sigue así.' : 
                 'Tu jardín florece con fuerza. Eres inspiración.'}
              </p>
              <p className="text-muted-foreground text-xs">Completa ejercicios para que crezca.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tu Perfil de Calma (Personality Analysis Results) */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Tu Perfil de Calma
        </h2>
        <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-6">
          {/* Interests */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Temas que te importan</p>
            <div className="flex flex-wrap gap-2">
              {user?.interests?.map(interest => (
                <span key={interest} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  #{interest}
                </span>
              )) || <p className="text-xs text-muted-foreground italic">No seleccionados</p>}
            </div>
          </div>

          {/* Personality Traits */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tu esencia</p>
            <div className="flex flex-wrap gap-2">
              {user?.personality?.map(trait => (
                <span key={trait} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                  {trait}
                </span>
              )) || <p className="text-xs text-muted-foreground italic">No seleccionados</p>}
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tu búsqueda hoy</p>
            <div className="flex flex-wrap gap-2">
              {user?.goals?.map(goal => (
                <div key={goal} className="px-4 py-2 rounded-2xl bg-secondary/30 border border-white/5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-foreground font-medium">{goal}</span>
                </div>
              )) || <p className="text-xs text-muted-foreground italic">No seleccionados</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-4 flex items-center gap-4"
          >
            <div className={cn("p-2.5 rounded-xl bg-secondary/50", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Earned Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Insignias Ganadas
          </h2>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {earnedBadges.length} de {earnedBadges.length + nextBadges.length + (getNextBadges(stats, 100).length - nextBadges.length)}
          </span>
        </div>
        
        {earnedBadges.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center space-y-3">
            <div className="text-4xl opacity-20">🏆</div>
            <p className="text-muted-foreground text-sm font-light italic">
              Aún no has ganado insignias. ¡Sigue adelante!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {earnedBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4 flex items-center gap-3 border border-primary/10"
              >
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <p className="text-sm font-bold text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Next Badges */}
      {nextBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Próximas insignias
          </h2>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">84</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Empatía</p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-xl font-bold text-foreground">12h</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Escucha</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">256</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Luz</p>
            </div>
          </div>
          <div className="space-y-2">
            {nextBadges.map((badge) => (
              <div key={badge.id} className="glass rounded-2xl p-4 flex items-center gap-4 opacity-60">
                <div className="text-2xl grayscale">{badge.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.requirement}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Role Switcher */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground px-1">¿Cómo quieres conectar hoy?</h2>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'hablar', label: 'Necesito hablar', icon: MessageCircle, desc: 'Busco a alguien que me escuche' },
            { id: 'escuchar', label: 'Quiero escuchar', icon: Headphones, desc: 'Deseo apoyar a otros' },
            { id: 'ambos', label: 'Ambos', icon: Users, desc: 'Abierto/a a cualquier conexión' },
          ].map((roleOption) => (
            <button
              key={roleOption.id}
              onClick={() => setRole(roleOption.id as any)}
              className={cn(
                "w-full glass rounded-2xl p-4 flex items-center gap-4 transition-all border text-left",
                user?.role === roleOption.id 
                  ? "bg-primary/20 border-primary/40" 
                  : "hover:bg-secondary/30 border-transparent"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                user?.role === roleOption.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <roleOption.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-bold", user?.role === roleOption.id ? "text-primary" : "text-foreground")}>
                  {roleOption.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{roleOption.desc}</p>
              </div>
              {user?.role === roleOption.id && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Login prompt (if guest) */}
      {(!user || user.id === 'local') && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push('/login')}
          className="w-full py-4 rounded-2xl bg-primary/20 border border-primary/30 text-primary font-medium flex items-center justify-center gap-3 hover:bg-primary/30 transition-all"
        >
          <Lock className="w-5 h-5" />
          Iniciar sesión para guardar tu progreso
        </motion.button>
      )}

      {/* Logout */}
      <div className="relative">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 rounded-2xl bg-destructive/10 text-destructive font-medium flex items-center justify-center gap-3 hover:bg-destructive/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {user && user.id !== 'local' ? 'Cerrar sesión' : 'Reiniciar progreso'}
        </button>

        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-0 right-0 mb-2 glass-strong rounded-2xl p-5 border border-destructive/20 shadow-xl space-y-4"
            >
              <p className="text-sm text-foreground font-medium text-center">
                ¿Estás seguro/a? {user && user.id !== 'local' ? 'Se cerrará tu sesión.' : 'Se borrará tu progreso local.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-medium hover:bg-secondary/80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-destructive text-white font-medium hover:bg-destructive/90 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-strong rounded-[2rem] p-6 w-full max-w-md border border-white/10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Editar Perfil de Calma</h3>
                <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Temas que te importan (separados por coma)</label>
                  <input 
                    type="text" 
                    value={editInterests} 
                    onChange={e => setEditInterests(e.target.value)} 
                    placeholder="Ej. Ansiedad, Trabajo, Relaciones"
                    className="w-full bg-secondary/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Tu esencia (separados por coma)</label>
                  <input 
                    type="text" 
                    value={editPersonality} 
                    onChange={e => setEditPersonality(e.target.value)} 
                    placeholder="Ej. Reflexivo, Introvertido, Empático"
                    className="w-full bg-secondary/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Tu búsqueda hoy (separados por coma)</label>
                  <input 
                    type="text" 
                    value={editGoals} 
                    onChange={e => setEditGoals(e.target.value)} 
                    placeholder="Ej. Paz mental, Desahogo, Escuchar"
                    className="w-full bg-secondary/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>
              <button 
                onClick={saveProfileSettings}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
              >
                Guardar Cambios
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
