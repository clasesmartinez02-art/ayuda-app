'use client';

import { create } from 'zustand';
import type { EmotionKey } from './emotions';
import type { ChatMode } from './ai-prompts';
import {
  getEmotionalState,
  setEmotionalState as saveEmotionalState,
  getAmbientPreferences,
  setAmbientPreferences as saveAmbientPreferences,
  isOnboarded as checkOnboarded,
  setOnboarded as saveOnboarded,
} from './storage';

export const levels = [
  { name: 'Sobreviviendo', minXP: 0 },
  { name: 'Respirando', minXP: 200 },
  { name: 'Sanando', minXP: 500 },
  { name: 'Reconstruyéndome', minXP: 1000 },
  { name: 'Luz Interior', minXP: 2000 },
  { name: 'Renaciendo', minXP: 4000 },
];

export type ComfortProfile = 'hablar' | 'escuchar' | 'apoyar' | 'compania' | 'reservado' | 'desahogo' | 'historias' | 'conectar';
export type SocialLevel = 'timido' | 'reservado' | 'normal' | 'sociable';
export type EnergyType = 'calmado' | 'alegre' | 'nocturno' | 'reflexivo' | 'silencioso' | 'emocional';
export type EncounterType = 'cafe' | 'caminata' | 'silencio' | 'estudio' | 'musica' | 'descarga';

export interface User {
  id: string;
  alias: string;
  comfort_profile?: ComfortProfile;
  current_state?: string;
  social_level?: SocialLevel;
  energy_type?: EnergyType;
  encounter_preferences?: EncounterType[];
  badges?: string[];
  reputation?: {
    empatia: number;
    respeto: number;
    escucha: number;
    confianza: number;
  };
  level?: number;
  xp?: number;
  is_onboarded?: boolean;
  role?: 'hablar' | 'escuchar' | 'ambos';
  email?: string;
  avatar_url?: string;
  interests?: string[];
  personality?: string[];
  goals?: string[];
}

