'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { 
  getDiaryEntries, 
  addDiaryEntry, 
  type DiaryEntry,
} from '@/lib/storage';
import { type EmotionKey } from '@/lib/emotions';
import { DiaryEditor } from '@/components/diary-editor';
import { 
  BookHeart, 
  Mail, 
  Plus, 
  ChevronRight, 
  History,
  Sparkles,
  Search,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getRandomDiaryResponse, getLetterResponse } from '@/lib/ai-prompts';

type ViewMode = 'list' | 'write-diary' | 'write-letter';

export default function DiarioPage() {
  const { user, addXP, incrementStat } = useAppStore();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (user && user.id !== 'local' && supabase) {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setEntries(data.map(d => ({
          ...d,
          createdAt: d.created_at,
          aiResponse: d.ai_response
        })));
        return;
      }
    }
    setEntries(getDiaryEntries());
  };

  const handleSave = async (data: {
    content: string;
    emotion: EmotionKey | null;
    type: 'diary' | 'letter';
    recipient?: string;
  }) => {
    const response = data.type === 'letter' 
      ? getLetterResponse(data.recipient) 
      : getRandomDiaryResponse();
    
    if (user && user.id !== 'local' && supabase) {
      const { error } = await supabase
        .from('diary_entries')
        .insert([{
          user_id: user.id,
          content: data.content,
          emotion: data.emotion,
          type: data.type,
          ai_response: response,
        }]);
      
      if (!error) {
        setAiResponse(response);
        loadEntries();
      }
    } else {
      addDiaryEntry({
        ...data,
        aiResponse: response,
      });
      setAiResponse(response);
      loadEntries();
    }

    addXP(25);
    incrementStat('diaryEntries');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 pb-32">
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-light text-foreground">Tu Jardín de Palabras</h1>
              <p className="text-muted-foreground font-light italic">
                Suelta aquí lo que no puedes decir en voz alta.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setViewMode('write-diary')}
                className="glass rounded-3xl p-6 flex flex-col items-center gap-3 hover:bg-primary/10 transition-all border border-primary/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <BookHeart className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Nueva reflexión</span>
              </button>
              <button
                onClick={() => setViewMode('write-letter')}
                className="glass rounded-3xl p-6 flex flex-col items-center gap-3 hover:bg-accent/10 transition-all border border-accent/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Carta a alguien</span>
              </button>
            </div>

            {/* History Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <History className="w-3 h-3" />
                  Historias pasadas
                </h2>
                <button className="text-xs text-primary/60 hover:text-primary transition-colors">
                  Ver todas
                </button>
              </div>

              <div className="space-y-3">
                {entries.length === 0 ? (
                  <div className="glass rounded-3xl p-12 text-center space-y-4">
                    <div className="text-4xl opacity-20">🍃</div>
                    <p className="text-muted-foreground text-sm font-light italic">
                      Tu jardín aún está vacío. ¿Quieres empezar hoy?
                    </p>
                  </div>
                ) : (
                  entries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      className="glass rounded-2xl p-4 hover:bg-secondary/30 transition-all group cursor-pointer border border-white/5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
                          {entry.type === 'letter' ? '✉️' : '📖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(entry.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                            </span>
                            {entry.emotion && (
                              <span className="text-xs">{entry.emotion}</span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/80 line-clamp-2 mt-1 font-light leading-relaxed">
                            {entry.content}
                          </p>
                          {entry.aiResponse && (
                            <div className="mt-3 flex items-start gap-2 bg-primary/5 rounded-xl p-2.5">
                              <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                              <p className="text-[11px] text-primary/80 italic line-clamp-1">
                                {entry.aiResponse}
                              </p>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors mt-2" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-6"
          >
            <button
              onClick={() => {
                setViewMode('list');
                setAiResponse(null);
              }}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors mb-4"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Volver al jardín
            </button>

            {!aiResponse ? (
              <DiaryEditor 
                type={viewMode === 'write-diary' ? 'diary' : 'letter'}
                onSave={handleSave}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-[2.5rem] p-8 space-y-6 border border-primary/20 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="w-32 h-32 text-primary" />
                </div>
                
                <div className="space-y-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg">Tu Refugio te escucha</h3>
                  </div>
                  
                  <p className="text-foreground/90 leading-relaxed font-light italic text-lg">
                    &ldquo;{aiResponse}&rdquo;
                  </p>
                  
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setViewMode('list');
                        setAiResponse(null);
                      }}
                      className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      Gracias por escuchar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
