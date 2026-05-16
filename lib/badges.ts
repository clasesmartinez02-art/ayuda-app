import type { EmotionKey } from './emotions';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  check: (stats: UserStats) => boolean;
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

export const badges: Badge[] = [
  {
    id: 'first-breath',
    name: 'Primer Respiro',
    description: 'Completaste tu primer ejercicio de respiración',
    icon: '🌬️',
    requirement: '1 ejercicio de respiración',
    check: (s) => s.breathingCompleted >= 1,
  },
  {
    id: 'open-heart',
    name: 'Corazón Abierto',
    description: 'Escribiste tu primera reflexión en el diario',
    icon: '💜',
    requirement: '1 entrada en el diario',
    check: (s) => s.diaryEntries >= 1,
  },
  {
    id: 'companion',
    name: 'Compañero/a',
    description: 'Enviaste 10 mensajes de apoyo en las salas',
    icon: '🤝',
    requirement: '10 mensajes en salas',
    check: (s) => s.messagesInRooms >= 10,
  },
  {
    id: 'listener',
    name: 'Oyente de Almas',
    description: 'Participaste en 3 sesiones como oyente',
    icon: '👂',
    requirement: '3 sesiones de escucha',
    check: (s) => s.listeningSessions >= 3,
  },
  {
    id: 'grounded',
    name: 'Pies en la Tierra',
    description: 'Completaste el ejercicio 5-4-3-2-1 tres veces',
    icon: '🌿',
    requirement: '3 ejercicios de grounding',
    check: (s) => s.groundingCompleted >= 3,
  },
  {
    id: 'survivor',
    name: 'Sobreviviente',
    description: 'Alcanzaste 200 XP',
    icon: '⭐',
    requirement: '200 XP',
    check: (s) => s.totalXP >= 200,
  },
  {
    id: 'healer',
    name: 'Sanador/a',
    description: 'Alcanzaste 500 XP',
    icon: '✨',
    requirement: '500 XP',
    check: (s) => s.totalXP >= 500,
  },
  {
    id: 'light',
    name: 'Luz Interior',
    description: 'Alcanzaste 2000 XP — Eres un faro para otros',
    icon: '🔥',
    requirement: '2000 XP',
    check: (s) => s.totalXP >= 2000,
  },
  {
    id: 'consistent',
    name: 'Constancia',
    description: '7 días seguidos usando la app',
    icon: '📅',
    requirement: '7 días activo',
    check: (s) => s.daysActive >= 7,
  },
  {
    id: 'writer',
    name: 'Escritor/a del Alma',
    description: 'Escribiste 10 entradas en tu diario',
    icon: '📖',
    requirement: '10 entradas en diario',
    check: (s) => s.diaryEntries >= 10,
  },
];

export function getEarnedBadges(stats: UserStats): Badge[] {
  return badges.filter(badge => badge.check(stats));
}

export function getNextBadges(stats: UserStats, limit = 3): Badge[] {
  return badges.filter(badge => !badge.check(stats)).slice(0, limit);
}
