export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'nature' | 'urban' | 'white-noise' | 'music';
  // Using free ambient sound URLs from various sources
  url: string;
}

// Note: These are placeholder URLs. In production, you'd use actual audio files
// stored in your public folder or a CDN
export const ambientSounds: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Lluvia suave',
    description: 'Gotas de lluvia cayendo',
    icon: '🌧️',
    category: 'nature',
    url: '/sounds/rain.mp3'
  },
  {
    id: 'thunder',
    name: 'Tormenta',
    description: 'Truenos distantes con lluvia',
    icon: '⛈️',
    category: 'nature',
    url: '/sounds/thunder.mp3'
  },
  {
    id: 'forest',
    name: 'Bosque',
    description: 'Pajaros y brisa entre arboles',
    icon: '🌲',
    category: 'nature',
    url: '/sounds/forest.mp3'
  },
  {
    id: 'ocean',
    name: 'Olas del mar',
    description: 'Olas rompiendo suavemente',
    icon: '🌊',
    category: 'nature',
    url: '/sounds/ocean.mp3'
  },
  {
    id: 'fire',
    name: 'Chimenea',
    description: 'Fuego crepitando',
    icon: '🔥',
    category: 'nature',
    url: '/sounds/fire.mp3'
  },
  {
    id: 'wind',
    name: 'Viento',
    description: 'Brisa suave',
    icon: '💨',
    category: 'nature',
    url: '/sounds/wind.mp3'
  },
  {
    id: 'night-train',
    name: 'Tren nocturno',
    description: 'Viaje en tren bajo la luna',
    icon: '🚂',
    category: 'urban',
    url: '/sounds/train.mp3'
  },
  {
    id: 'cafe',
    name: 'Cafeteria',
    description: 'Ambiente de cafe tranquilo',
    icon: '☕',
    category: 'urban',
    url: '/sounds/cafe.mp3'
  },
  {
    id: 'city-night',
    name: 'Ciudad nocturna',
    description: 'Sonidos urbanos de noche',
    icon: '🌃',
    category: 'urban',
    url: '/sounds/city.mp3'
  },
  {
    id: 'white-noise',
    name: 'Ruido blanco',
    description: 'Sonido constante relajante',
    icon: '📻',
    category: 'white-noise',
    url: '/sounds/white-noise.mp3'
  },
  {
    id: 'brown-noise',
    name: 'Ruido marron',
    description: 'Frecuencias mas graves',
    icon: '🎚️',
    category: 'white-noise',
    url: '/sounds/brown-noise.mp3'
  },
  {
    id: 'piano',
    name: 'Piano suave',
    description: 'Melodías para calmar el sobrepensamiento',
    icon: '🎹',
    category: 'music',
    url: '/sounds/piano.mp3'
  },
  {
    id: 'piano-rain',
    name: 'Piano y Lluvia',
    description: 'Melodía melancólica y reconfortante',
    icon: '🎵',
    category: 'music',
    url: '/sounds/piano-rain.mp3'
  }
];

export const getSoundById = (id: string): AmbientSound | undefined => {
  return ambientSounds.find(sound => sound.id === id);
};

export const getSoundsByCategory = (category: AmbientSound['category']): AmbientSound[] => {
  return ambientSounds.filter(sound => sound.category === category);
};

export const soundCategories = [
  { id: 'nature', name: 'Naturaleza', icon: '🌿' },
  { id: 'urban', name: 'Urbano', icon: '🏙️' },
  { id: 'white-noise', name: 'Ruido blanco', icon: '📻' },
  { id: 'music', name: 'Musica', icon: '🎵' }
] as const;
