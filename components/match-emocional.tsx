'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { 
  Headphones, 
  MessageCircle, 
  Users, 
  Sparkles, 
  Heart,
  ChevronRight,
  Loader2,
  Moon,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { EmotionalAvatar } from './emotional-avatar';
import { haptic } from '@/lib/haptics';

export function MatchEmocional() {
  const router = useRouter();
  const { user } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availableListeners, setAvailableListeners] = useState<any[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Mock listeners for when Supabase is not available
  const mockListeners = [
    { id: 'mock-1', alias: 'Luna', level: 4, role: 'escuchar' },
    { id: 'mock-2', alias: 'Estrella', level: 12, role: 'ambos' },
    { id: 'mock-3', alias: 'Mar', level: 7, role: 'escuchar' },
  ];

  // Toggle Listener Mode
  const toggleListening = async () => {
    if (!user) return;
    const newState = !isListening;
    setIsListening(newState);
    
    if (newState) haptic.medium();
    else haptic.light();

    if (supabase) {
      await supabase
        .from('profiles')
        .update({ is_listening: newState, last_seen: new Date().toISOString() })
        .eq('id', user.id);
    }
  };

  const [isSilentAvailable, setIsSilentAvailable] = useState(false);
  const toggleSilentMode = () => {
    haptic.medium();
    setIsSilentAvailable(!isSilentAvailable);
  };

  // Find Listeners
  const findListeners = async () => {
    setSearching(true);
    
    // Artificial delay for 'searching' effect
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, alias, level, role')
        .eq('is_listening', true)
        .neq('id', user?.id)
        .limit(5);

      if (!error && data) {
        setAvailableListeners(data);
        setShowMatchModal(true);
      }
    } else {
      // Fallback to mock data
      setAvailableListeners(mockListeners);
      setShowMatchModal(true);
    }
    setSearching(false);
  };

  const startChat = async (listenerId: string) => {
    if (!user) return;
    
    if (supabase) {
      const { data, error } = await supabase
        .from('private_chats')
        .insert({
          speaker_id: user.id,
          listener_id: listenerId,
        })
        .select()
        .single();

      if (!error && data) {
        router.push(`/chat/privado/${data.id}`);
      }
    } else {
      // For mock mode, just redirect to a generic chat or show a message
      router.push(`/chat`);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Speaker Section */}
      {(user.role === 'hablar' || user.role === 'ambos') && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="glass-strong rounded-3xl p-6 border border-primary/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MessageCircle className="w-24 h-24 text-primary" />
          </div>
          
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Conexión Humana</h3>
                <p className="text-xs text-muted-foreground">Habla con alguien que desea escucharte.</p>
              </div>
            </div>

            <button
              onClick={findListeners}
              disabled={searching}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Encontrar un Oyente
            </button>
          </div>
        </motion.div>
      )}

      {/* Listener Section */}
      {(user.role === 'escuchar' || user.role === 'ambos') && (
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                isListening ? "bg-emerald-500/20 text-emerald-500" : "bg-secondary text-muted-foreground"
              )}>
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Modo Oyente</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {isListening ? "Estás disponible para escuchar" : "No estás disponible"}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleListening}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none",
                isListening ? "bg-emerald-500" : "bg-secondary"
              )}
            >
              <motion.div
                animate={{ x: isListening ? 26 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          {isListening && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-emerald-500/80 font-light italic"
            >
              Recibirás una notificación si alguien necesita tu apoyo. Gracias por estar aquí. 💚
            </motion.p>
          )}
        </div>
      )}

      {/* Silent Presence Section */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass rounded-3xl p-6 border border-indigo-500/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Moon className="w-24 h-24 text-indigo-400" />
        </div>
        
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Vínculo Silencioso</h3>
                <p className="text-xs text-muted-foreground">Estar juntos, sin palabras.</p>
              </div>
            </div>
            <button
              onClick={toggleSilentMode}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none",
                isSilentAvailable ? "bg-indigo-500" : "bg-secondary"
              )}
            >
              <motion.div
                animate={{ x: isSilentAvailable ? 26 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
          
          <button
            onClick={findListeners}
            className="w-full py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Buscar Presencia Compartida
          </button>
        </div>
      </motion.div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-strong rounded-[2.5rem] p-8 max-w-sm w-full border border-primary/30 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground">Oyentes en línea</h3>
                <button onClick={() => setShowMatchModal(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {availableListeners.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">
                    No hay oyentes disponibles en este momento. Intenta de nuevo en unos minutos.
                  </p>
                ) : (
                  availableListeners.map((listener, i) => (
                    <motion.button
                      key={listener.id}
                      whileHover={{ x: 5 }}
                      onClick={() => startChat(listener.id)}
                      className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 text-left"
                    >
                      <EmotionalAvatar 
                        size="md" 
                        type={i % 2 === 0 ? 'silhouette' : 'star'} 
                        className={i % 2 === 0 ? 'bg-primary/20' : 'bg-accent/20'} 
                      />
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{listener.alias}</p>
                        <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Nivel {listener.level}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  ))
                )}
              </div>

              <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                Recuerda que todos aquí están para apoyarte. Sé respetuoso/a. 
                Tus conversaciones son privadas y seguras.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
