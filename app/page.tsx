'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  Shield,
  Lock,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { EmotionSelector } from '@/components/emotion-selector';
import { RainAnimation } from '@/components/rain-animation';
import { cn } from '@/lib/utils';

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

const steps = ['splash', 'welcome', 'auth', 'policies', 'role', 'alias', 'emotion', 'transition'] as const;
type Step = typeof steps[number];

export default function OnboardingPage() {
  const router = useRouter();
  const { isOnboarded, hasHydrated, hydrate, setOnboarded, setRole, setUser } = useAppStore();
  const [currentStep, setCurrentStep] = useState<Step>('splash');
  
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  const [alias, setAlias] = useState('');
  const [selectedRole, setSelectedRole] = useState<'hablar' | 'escuchar' | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Check auth session
  useEffect(() => {
    if (!hasHydrated) return;

    const checkSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      setSession(activeSession);

      if (activeSession) {
        if (isOnboarded) {
          router.push('/inicio');
        } else {
          setCurrentStep('policies');
        }
      }
    };

    if (supabase) {
      checkSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession && !isOnboarded) {
          setCurrentStep('policies');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Offline/No-Supabase mode
      setSession(null);
      if (!isOnboarded) {
        const timer = setTimeout(() => setCurrentStep('welcome'), 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [hasHydrated, isOnboarded, router]);

  // Auto-advance splash
  useEffect(() => {
    if (currentStep === 'splash' && !session) {
      const timer = setTimeout(() => setCurrentStep('welcome'), 3500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, session]);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
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
      alert('Error al iniciar sesión. Intenta de nuevo.');
      setAuthLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
      alert('Te hemos enviado un enlace mágico a tu correo.');
    } catch (error) {
      console.error('Error con Magic Link', error);
      alert('Hubo un error al enviar el enlace.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!session?.user) return; // Must be logged in

    try {
      // Create profile in Supabase
      await supabase.from('profiles').upsert({
        id: session.user.id,
        alias: alias.trim(),
        level: 'Sobreviviendo'
      });

      // Update local state
      setRole(selectedRole || 'hablar');
      const { createProfile } = require('@/lib/storage');
      createProfile(alias.trim());
      
      setCurrentStep('transition');
      setTimeout(() => {
        setOnboarded(true);
        router.push('/inicio');
      }, 2000);
    } catch (err) {
      console.error("Error finalizing profile", err);
      alert("Hubo un problema guardando tu perfil. Reintenta.");
    }
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <RainAnimation intensity="light" />
      
      {/* Ambient gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/40 via-background to-purple-950/20 -z-10" />
      
      <AnimatePresence mode="wait">
        {/* SPLASH */}
        {currentStep === 'splash' && (
          <motion.div
            key="splash"
            className="fixed inset-0 flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 1.5, ease: 'easeOut' }}>
              <img src="/logo.png" alt="Logo" className="w-32 h-32 rounded-3xl shadow-2xl" />
            </motion.div>
            <motion.h1 initial={{ letterSpacing: '0.8em', opacity: 0 }} animate={{ letterSpacing: '0.2em', opacity: 1 }} transition={{ duration: 2, delay: 0.5 }} className="text-4xl md:text-5xl font-light text-foreground tracking-widest">
              AYUDA
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.7, y: 0 }} transition={{ duration: 1.5, delay: 1.5 }} className="text-muted-foreground text-lg italic">
              Aquí nadie te juzga.
            </motion.p>
          </motion.div>
        )}

        {/* WELCOME */}
        {currentStep === 'welcome' && (
          <motion.div
            key="welcome"
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-lg text-center space-y-8">
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl md:text-3xl font-light text-foreground leading-relaxed">
                Hola… me alegra que estés aquí.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-muted-foreground text-lg leading-relaxed">
                Este es un espacio seguro donde puedes ser tú. 
                Sin máscaras, sin presión, sin juicio.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentStep('auth')}
                className="mt-8 px-8 py-4 rounded-2xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all duration-300 text-lg"
              >
                Comenzar
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* AUTH (REGISTRATION) */}
        {currentStep === 'auth' && (
          <motion.div
            key="auth"
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="max-w-md w-full glass-strong rounded-3xl p-8 shadow-2xl border border-primary/20 space-y-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Lock className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Registro Seguro</h2>
                <p className="text-xs text-muted-foreground">Debes registrarte para proteger la comunidad. Tu identidad real estará oculta.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-medium transition-all hover:bg-white/90 disabled:opacity-50"
                >
                  <GoogleIcon className="w-5 h-5" />
                  {authLoading ? 'Cargando...' : 'Registrarse con Google'}
                </button>

                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">o usa tu correo</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <button
                    onClick={handleMagicLink}
                    disabled={!email || authLoading}
                    className="w-full py-3 rounded-2xl bg-primary/20 border border-primary/30 text-primary font-medium hover:bg-primary/30 transition-all disabled:opacity-30"
                  >
                    Enviar Enlace de Acceso
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* POLICIES / CONSENT */}
        {currentStep === 'policies' && (
          <motion.div
            key="policies"
            className="fixed inset-0 flex flex-col items-center justify-center px-6 overflow-y-auto py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="max-w-md w-full space-y-6 glass-strong rounded-[2.5rem] p-8 border border-primary/20 shadow-2xl">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center text-3xl mx-auto mb-2">
                  🛡️
                </div>
                <h2 className="text-2xl font-bold text-foreground">Políticas y Seguridad</h2>
                <p className="text-sm text-muted-foreground">
                  Al registrarte, aceptas formalmente estas reglas.
                </p>
              </div>
              
              <div className="space-y-4 text-xs text-muted-foreground leading-relaxed bg-black/20 p-4 rounded-2xl">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">1</div>
                  <p><span className="text-foreground font-bold">Responsabilidad:</span> Esta app no reemplaza la ayuda psicológica profesional. Si estás en una crisis, busca ayuda de emergencia.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">2</div>
                  <p><span className="text-foreground font-bold">Privacidad:</span> Prohibido hacer capturas de pantalla de chats de otros usuarios.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">3</div>
                  <p><span className="text-foreground font-bold">Respeto Absoluto:</span> Cualquier agresión, burla o contenido inapropiado resultará en baneo permanente.</p>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => setCurrentStep('role')}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Acepto los términos
                </button>
                <button
                  onClick={() => { supabase.auth.signOut(); router.push('https://google.com'); }}
                  className="w-full py-2 text-muted-foreground text-[10px] hover:text-foreground transition-all"
                >
                  No estoy de acuerdo (Cerrar cuenta y salir)
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ROLE SELECTION (ESCUCHAR O HABLAR) */}
        {currentStep === 'role' && (
          <motion.div
            key="role"
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="max-w-md w-full text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-light text-foreground">¿A qué vienes hoy?</h2>
                <p className="text-muted-foreground">Elige cómo deseas participar en la comunidad.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => { setSelectedRole('hablar'); setCurrentStep('alias'); }}
                  className="w-full group relative overflow-hidden glass rounded-3xl p-6 border border-transparent hover:border-primary/50 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center text-center gap-2">
                    <span className="text-5xl mb-2">💬</span>
                    <h3 className="text-xl font-bold text-foreground">Quiero Hablar</h3>
                    <p className="text-sm text-muted-foreground">Necesito desahogarme, contar lo que siento y ser escuchado sin juicios.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setSelectedRole('escuchar'); setCurrentStep('alias'); }}
                  className="w-full group relative overflow-hidden glass rounded-3xl p-6 border border-transparent hover:border-accent/50 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center text-center gap-2">
                    <span className="text-5xl mb-2">👂</span>
                    <h3 className="text-xl font-bold text-foreground">Quiero Escuchar</h3>
                    <p className="text-sm text-muted-foreground">Tengo la energía para leer a otros, apoyar y brindar compañía.</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ALIAS */}
        {currentStep === 'alias' && (
          <motion.div
            key="alias"
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="max-w-md w-full text-center space-y-8">
              <p className="text-2xl font-light text-foreground">
                Elige tu Alias Anónimo
              </p>
              <p className="text-muted-foreground text-sm">
                Nunca mostraremos tu nombre real ni tu correo.
              </p>

              <div className="space-y-6">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Ej: Caminante Nocturno"
                  maxLength={20}
                  autoFocus
                  className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-border/50 text-foreground text-center text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                />

                <button
                  onClick={() => setCurrentStep('emotion')}
                  disabled={!alias.trim()}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-30 flex justify-center items-center gap-2"
                >
                  Siguiente paso <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* EMOTION CHECK-IN */}
        {currentStep === 'emotion' && (
          <motion.div
            key="emotion"
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-xl w-full text-center space-y-8">
              <p className="text-2xl font-light text-foreground">
                ¿Cómo te sientes en este momento, {alias}?
              </p>
              <EmotionSelector onSelect={() => setTimeout(handleFinalSubmit, 800)} size="lg" />
              <button
                onClick={handleFinalSubmit}
                className="text-muted-foreground/60 hover:text-muted-foreground text-sm transition-colors underline underline-offset-4"
              >
                Prefiero no decirlo
              </button>
            </div>
          </motion.div>
        )}

        {/* TRANSITION */}
        {currentStep === 'transition' && (
          <motion.div
            key="transition"
            className="fixed inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="text-2xl md:text-3xl font-light text-foreground text-center px-6">
              Creando tu refugio, {alias}...
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
