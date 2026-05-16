'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { 
  ArrowLeft, 
  Send, 
  Shield, 
  Heart, 
  Flag,
  HandHeart,
  MessageCircle,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function PrivateChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, addXP } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchChatAndMessages = async () => {
      // Get chat details
      const { data: chat, error: chatError } = await supabase
        .from('private_chats')
        .select(`
          *,
          speaker:profiles!private_chats_speaker_id_fkey(alias, level),
          listener:profiles!private_chats_listener_id_fkey(alias, level)
        `)
        .eq('id', params.id)
        .single();

      if (chatError) {
        router.push('/inicio');
        return;
      }
      setChatInfo(chat);

      // Get messages
      const { data: msgs, error: msgsError } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('chat_id', params.id)
        .order('created_at', { ascending: true });

      if (!msgsError) setMessages(msgs);
      setLoading(false);
    };

    fetchChatAndMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `chat_id=eq.${params.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id, user, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('direct_messages').insert({
      chat_id: params.id,
      sender_id: user.id,
      content: content,
    });

    if (!error) {
      // Reward for supporting (if listener) or vulnerability (if speaker)
      addXP(10);
    }
  };

  const closeChat = async () => {
    if (confirm('¿Quieres cerrar esta sesión de apoyo?')) {
      await supabase
        .from('private_chats')
        .update({ status: 'closed' })
        .eq('id', params.id);
      router.push('/inicio');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const partner = chatInfo.speaker_id === user?.id ? chatInfo.listener : chatInfo.speaker;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-2xl mx-auto border-x border-white/5">
      {/* Header */}
      <div className="glass-strong p-4 sticky top-0 z-50 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-foreground truncate">{partner.alias}</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">En sesión contigo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => alert('Próximamente: Reportar')} className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all">
            <Flag className="w-4 h-4" />
          </button>
          <button onClick={closeChat} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="p-3 bg-primary/5 border-y border-primary/10 flex items-center gap-3">
        <Shield className="w-4 h-4 text-primary shrink-0" />
        <p className="text-[10px] text-primary/80 leading-tight">
          Esta conversación es privada y segura. Recuerda tratar a la otra persona con empatía y respeto. 
        </p>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <div className="text-center py-8 space-y-2">
          <Heart className="w-8 h-8 text-primary/20 mx-auto" />
          <p className="text-xs text-muted-foreground font-light px-12 italic">
            Has conectado con {partner.alias}. Este es un espacio seguro para ambos.
          </p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col max-w-[85%] space-y-1",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                isMe 
                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10" 
                  : "glass rounded-tl-none text-foreground border border-white/5"
              )}>
                {msg.content}
              </div>
              <span className="text-[9px] text-muted-foreground/50 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 pt-0 sticky bottom-0 bg-background/80 backdrop-blur-md">
        <div className="glass-strong rounded-2xl p-2 border border-primary/20 flex items-end gap-2 shadow-2xl">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe un mensaje empático..."
            rows={1}
            className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0",
              newMessage.trim() 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="flex justify-center items-center gap-1.5 mt-2">
          <HandHeart className="w-3 h-3 text-primary/40" />
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">Apoyo mutuo activado</p>
        </div>
      </div>
    </div>
  );
}
