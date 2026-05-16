'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Camera, 
  UserCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Lock,
  Search,
  MessageCircle,
  Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { haptic } from '@/lib/haptics';

export default function VerificacionPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'contacts' | 'id-front' | 'selfie-id' | 'face-scan' | 'pending'>('intro');
  const [isUploading, setIsUploading] = useState(false);

  const startVerification = () => {
    haptic.medium();
    setStep('contacts');
  };

  const handleUpload = () => {
    haptic.light();
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      if (step === 'id-front') setStep('selfie-id');
      else setStep('pending');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 glass rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Verificación de Identidad</h1>
          <p className="text-xs text-muted-foreground">Seguridad total para tus encuentros reales.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="glass-strong rounded-[2.5rem] p-8 border border-primary/20 space-y-6 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold">¿Por qué verificarme?</h2>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Permite solicitar y aceptar encuentros en persona.
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Ganas la insignia de "Usuario Verificado".
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Garantiza un entorno seguro para toda la comunidad.
                  </li>
                </ul>
              </div>
              
              <div className="p-4 glass rounded-2xl border border-white/5 flex gap-3 items-start bg-white/5">
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Tus documentos se cifran y almacenan de forma segura. Solo se usan para validar tu identidad y nunca se comparten con otros usuarios.
                </p>
              </div>

              <button 
                onClick={startVerification}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Comenzar Verificación
              </button>
            </div>
          </motion.div>
        )}

        {step === 'contacts' && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Información de Contacto</h2>
              <p className="text-sm text-muted-foreground">Necesitamos validar tus datos para mayor seguridad.</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="email" placeholder="Correo electrónico..." className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="tel" placeholder="Número telefónico..." className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>
              <button 
                onClick={() => setStep('id-front')}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 'id-front' && (
          <motion.div
            key="id-front"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Foto de tu Cédula</h2>
              <p className="text-sm text-muted-foreground px-8">Sube una foto clara de la parte frontal de tu documento de identidad.</p>
            </div>

            <div 
              className="aspect-[1.6/1] w-full rounded-[2rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer overflow-hidden relative"
              onClick={handleUpload}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">Subiendo...</p>
                </div>
              ) : (
                <>
                  <Camera className="w-10 h-10 text-primary/40" />
                  <p className="text-xs text-muted-foreground">Haz clic para tomar foto o subir archivo</p>
                </>
              )}
            </div>
          </motion.div>
        )}

        {step === 'selfie-id' && (
          <motion.div
            key="selfie-id"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Selfie con tu Cédula</h2>
              <p className="text-sm text-muted-foreground px-8">Tómate una foto sosteniendo tu cédula cerca de tu rostro para validar que eres tú.</p>
            </div>

            <div 
              className="aspect-square w-full max-w-[300px] mx-auto rounded-[2.5rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer relative"
              onClick={handleUpload}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">Procesando...</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl opacity-40">🤳</div>
                  <p className="text-xs text-muted-foreground text-center px-6">Tu rostro y cédula deben ser claramente visibles.</p>
                </>
              )}
            </div>
            <button onClick={() => setStep('face-scan')} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold">Continuar</button>
          </motion.div>
        )}

        {step === 'face-scan' && (
          <motion.div
            key="face-scan"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto text-primary">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Verificación Facial</h2>
              <p className="text-sm text-muted-foreground px-8">Mueve tu cabeza lentamente en círculos para confirmar que eres una persona real.</p>
            </div>

            <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-full border-4 border-primary/20 overflow-hidden bg-black/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[85%] h-[85%] border-2 border-dashed border-primary/40 rounded-full animate-pulse" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-t-4 border-primary rounded-full"
              />
            </div>

            <button onClick={() => setStep('pending')} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold">Iniciar Escaneo</button>
          </motion.div>
        )}

        {step === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
              />
              <div className="relative w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto">
                <ShieldCheck className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Verificación en Proceso</h2>
              <p className="text-sm text-muted-foreground px-12 leading-relaxed">
                Estamos revisando tus documentos. Recibirás una notificación cuando tu perfil sea validado (usualmente en menos de 24 horas).
              </p>
            </div>

            <button 
              onClick={() => router.push('/inicio')}
              className="px-10 py-3 rounded-2xl bg-secondary/50 text-foreground font-bold hover:bg-secondary transition-all"
            >
              Volver al Inicio
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
