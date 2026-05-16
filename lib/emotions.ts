export type EmotionKey = 
  | 'sad'
  | 'anxious'
  | 'angry'
  | 'lonely'
  | 'overwhelmed'
  | 'confused'
  | 'hopeful'
  | 'peaceful';

export interface Emotion {
  key: EmotionKey;
  label: string;
  description: string;
  color: string;
  icon: string;
  response: string;
  suggestions: string[];
}

export const emotions: Record<EmotionKey, Emotion> = {
  sad: {
    key: 'sad',
    label: 'Triste',
    description: 'Siento un peso en el corazon',
    color: 'from-blue-900/50 to-slate-900/50',
    icon: '💧',
    response: 'La tristeza es una forma de honrar lo que importa. No tienes que cargarla solo/a.',
    suggestions: ['Hablar con alguien', 'Escribir en el diario', 'Escuchar lluvia']
  },
  anxious: {
    key: 'anxious',
    label: 'Ansioso/a',
    description: 'Mi mente no para',
    color: 'from-orange-900/50 to-red-900/50',
    icon: '🌀',
    response: 'La ansiedad miente sobre el futuro. Respira. Este momento es seguro.',
    suggestions: ['Ejercicio de respiracion', 'Sonidos relajantes', 'Escribir preocupaciones']
  },
  angry: {
    key: 'angry',
    label: 'Enojado/a',
    description: 'Siento rabia por dentro',
    color: 'from-red-900/50 to-orange-900/50',
    icon: '🔥',
    response: 'Tu enojo es valido. Algo te importa lo suficiente para sentirlo.',
    suggestions: ['Escribir una carta', 'Desahogarte aqui', 'Sonidos de naturaleza']
  },
  lonely: {
    key: 'lonely',
    label: 'Solo/a',
    description: 'Me siento aislado/a',
    color: 'from-purple-900/50 to-indigo-900/50',
    icon: '🌙',
    response: 'La soledad duele, pero no define tu valor. Estoy aqui contigo.',
    suggestions: ['Salas seguras', 'Chat de apoyo', 'Ambiente nocturno']
  },
  overwhelmed: {
    key: 'overwhelmed',
    label: 'Abrumado/a',
    description: 'Todo es demasiado',
    color: 'from-slate-800/50 to-gray-900/50',
    icon: '🌊',
    response: 'No tienes que resolver todo ahora. Un paso a la vez esta bien.',
    suggestions: ['Respiracion guiada', 'Modo presencia', 'Sonidos calmantes']
  },
  confused: {
    key: 'confused',
    label: 'Confundido/a',
    description: 'No se que siento',
    color: 'from-teal-900/50 to-cyan-900/50',
    icon: '🌫️',
    response: 'Esta bien no tener todas las respuestas. Los sentimientos no siempre tienen nombre.',
    suggestions: ['Diario libre', 'Explorar emociones', 'Hablar sin presion']
  },
  hopeful: {
    key: 'hopeful',
    label: 'Esperanzado/a',
    description: 'Veo algo de luz',
    color: 'from-emerald-900/50 to-teal-900/50',
    icon: '🌱',
    response: 'Que hermoso notar la esperanza. Mereces celebrar cada pequena luz.',
    suggestions: ['Escribir gratitud', 'Compartir en salas', 'Ambiente positivo']
  },
  peaceful: {
    key: 'peaceful',
    label: 'En paz',
    description: 'Estoy tranquilo/a',
    color: 'from-sky-900/50 to-blue-900/50',
    icon: '☁️',
    response: 'Que bueno que encontraste un momento de calma. Disfruta este espacio.',
    suggestions: ['Meditacion suave', 'Sonidos de naturaleza', 'Reflexion']
  }
};

export const getEmotionByKey = (key: EmotionKey): Emotion => emotions[key];

export const emotionKeys = Object.keys(emotions) as EmotionKey[];
