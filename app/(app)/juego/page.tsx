'use client';

import { motion } from 'framer-motion';
import { ZenGame } from '@/components/zen-game';
import { ArrowLeft, Gamepad2, Info } from 'lucide-react';
import Link from 'next/link';

export default function JuegoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/inicio"
          className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            Zona de Calma
          </h1>
          <p className="text-xs text-muted-foreground">Un pequeño espacio para distraer la mente</p>
        </div>
      </div>

      <ZenGame />

      {/* Why it helps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-3xl p-6 border border-primary/10 space-y-4"
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">¿Por qué ayuda?</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed font-light">
          En momentos de ansiedad, la <span className="text-foreground">distracción cognitiva</span> es una herramienta poderosa. Al enfocarte en una tarea simple y satisfactoria como reventar burbujas, interrumpes el ciclo de pensamientos intrusivos y le das a tu sistema nervioso un momento para regularse.
        </p>
        <div className="flex items-center gap-2 text-[10px] text-primary/60 uppercase tracking-widest font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          Recomendado para ataques de pánico leves o estrés agudo
        </div>
      </motion.div>
    </div>
  );
}
