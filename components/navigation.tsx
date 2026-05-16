'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';
import {
  Home,
  MessageCircle,
  BookHeart,
  Users,
  Waves,
  AlertCircle,
  User,
  BookOpen,
  Gamepad2,
  Globe,
} from 'lucide-react';

const navItems = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/conexiones', label: 'Encuentros', icon: Users },
  { href: '/muro', label: 'Muro', icon: Globe },
  { href: '/diario', label: 'Diario', icon: BookHeart },
  { href: '/ambiente', label: 'Ambiente', icon: Waves },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
        <div className="bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe">
          <div className="flex items-center justify-around px-2 py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => haptic.light()}
                  className={cn(
                    'relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="text-xs relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-50">
        <div className="flex-1 bg-card/50 backdrop-blur-xl border-r border-border/50 p-6">
          {/* Logo */}
          <Link href="/inicio" className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="font-semibold text-foreground tracking-wide">AYUDA</h1>
              <p className="text-xs text-muted-foreground">Un lugar donde puedes ser tú</p>
            </div>
          </Link>

          {/* Nav links */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Emergency button */}
          <div className="mt-auto pt-6">
            <Link
              href="/emergencia"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                'bg-destructive/10 text-destructive hover:bg-destructive/20',
                pathname === '/emergencia' && 'bg-destructive/20'
              )}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Necesito ayuda</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile emergency FAB */}
      <Link
        href="/emergencia"
        className="fixed bottom-24 right-4 z-50 md:hidden"
      >
        <motion.div
          className="w-14 h-14 rounded-full bg-destructive/90 flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.4)',
              '0 0 0 10px rgba(239, 68, 68, 0)',
            ],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
            },
          }}
        >
          <AlertCircle className="w-6 h-6 text-white" />
        </motion.div>
      </Link>
    </>
  );
}