export interface UserStats {
  totalXP: number;
  messagesInRooms: number;
  diaryEntries: number;
  breathingCompleted: number;
  groundingCompleted: number;
  daysActive: number;
  listeningSessions: number;
}

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  setRole: (role: User['role']) => void;
  
  // Onboarding
  isOnboarded: boolean;
  setOnboarded: (value: boolean) => void;
  
  // Gamification (El Viaje Interior)
  xp: number;
  level: number;
  levelName: string;
  addXP: (amount: number) => void;
  
  // Stats
  stats: UserStats;
  incrementStat: (key: keyof UserStats, amount?: number) => void;
  
  // Emotional state
  currentEmotion: EmotionKey | null;
  setEmotion: (emotion: EmotionKey) => void;
  
  // Chat
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  
  // Ambient
  activeSounds: string[];
  volumes: Record<string, number>;
  isPlaying: boolean;
  toggleSound: (soundId: string) => void;
  setVolume: (soundId: string, volume: number) => void;
  setIsPlaying: (playing: boolean) => void;
  
  // Emergency mode
  isEmergencyMode: boolean;
  setEmergencyMode: (active: boolean) => void;
  
  // Hydration
  hasHydrated: boolean;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Helper for Supabase Sync
  syncWithSupabase: async () => {
    const { user, xp, level, currentEmotion } = get();
    const { supabase } = require('./supabase');
    if (user && user.id !== 'local' && supabase) {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          alias: user.alias,
          role: user.role,
          comfort_profile: user.comfort_profile,
          interests: user.interests,
          personality: user.personality,
          goals: user.goals,
          xp,
          level,
          current_emotion: currentEmotion,
          last_seen: new Date().toISOString(),
        });
    }
  },

  // Auth
  user: null,
  setUser: (user) => set({ user }),
  setRole: (role) => {
    const { user } = get();
    if (user) {
      const newUser = { ...user, role };
      set({ user: newUser });
      if (typeof window !== 'undefined') {
        localStorage.setItem('refugio_user_role', role || '');
      }
      get().syncWithSupabase();
    }
  },

  // Onboarding
  isOnboarded: false,
  setOnboarded: (value) => {
    saveOnboarded(value);
    set({ isOnboarded: value });
  },
  
  // Gamification
  xp: 0,
  level: 1,
  levelName: 'Sobreviviendo',
  addXP: (amount) => {
    const { xp, stats } = get();
    const newXP = xp + amount;
    
    // Calculate level and levelName based on newXP
    let newLevel = 1;
    let newLevelName = levels[0].name;
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (newXP >= levels[i].minXP) {
        newLevel = i + 1;
        newLevelName = levels[i].name;
        break;
      }
    }
    
    const newStats = { ...stats, totalXP: newXP };
    if (typeof window !== 'undefined') {
      localStorage.setItem('refugio_xp', newXP.toString());
      localStorage.setItem('refugio_stats', JSON.stringify(newStats));
    }
    
    set({ xp: newXP, level: newLevel, levelName: newLevelName, stats: newStats });
    get().syncWithSupabase();
  },

  // Stats
  stats: { totalXP: 0, messagesInRooms: 0, diaryEntries: 0, breathingCompleted: 0, groundingCompleted: 0, daysActive: 1, listeningSessions: 0 },
  incrementStat: (key, amount = 1) => {
    const { stats } = get();
    const newStats = { ...stats, [key]: (stats[key] || 0) + amount };
    if (typeof window !== 'undefined') {
      localStorage.setItem('refugio_stats', JSON.stringify(newStats));
    }
    set({ stats: newStats });
  },

  // Emotional state
  currentEmotion: null,
  setEmotion: (emotion) => {
    saveEmotionalState(emotion);
    
    // Auto-atmosphere
    const { getAtmosphereForEmotion } = require('./atmospheres');
    const atmosphere = getAtmosphereForEmotion(emotion);
    const { toggleSound, activeSounds } = get();
    
    if (atmosphere.length > 0 && !activeSounds.includes(atmosphere[0])) {
      toggleSound(atmosphere[0]);
    }

    set({ currentEmotion: emotion });
    // Action reward
    get().addXP(10);
    get().syncWithSupabase();
  },
  
  // Chat
  chatMode: 'friend',
  setChatMode: (mode) => set({ chatMode: mode }),
  
  // Ambient
  activeSounds: [],
  volumes: {},
  isPlaying: false,
  toggleSound: (soundId) => {
    const { activeSounds, volumes } = get();
    const isActive = activeSounds.includes(soundId);
    const newActiveSounds = isActive
      ? activeSounds.filter(id => id !== soundId)
      : [...activeSounds, soundId];
    
    const newVolumes = { ...volumes };
    if (!isActive && !volumes[soundId]) {
      newVolumes[soundId] = 0.5;
    }
    
    saveAmbientPreferences({ activeSounds: newActiveSounds, volumes: newVolumes });
    set({ activeSounds: newActiveSounds, volumes: newVolumes });
    
    if (!isActive) get().addXP(5);
  },
  setVolume: (soundId, volume) => {
    const { volumes } = get();
    const newVolumes = { ...volumes, [soundId]: volume };
    saveAmbientPreferences({ volumes: newVolumes });
    set({ volumes: newVolumes });
  },
  setIsPlaying: (playing) => {
    saveAmbientPreferences({ isPlaying: playing });
    set({ isPlaying: playing });
  },
  
  // Emergency mode
  isEmergencyMode: false,
  setEmergencyMode: (active) => set({ isEmergencyMode: active }),
  
  // Hydration
  hasHydrated: false,
  hydrate: async () => {
    const onboarded = checkOnboarded();
    const emotionalState = getEmotionalState();
    const ambientPrefs = getAmbientPreferences();
    const { supabase } = require('./supabase');
    
    let storedXP = 0;
    let storedRole = null;
    let currentUser = null;
    let storedStats = { totalXP: 0, messagesInRooms: 0, diaryEntries: 0, breathingCompleted: 0, groundingCompleted: 0, daysActive: 1, listeningSessions: 0 };
    
    if (typeof window !== 'undefined') {
      storedXP = parseInt(localStorage.getItem('refugio_xp') || '0');
      storedRole = localStorage.getItem('refugio_user_role') as User['role'];
      try {
        const savedStats = localStorage.getItem('refugio_stats');
        if (savedStats) storedStats = { ...storedStats, ...JSON.parse(savedStats) };
      } catch {}
      storedStats.totalXP = storedXP;
    }

    // Check Supabase session
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile from DB
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          storedXP = profile.xp || storedXP;
          storedRole = profile.role || storedRole;
          currentUser = {
            id: session.user.id,
            email: session.user.email,
            alias: profile.alias,
            role: profile.role
          };
        }
      }
    }

    if (!currentUser && onboarded) {
      currentUser = { id: 'local', alias: 'Explorador', role: storedRole || undefined };
    }

    let currentLevel = 1;
    let currentLevelName = levels[0].name;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (storedXP >= levels[i].minXP) {
        currentLevel = i + 1;
        currentLevelName = levels[i].name;
        break;
      }
    }
    
    set({
      hasHydrated: true,
      isOnboarded: onboarded,
      currentEmotion: emotionalState.currentEmotion,
      activeSounds: ambientPrefs.activeSounds,
      volumes: ambientPrefs.volumes,
      isPlaying: ambientPrefs.isPlaying,
      xp: storedXP,
      level: currentLevel,
      levelName: currentLevelName,
      user: currentUser,
      stats: storedStats,
    });
  },
}));
