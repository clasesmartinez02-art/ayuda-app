'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Send,
  Heart,
  HandHeart,
  MessageCircle,
  LogIn,
  Sparkles,
  Shield,
  Flag,
} from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface Room {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: number;
  gradient: string;
}

const rooms: Room[] = [
  { id: 'ansiedad', name: 'Ansiedad', description: 'Cuando la mente no para', icon: '🌀', members: 47, gradient: 'from-orange-900/30 to-red-900/20' },
  { id: 'tristeza', name: 'Tristeza', description: 'Un espacio para sentir', icon: '💧', members: 63, gradient: 'from-blue-900/30 to-slate-900/20' },
  { id: 'rupturas', name: 'Rupturas amorosas', description: 'Cuando el corazón duele', icon: '💔', members: 35, gradient: 'from-pink-900/30 to-red-900/20' },
  { id: 'soledad', name: 'Soledad', description: 'No estás solo/a aquí', icon: '🌙', members: 52, gradient: 'from-purple-900/30 to-indigo-900/20' },
  { id: 'familia', name: 'Problemas familiares', description: 'Lo que no podemos decir en casa', icon: '🏠', members: 28, gradient: 'from-teal-900/30 to-cyan-900/20' },
  { id: 'noches', name: 'Noches difíciles', description: 'Para cuando no puedes dormir', icon: '🌃', members: 41, gradient: 'from-indigo-900/30 to-violet-900/20' },
];

const roomRules = [
  '🤝 Sé amable y respetuoso/a con todos',
  '🚫 Cero bullying, ataques o discriminación',
  '🔒 Todo lo compartido aquí es confidencial',
  '💚 Solo reacciones empáticas (no hay "no me gusta")',
  '⚠️ Si alguien necesita ayuda urgente, sugiere el botón de emergencia',
];

// Toxic word filter
const toxicPatterns = [
  /idiota/i, /estúpid[oa]/i, /tont[oa]/i, /imb[eé]cil/i,
  /suicid/i, /mat[aá]r/i, /autolesion/i,
  /mier[d]?a/i, /perra/i, /put[oa]/i,
];

function containsToxicContent(text: string): boolean {
  return toxicPatterns.some(pattern => pattern.test(text));
}

// Seed messages for local mode
const seedMessages: Record<string, { user_alias: string; content: string; created_at: string }[]> = {
  ansiedad: [
    { user_alias: 'Luna', content: 'Hoy fue un día particularmente difícil. Mi mente no paraba de dar vueltas.', created_at: new Date(Date.now() - 300000).toISOString() },
    { user_alias: 'Estrella', content: 'Te entiendo Luna. A veces ayuda concentrarse en la respiración. Estamos aquí contigo 💚', created_at: new Date(Date.now() - 240000).toISOString() },
    { user_alias: 'Mar', content: 'Yo también estoy pasando por eso. No están solos.', created_at: new Date(Date.now() - 120000).toISOString() },
  ],
  tristeza: [
    { user_alias: 'Cielo', content: 'Hay días en que todo pesa más de lo normal...', created_at: new Date(Date.now() - 600000).toISOString() },
    { user_alias: 'Nube', content: 'Te abrazo a la distancia, Cielo. Está bien sentir.', created_at: new Date(Date.now() - 500000).toISOString() },
  ],
  soledad: [
    { user_alias: 'Viento', content: 'Las noches son lo más difícil. Me alegra que este espacio exista.', created_at: new Date(Date.now() - 180000).toISOString() },
  ],
};

interface Message {
  id: string | number;
  content: string;
  user_alias: string;
  created_at: string;
  room_id: string;
  reported?: boolean;
}

