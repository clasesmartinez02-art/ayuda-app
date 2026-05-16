import type { EmotionKey } from './emotions';

export const emotionAtmospheres: Record<EmotionKey, string[]> = {
  sad: ['rain', 'piano'],
  anxious: ['forest', 'breathing'],
  calm: ['stars', 'wind'],
  angry: ['storm', 'static'],
  joy: ['birds', 'sunlight'],
  tired: ['waves', 'night'],
  lonely: ['distant-train', 'soft-rain'],
  hopeful: ['sunrise', 'gentle-piano'],
};

export function getAtmosphereForEmotion(emotion: EmotionKey | null) {
  if (!emotion) return [];
  return emotionAtmospheres[emotion] || [];
}
