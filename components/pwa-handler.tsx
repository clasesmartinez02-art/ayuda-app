'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Download, X, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export function AppPWAHandler() {
  const router = useRouter();
  const { setUser, setOnboarded } = useAppStore();
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isViolation, setIsViolation] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Anti-Screenshot & Focus Loss Logic
    const handleViolation = () => {
      setIsViolation(true);
      // Auto-ban/reset after 3 seconds
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        setUser(null);
        setOnboarded(false);
        window.location.href = '/';
      }, 3000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen detection (limited on web but catches some)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        handleViolation();
      }
      // Common screenshot shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        handleViolation();
      }
    };

    const handleFocus = () => setIsBlurred(false);
    const handleBlur = () => setIsBlurred(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    // Attempt to block context menu for extra security
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Install prompt logic
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show after some interaction or time
      const timer = setTimeout(() => {
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        if (!isInstalled) setShowInstallBanner(true);
      }, 10000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [setUser, setOnboarded]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  return (
    <>
      {/* Offline Status Toast */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-destructive text-white text-xs font-medium flex items-center gap-2 shadow-lg border border-white/20"
          >
            <WifiOff className="w-3 h-3" />
            Sin conexión a internet
          </motion.div>
        )}
        {isOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }} // Hidden by default
            key="online-toast"
          />
        )}
      </AnimatePresence>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[90] md:left-auto md:right-8 md:bottom-8 md:w-80"
          >
            <div className="glass-strong rounded-3xl p-5 shadow-2xl border border-primary/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold text-sm">Instalar AYUDA</p>
                <p className="text-muted-foreground text-xs">Acceso rápido desde tu pantalla de inicio</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleInstall}
                  className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Blackout / Violation Overlay */}
      <AnimatePresence>
        {(isBlurred || isViolation) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-8 text-center"
          >
            {isViolation ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-white">VIOLACIÓN DE SEGURIDAD</h2>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Se ha detectado un intento de captura o grabación. 
                  Tu acceso ha sido revocado permanentemente para proteger la privacidad del refugio.
                </p>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 3 }}
                    className="w-full h-full bg-destructive"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto rounded-2xl animate-pulse" />
                <p className="text-white font-light tracking-widest uppercase text-xs">Protegiendo tu Refugio</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
