'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Lock, Shield, CheckCircle2 } from 'lucide-react';

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 -z-10" />
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-strong rounded-3xl p-8 md:p-10 shadow-2xl border border-white/5 space-y-8"
      >
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg"
          >
            <Lock className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inicia tu viaje</h1>
          <p className="text-muted-foreground font-light text-sm">Guarda tu progreso y conecta con otros en nuestro santuario blindado.</p>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
              <Shield className="w-3 h-3" /> Verificado
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" /> 2FA Ready
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-medium transition-all hover:bg-white/90 disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5" />
            {loading ? 'Cargando...' : 'Continuar con Google'}
          </motion.button>

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">o con email</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/50 border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <button
              onClick={() => alert('Próximamente: Login por Magic Link')}
              className="w-full py-4 rounded-2xl bg-primary/20 border border-primary/30 text-primary font-medium hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
            >
              Enviar link mágico
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/inicio')}
            className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-4"
          >
            Continuar como invitado (local)
          </button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground/40 leading-relaxed">
          Al continuar, aceptas nuestros términos de privacidad. 
          Tu nombre real nunca será compartido con otros usuarios.
        </p>
      </motion.div>
    </div>
  );
}
