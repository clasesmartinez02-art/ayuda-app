'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export default function AuthCallback() {
  const router = useRouter();
  const { hydrate, syncWithSupabase } = useAppStore();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user && !error) {
        // Sync local data to newly logged in user
        await hydrate();
        await syncWithSupabase();
        router.push('/inicio');
      } else {
        router.push('/login');
      }
    };

    handleAuth();
  }, [router, hydrate, syncWithSupabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-light animate-pulse">Sincronizando tu refugio...</p>
      </div>
    </div>
  );
}
