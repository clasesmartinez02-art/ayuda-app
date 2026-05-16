'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { emotions, type EmotionKey, emotionKeys } from '@/lib/emotions';
import { cn } from '@/lib/utils';
import { Save, X, Mail } from 'lucide-react';

interface DiaryEditorProps {
  mode: 'diary' | 'letter';
  onSave: (data: {
    content: string;
    emotion: EmotionKey | null;
    type: 'diary' | 'letter';
    recipient?: string;
  }) => void;
  onCancel?: () => void;
  className?: string;
}

export function DiaryEditor({ mode, onSave, onCancel, className }: DiaryEditorProps) {
  const { currentEmotion } = useAppStore();
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey | null>(currentEmotion);
  const [recipient, setRecipient] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      content: content.trim(),
      emotion: selectedEmotion,
      type: mode,
      recipient: mode === 'letter' ? recipient : undefined,
    });
    setContent('');
    setRecipient('');
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Letter recipient */}
      {mode === 'letter' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Para..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 text-lg font-light focus:outline-none border-b border-border/30 pb-2"
          />
        </motion.div>
      )}

      {/* Editor */}
      <div className="glass rounded-2xl p-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaInput}
          placeholder={
            mode === 'letter'
              ? 'Escribe lo que necesitas decir...'
              : 'Hoy me siento...'
          }
          className="w-full bg-transparent px-5 py-4 text-foreground/90 placeholder:text-muted-foreground/30 resize-none focus:outline-none text-base leading-relaxed font-light"
          style={{ minHeight: '200px' }}
        />
      </div>

      {/* Emotion tags */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs px-1">¿Cómo se siente esto?</p>
        <div className="flex flex-wrap gap-2">
          {emotionKeys.map((key) => {
            const emotion = emotions[key];
            const isSelected = selectedEmotion === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedEmotion(isSelected ? null : key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all',
                  isSelected
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <span>{emotion.icon}</span>
                <span>{emotion.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-muted-foreground/40 text-xs">
          {content.length} caracteres
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm transition-all"
            >
              Cancelar
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm hover:bg-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