export default function SalasPage() {
  const router = useRouter();
  const { user, addXP, incrementStat } = useAppStore();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toxicWarning, setToxicWarning] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<string | number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages and setup realtime
  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMessages = async () => {
      setLoading(true);

      if (supabase) {
        const { data, error } = await supabase
          .from('room_messages')
          .select('*')
          .eq('room_id', selectedRoom.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (!error && data) {
          setMessages(data);
          setLoading(false);
          return;
        }
      }

      // Fallback to seed messages for local mode
      const seeds = seedMessages[selectedRoom.id] || [];
      setMessages(seeds.map((s, i) => ({
        ...s,
        id: `seed-${i}`,
        room_id: selectedRoom.id,
      })));
      setLoading(false);
    };

    fetchMessages();

    // Realtime subscription (only if supabase is available)
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel(`room-${selectedRoom.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'room_messages',
            filter: `room_id=eq.${selectedRoom.id}`,
          },
          (payload: any) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedRoom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    const content = newMessage.trim();

    // Moderation: check for toxic content
    if (containsToxicContent(content)) {
      haptic.error();
      setToxicWarning(true);
      setTimeout(() => setToxicWarning(false), 4000);
      return;
    }

    haptic.success();
    setNewMessage('');

    if (supabase && user.id !== 'local') {
      const { error } = await supabase.from('room_messages').insert({
        room_id: selectedRoom.id,
        user_id: user.id,
        user_alias: user.alias,
        content: content,
      });

      if (error) {
        console.error('Error sending message:', error);
        alert('Error al enviar el mensaje.');
        return;
      }
    } else {
      // Local mode: add message directly
      const localMsg: Message = {
        id: `local-${Date.now()}`,
        content,
        user_alias: user.alias,
        created_at: new Date().toISOString(),
        room_id: selectedRoom.id,
      };
      setMessages(prev => [...prev, localMsg]);
    }

    addXP(15);
    incrementStat('messagesInRooms');
  };

  const handleReport = (msgId: string | number) => {
    setReportedIds(prev => new Set(prev).add(msgId));
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (!selectedRoom) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6 pb-32">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hope/20 to-calm/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-hope" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-foreground">Salas de Apoyo</h1>
            <p className="text-xs text-muted-foreground">Comparte en tiempo real con otros</p>
          </div>
        </div>

        {!supabase && (
          <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
            <p className="text-amber-400 text-xs font-light flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              Modo local activo — Los mensajes se muestran como ejemplo. Configura Supabase para chat en vivo.
            </p>
          </div>
        )}

        <div className="glass rounded-2xl p-4 border border-primary/10">
          <p className="text-foreground/70 text-sm font-light">
            Estos espacios son seguros y anónimos. Conéctate con personas que están pasando por lo mismo que tú. 💚
          </p>
        </div>

        <div className="grid gap-3">
          {rooms.map((room, i) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedRoom(room)}
              className="w-full glass rounded-2xl p-5 text-left hover:bg-secondary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${room.gradient} flex items-center justify-center text-2xl`}>
                  {room.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors">{room.name}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">{room.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-muted-foreground/40 text-[10px] uppercase tracking-wider">{room.members} en línea</p>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 h-[calc(100vh-6rem)] md:h-screen flex flex-col">
      {/* Header */}
      <div className="shrink-0 space-y-4 mb-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRoom(null)}
            className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedRoom.icon}</span>
            <div>
              <h1 className="text-lg font-medium text-foreground">{selectedRoom.name}</h1>
              <p className="text-xs text-muted-foreground">Chat comunitario en vivo</p>
            </div>
          </div>
          <button
            onClick={() => setShowRules(!showRules)}
            className="ml-auto text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            Reglas
          </button>
        </div>

        <AnimatePresence>
          {showRules && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="glass rounded-2xl p-4 space-y-2 border border-primary/10">
                {roomRules.map((rule, i) => (
                  <p key={i} className="text-muted-foreground text-xs">{rule}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toxic content warning */}
        <AnimatePresence>
          {toxicWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-3">
                <Shield className="w-5 h-5 shrink-0" />
                <p>Tu mensaje contiene lenguaje que podría herir a otros. Recuerda que este es un espacio seguro. Reformula tu mensaje con empatía. 💛</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground font-light italic text-sm">Aún no hay mensajes aquí. Sé el primero en hablar.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "glass rounded-2xl p-4 space-y-2 border border-white/5 group relative",
                msg.user_alias === user?.alias && "border-primary/20 bg-primary/5",
                reportedIds.has(msg.id) && "opacity-40"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px]">👤</div>
                  <span className="text-foreground/90 text-xs font-bold">{msg.user_alias}</span>
                  {msg.user_alias === user?.alias && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase">Tú</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/30 text-[10px]">{formatTimeAgo(msg.created_at)}</span>
                  {msg.user_alias !== user?.alias && !reportedIds.has(msg.id) && (
                    <button
                      onClick={() => handleReport(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground/30 hover:text-amber-500"
                      title="Reportar mensaje"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              {reportedIds.has(msg.id) ? (
                <p className="text-muted-foreground/50 text-xs italic">Mensaje reportado. Gracias por ayudar a mantener este espacio seguro.</p>
              ) : (
                <p className="text-foreground/80 text-sm font-light leading-relaxed">{msg.content}</p>
              )}
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input or Login CTA */}
      <div className="shrink-0 pt-4 pb-6">
        {!user ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login')}
            className="w-full glass-strong rounded-2xl p-4 flex items-center justify-center gap-3 text-primary border border-primary/30 hover:bg-primary/10 transition-all shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            <span className="font-medium">Inicia sesión para participar</span>
          </motion.button>
        ) : (
          <div className="glass-strong rounded-2xl p-2 border border-primary/20 flex items-end gap-2 shadow-xl">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe algo empático..."
              rows={1}
              className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0',
                newMessage.trim() ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground'
              )}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        )}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Sparkles className="w-3 h-3 text-primary/40" />
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Ganas +15 XP por mensaje</p>
        </div>
      </div>
    </div>
  );
}
