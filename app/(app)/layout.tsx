'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { EmotionalBackground } from '@/components/emotional-background';
import { PageTransition } from '@/components/page-transition';
import { RainAnimation } from '@/components/rain-animation';
import { LevelProgress } from '@/components/level-progress';
import { useAppStore } from '@/lib/store';
import { DashboardSkeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isOnboarded, hasHydrated, hydrate } = useAppStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hasHydrated && !isOnboarded) {
      router.push('/');
    }
  }, [hasHydrated, isOnboarded, router]);

  if (!hasHydrated) {
    return <DashboardSkeleton />;
  }

  const isInicio = pathname === '/inicio';

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row overflow-hidden">
      <EmotionalBackground />
      <RainAnimation intensity="light" />
      
      {isInicio && <LevelProgress />}
      <Navigation />
      
      {/* Global Presence Floating Indicator (only on home to avoid hiding top-right UI in chat) */}
      {isInicio && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-3 py-1.5 glass rounded-full border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            12 almas presentes
          </span>
        </div>
      )}

      <main className="flex-1 h-full overflow-y-auto md:pl-64 pt-20 pb-32 md:pb-8 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 safe-px">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
