'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Coffee, 
  Wind, 
  Moon, 
  BookOpen, 
  Headphones, 
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Filter,
  Star,
  AlertCircle,
  UserCheck,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmotionalAvatar } from '@/components/emotional-avatar';
import { haptic } from '@/lib/haptics';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { getProfile } from '@/lib/storage';

const encounterTypes = [
  { id: 'cafe', label: 'Café', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'caminata', label: 'Caminata', icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'silencio', label: 'Silencio', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'estudio', label: 'Estudio', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'musica', label: 'Música', icon: Headphones, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'descarga', label: 'Desahogo', icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
];

const mockConnections = [
  {
    id: 'mock1',
    alias: 'Luna',
    state: 'Solo/a',
    energy: 'Nocturno',
    social: 'Reservado',
    distance: 0.5,
    preferences: ['silencio', 'cafe'],
    badges: ['🤝 Acompañar', '👂 Buen oyente'],
    verified: true
  },
  {
    id: 'mock2',
    alias: 'Río',
    state: 'Ansioso/a',
    energy: 'Calmado',
    social: 'Tímido',
    distance: 1.2,
    preferences: ['caminata', 'musica'],
    badges: ['🌱 Esperanza'],
    verified: true
  }
];

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2-lat1) * (Math.PI/180);  
  const dLon = (lon2-lon1) * (Math.PI/180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export default function ConexionesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isScanning, setIsScanning] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const { user } = useAppStore();
  const profile = typeof window !== 'undefined' ? getProfile() : null;

  useEffect(() => {
    let watchId: number;
    let channel: any;

    if (isScanning) {
      if (!navigator.geolocation) {
        setLocationError("La geolocalización no está soportada en tu navegador");
        setIsScanning(false);
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocationError(null);
          const { latitude, longitude } = position.coords;

          if (supabase) {
            if (!channel) {
              channel = supabase.channel('encuentros_radar');
              channel
                .on('presence', { event: 'sync' }, () => {
                  const state = channel.presenceState();
                  const others = [];
                  for (const id in state) {
                    const presence = state[id][0] as any;
                    if (presence.user_id !== user?.id) {
                      const dist = getDistanceFromLatLonInKm(latitude, longitude, presence.lat, presence.lng);
                      if (dist <= 10) { // Only users within 10 km
                        others.push({ ...presence, distance: dist });
                      }
                    }
                  }
                  setNearbyUsers(others);
                })
                .subscribe(async (status: string) => {
                  if (status === 'SUBSCRIBED') {
                    await channel.track({
                      user_id: user?.id || 'anon_' + Math.random(),
                      alias: profile?.alias || 'Anónimo',
                      lat: latitude,
                      lng: longitude,
                      energy: 'Buscando',
                      social: 'Abierto',
                      preferences: ['cafe', 'caminata'],
                      badges: ['🌟 Explorador'],
                      verified: false,
                      updated_at: new Date().toISOString()
                    });
                  }
                });
            } else {
              // Update existing tracking
              channel.track({
                user_id: user?.id || 'anon_' + Math.random(),
                alias: profile?.alias || 'Anónimo',
                lat: latitude,
                lng: longitude,
                energy: 'Buscando',
                social: 'Abierto',
                preferences: ['cafe', 'caminata'],
                badges: ['🌟 Explorador'],
                verified: false,
                updated_at: new Date().toISOString()
              });
            }
          } else {
            // Fallback mock mode
            setNearbyUsers(mockConnections);
          }
        },
        (error) => {
          setLocationError(error.message);
          setIsScanning(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (channel) supabase?.removeChannel(channel);
    };
  }, [isScanning, user?.id, profile?.alias]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Conexión Real
          </h1>
          <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Seguro</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Encuentra compañía humana real basada en tu energía emocional.</p>
      </div>

      {/* Verification Action Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-3xl p-5 border border-primary/30 bg-primary/10 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Tu perfil no está verificado</p>
            <p className="text-[10px] text-muted-foreground">Sube tu cédula para poder quedar con otros.</p>
          </div>
        </div>
        <Link 
          href="/verificacion"
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
        >
          Verificarme
        </Link>
      </motion.div>

      {/* Safety Warning */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-tight">Recordatorio de Seguridad</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Por tu seguridad, sugerimos encuentros solo en lugares públicos (cafés, parques, librerías). Tu ubicación exacta nunca es revelada.
          </p>
        </div>
      </motion.div>

      {/* Radar Section */}
      <div className="flex flex-col items-center justify-center p-8 glass rounded-3xl border border-primary/20 relative overflow-hidden min-h-[300px]">
        {/* Radar Animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          {isScanning && (
            <>
              <motion.div 
                animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 rounded-full border-2 border-primary" 
              />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-full h-full"
                style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(var(--primary), 0.3) 100%)', borderRadius: '50%' }}
              />
            </>
          )}
          <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),1)]" />
        </div>

        <div className="z-10 text-center space-y-4">
          {!isScanning ? (
            <>
              <MapPin className="w-10 h-10 text-primary mx-auto opacity-80" />
              <div>
                <h3 className="font-bold text-lg">Radar de Encuentros</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Encuentra personas cerca de ti buscando conexión o compañía segura.</p>
              </div>
              <button 
                onClick={() => { haptic.medium(); setIsScanning(true); }}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Escanear mi zona
              </button>
            </>
          ) : (
            <>
              <div className="h-10 flex items-center justify-center">
                <span className="text-primary font-bold animate-pulse">Buscando conexiones cercanas...</span>
              </div>
              <p className="text-xs text-muted-foreground">Usuarios encontrados: {nearbyUsers.length}</p>
              <button 
                onClick={() => { haptic.light(); setIsScanning(false); }}
                className="px-4 py-2 rounded-full glass border border-white/10 text-xs font-bold hover:bg-white/5 transition-all"
              >
                Detener radar
              </button>
            </>
          )}
          {locationError && <p className="text-xs text-destructive mt-2">{locationError}</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => { haptic.light(); setActiveFilter('all'); }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
            activeFilter === 'all' ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
          )}
        >
          Todos
        </button>
        {encounterTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => { haptic.light(); setActiveFilter(type.id); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeFilter === type.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Connections List */}
      <div className="grid gap-4">
        {nearbyUsers.filter(u => activeFilter === 'all' || u.preferences?.includes(activeFilter)).map((conn, i) => (
          <motion.div
            key={conn.id || conn.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-strong rounded-[2rem] p-6 border border-white/5 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <EmotionalAvatar size="lg" type={i % 2 === 0 ? 'silhouette' : 'star'} />
                {conn.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {conn.alias}
                      <span className="text-[10px] font-normal text-muted-foreground tracking-normal flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full">
                        <MapPin className="w-2.5 h-2.5 text-primary" /> {conn.distance.toFixed(1)} km
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80">{conn.energy || 'Tranquilo'}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{conn.social || 'Abierto'}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/chat/privado/${conn.user_id || conn.id}`}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                    title="Iniciar Chat Privado"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(conn.badges || []).map((badge: string, j: number) => (
                    <span key={j} className="px-2 py-0.5 rounded-full bg-secondary/50 text-[9px] font-bold text-muted-foreground border border-white/5">
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Busca:</p>
                  <div className="flex gap-2">
                    {(conn.preferences || []).map((pref: string) => {
                      const type = encounterTypes.find(t => t.id === pref);
                      if (!type) return null;
                      const Icon = type.icon;
                      return (
                        <div key={pref} className={cn("p-1.5 rounded-lg", type.bg)} title={type.label}>
                          <Icon className={cn("w-3.5 h-3.5", type.color)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {nearbyUsers.length === 0 && isScanning && (
          <p className="text-center text-muted-foreground text-sm py-8">Aún no hay nadie cerca. Sigue escaneando...</p>
        )}
      </div>

      {/* Past Encounters / Feedback Loop */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">Encuentros Recientes</h3>
        <div className="glass rounded-3xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">L</div>
              <div>
                <p className="text-xs font-bold">Encuentro con Luna</p>
                <p className="text-[10px] text-muted-foreground">Ayer en Café Central</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold hover:bg-emerald-500/20 transition-all">Seguro</button>
              <button className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-[10px] font-bold hover:bg-destructive/20 transition-all">Reportar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Prompt */}
      <div className="glass rounded-3xl p-8 border border-primary/20 text-center space-y-4 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto text-primary">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Gana Confianza</h3>
          <p className="text-xs text-muted-foreground px-4">Verifica tu perfil para acceder a más encuentros y ganar insignias de seguridad.</p>
        </div>
        <Link 
          href="/verificacion"
          className="inline-block px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Verificar mi Perfil
        </Link>
      </div>
    </div>
  );
}

