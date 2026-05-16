'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Type, 
  Moon, 
  Sun, 
  Settings2,
  Bookmark,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookReaderProps {
  book: {
    title: string;
    author: string;
    content: string[]; // Paginated content
  };
  onClose: () => void;
}

export function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showSettings, setShowSettings] = useState(false);

  const themeClasses = {
    dark: 'bg-[#0a0a0a] text-zinc-300',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    light: 'bg-white text-zinc-800',
  };

  const fontClasses = {
    sm: 'text-base leading-relaxed',
    md: 'text-lg leading-relaxed',
    lg: 'text-xl leading-relaxed',
  };

  // Progress percentage
  const progress = ((currentPage + 1) / book.content.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col transition-colors duration-500",
        themeClasses[theme]
      )}
    >
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-sm truncate max-w-[200px] md:max-w-md">{book.title}</h2>
            <p className="text-[10px] opacity-60 uppercase tracking-widest">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn("p-2 rounded-xl transition-colors", showSettings ? "bg-primary text-primary-foreground" : "hover:bg-white/10")}
          >
            <Type className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto px-6 py-12 md:px-24 lg:px-48 relative max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn("font-serif text-justify space-y-6", fontClasses[fontSize])}
          >
            {book.content[currentPage].split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-20 right-6 glass-strong p-6 rounded-3xl shadow-2xl z-[110] border border-white/10 w-64 space-y-6"
          >
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Tema</p>
              <div className="flex gap-2">
                <button onClick={() => setTheme('dark')} className="flex-1 h-10 rounded-xl bg-[#0a0a0a] border border-white/20" />
                <button onClick={() => setTheme('sepia')} className="flex-1 h-10 rounded-xl bg-[#f4ecd8] border border-black/10" />
                <button onClick={() => setTheme('light')} className="flex-1 h-10 rounded-xl bg-white border border-black/10" />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Tamaño de letra</p>
              <div className="flex gap-2">
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs transition-all",
                      fontSize === size ? "bg-primary text-primary-foreground" : "bg-white/5"
                    )}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <div className="px-6 py-6 border-t border-white/5 bg-black/5 backdrop-blur-md space-y-4">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <button 
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-2 text-sm font-medium disabled:opacity-20 transition-all hover:gap-3"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          
          <span className="text-xs font-mono opacity-50">
            Página {currentPage + 1} de {book.content.length}
          </span>

          <button 
            disabled={currentPage === book.content.length - 1}
            onClick={() => setCurrentPage(prev => Math.min(book.content.length - 1, prev + 1))}
            className="flex items-center gap-2 text-sm font-medium disabled:opacity-20 transition-all hover:gap-3"
          >
            Siguiente
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
