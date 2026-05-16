'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck,
  ArrowLeft,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { haptic } from '@/lib/haptics';

export default function RegistrarEncuentroPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.medium();
    setSubmitted(true);
    setTimeout(() => {
      router.push('/conexiones');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Encuentro Registrado</h2>
          <p className="text-sm text-muted-foreground px-8">
            El encuentro ha quedado registrado en nuestro sistema de seguridad. 
            Recuerda seguir todos los protocolos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 glass rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrar Encuentro</h1>
          <p className="text-xs text-muted-foreground">Registra los detalles de tu reunión por seguridad.</p>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] p-6 border border-primary/20 bg-primary/5 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Al registrar tu encuentro, nuestro sistema guarda la ubicación y hora aproximada. Esto nos permite activar protocolos de seguridad si algo no sale según lo planeado.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User to Meet */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-2">¿Con quién te verás?</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              required
              type="text" 
              placeholder="Alias del usuario..."
              className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-2">Lugar (Debe ser público)</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              required
              type="text" 
              placeholder="Ej: Starbuck's de la Plaza Central..."
              className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-2">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                required
                type="date" 
                className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-2">Hora</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                required
                type="time" 
                className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Safety Agreement */}
        <div className="p-4 glass rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">Compromiso de Seguridad</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Me comprometo a verme solo en el lugar público indicado y a usar el botón SOS de la aplicación si me siento incómodo/a o en peligro.
          </p>
        </div>

        <button 
          type="submit"
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          Registrar y Confirmar
        </button>
      </form>
    </div>
  );
}
