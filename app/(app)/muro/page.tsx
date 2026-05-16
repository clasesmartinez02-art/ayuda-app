'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { 
  Send, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Filter,
  Loader2,
  Lock,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Post {
  id: string;
  content: string;
  author_alias: string;
  author_role: string;
  emotion_color: string;
  reactions: Record<string, number>;
  created_at: string;
}

const emotionalReactions = [
  { id: 'esperanza', emoji: '🌱', label: 'Esperanza' },
  { id: 'comprension', emoji: '💜', label: 'Comprensión' },
  { id: 'calma', emoji: '🌙', label: 'Calma' },
  { id: 'luz', emoji: '✨', label: 'Luz' },
  { id: 'acompañar', emoji: '🤝', label: 'Acompañar' },
];

export default function MuroPage() {
  const { user } = useAppStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock posts for demonstration/disconnected mode
  const mockPosts: Post[] = [
    {
      id: '1',
      content: 'Hoy logré salir a caminar después de una semana difícil. Pequeños pasos. 💚',
      author_alias: 'Esperanza',
      author_role: 'hablar',
      emotion_color: 'bg-emerald-500/20 text-emerald-500',
      reactions: { esperanza: 12, luz: 5 },
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      content: 'Si alguien necesita un recordatorio hoy: Eres suficiente y mereces paz.',
      author_alias: 'Estrella',
      author_role: 'escuchar',
      emotion_color: 'bg-primary/20 text-primary',
      reactions: { comprension: 15, calma: 8, luz: 12 },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    if (supabase) {
      const { data, error } = await supabase
        .from('public_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) {
        setPosts(data);
      } else {
        setPosts(mockPosts);
      }
    } else {
      setPosts(mockPosts);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setIsSubmitting(true);
    const postData = {
      content: newPost.trim(),
      author_alias: user.alias,
      author_role: user.role || 'hablar',
      emotion_color: 'bg-primary/20 text-primary',
      likes: 0,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { error } = await supabase
        .from('public_posts')
        .insert(postData);
      
      if (!error) {
        setNewPost('');
        fetchPosts();
      }
    } else {
      // Local addition for mock mode
      setPosts(prev => [{ ...postData, id: Math.random().toString() }, ...prev]);
      setNewPost('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Muro del Refugio
        </h1>
        <p className="text-xs text-muted-foreground">Un espacio seguro para compartir lo que sientes con la comunidad de forma anónima.</p>
      </div>

      {/* Security Banner */}
      <div className="glass rounded-2xl p-4 border border-destructive/20 flex items-center gap-4 bg-destructive/5">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <EyeOff className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Zona de Alta Privacidad</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">Las capturas de pantalla están estrictamente prohibidas aquí.</p>
        </div>
      </div>

      {/* Create Post */}
      <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-6 border border-primary/20 space-y-4">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="¿Qué tienes en mente hoy? Suéltalo aquí..."
          className="w-full bg-secondary/30 border border-border/50 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none"
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Lock className="w-3 h-3" />
            Publicación anónima
          </div>
          <button
            type="submit"
            disabled={!newPost.trim() || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-30"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Soltar
          </button>
        </div>
      </form>

      {/* Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-[2rem] p-6 space-y-4 border border-white/5 relative overflow-hidden group"
              >
                {/* Visual accent */}
                <div className={cn("absolute top-0 left-0 w-1 h-full", post.emotion_color.split(' ')[1])} />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", post.emotion_color)}>
                      {post.author_alias}
                    </div>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed font-light">
                  {post.content}
                </p>

                {/* Emotional Reactions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {emotionalReactions.map((reaction) => (
                    <motion.button
                      key={reaction.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] transition-all",
                        post.reactions[reaction.id] 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50"
                      )}
                    >
                      <span>{reaction.emoji}</span>
                      {post.reactions[reaction.id] && (
                        <span className="font-bold">{post.reactions[reaction.id]}</span>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-[10px] text-primary/60 italic">
                    <Sparkles className="w-3 h-3" />
                    Enviando luz a esta persona
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
