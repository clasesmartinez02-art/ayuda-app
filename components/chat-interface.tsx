'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Send, Mic, Square, ShieldAlert, Flag } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getUserEmotionalContext, formatContextForAI } from '@/lib/ai-memory';
import { haptic } from '@/lib/haptics';
import type { ChatMessage } from '@/lib/storage';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, emotionalContext?: string) => void;
  isTyping?: boolean;
  placeholder?: string;
  className?: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shrink-0">
        <span className="text-sm">🌙</span>
      </div>
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}

export function ChatInterface({
  messages,
  onSendMessage,
  isTyping = false,
  placeholder = 'Escribe lo que sientes...',
  className = '',
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { user } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async () => {
    if (input.trim() && !isTyping) {
      if (isRecording) toggleRecording(); // Stop recording if user hits send
      
      // Detect intensity/stress in message
      const isIntense = /!|AH|AYUDA|POR FAVOR|URGENTE|PANICO|MORIR|MIEDO/i.test(input) || input.length > 200;
      
      if (isIntense) {
        haptic.medium();
      }

      let emotionalContext = '';
      if (user?.id && user.id !== 'local') {
        const context = await getUserEmotionalContext(user.id);
        emotionalContext = formatContextForAI(context);
      }
      
      onSendMessage(input.trim(), emotionalContext);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('El reconocimiento de voz no está soportado en tu navegador.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onstart = () => setIsRecording(true);
      
      let finalTranscript = input;
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += (finalTranscript ? ' ' : '') + transcript;
            setInput(finalTranscript);
          } else {
            interimTranscript += transcript;
            setInput(finalTranscript + (finalTranscript ? ' ' : '') + interimTranscript);
          }
        }
        
        // Auto resize textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (timestamp?: string | Date) => {
    try {
      if (!timestamp) return 'Ahora';
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return 'Ahora';
      return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Ahora';
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 && !isTyping && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center space-y-4 px-6">
              <div className="text-5xl">🌙</div>
              <p className="text-muted-foreground text-lg font-light">
                Estoy aquí para escucharte.
              </p>
              <p className="text-muted-foreground/60 text-sm">
                Puedes contarme cualquier cosa. Todo queda entre nosotros.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex items-start gap-3 px-2 relative group',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm">🌙</span>
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary/20 border border-primary/10 rounded-tr-md text-foreground'
                    : 'glass rounded-tl-md text-foreground/90'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content || ((msg as any).parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' '))}
                </p>
                <p className={cn(
                  'text-[10px] mt-1.5',
                  msg.role === 'user' ? 'text-primary/50 text-right' : 'text-muted-foreground/40'
                )}>
                  {formatTime((msg as any).createdAt || msg.timestamp)}
                </p>
                
                {/* Report Action */}
                <button 
                  onClick={() => { haptic.error(); alert('Mensaje reportado para revisión de moderación.'); }}
                  className={cn(
                    "absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-destructive",
                    msg.role === 'user' ? "-left-2" : "-right-2"
                  )}
                >
                  <Flag className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 p-3 border-t border-border/30">
        <div className="flex items-end gap-2">
          <div className="flex-1 glass rounded-2xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0',
              isRecording
                ? 'bg-destructive/20 text-destructive border border-destructive/30'
                : 'bg-secondary/50 text-muted-foreground'
            )}
          >
            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={(!input.trim() && !isRecording) || isTyping}
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0',
              (input.trim() || isRecording) && !isTyping
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-secondary text-muted-foreground opacity-50'
            )}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
