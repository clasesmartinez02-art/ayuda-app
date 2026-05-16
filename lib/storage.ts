import type { EmotionKey } from './emotions';

// Types
export interface UserProfile {
  id: string;
  alias: string;
  psychologicalProfile?: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  content: string;
  emotion: EmotionKey | null;
  type: 'diary' | 'letter';
  recipient?: string;
  aiResponse?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  mode: 'friend' | 'listener' | 'silent';
  createdAt: string;
  updatedAt: string;
}

export interface SafeRoomPost {
  id: string;
  content: string;
  room: string;
  reactions: {
    understand: number;
    notAlone: number;
    heart: number;
  };
  createdAt: string;
}

export interface EmotionalState {
  currentEmotion: EmotionKey | null;
  lastUpdated: string;
}

// Storage keys
const KEYS = {
  PROFILE: 'refugio_profile',
  EMOTIONAL_STATE: 'refugio_emotional_state',
  DIARY_ENTRIES: 'refugio_diary_entries',
  CHAT_CONVERSATIONS: 'refugio_chat_conversations',
  SAFE_ROOM_POSTS: 'refugio_safe_room_posts',
  AMBIENT_PREFERENCES: 'refugio_ambient_preferences',
  ONBOARDED: 'refugio_onboarded',
} as const;

// Helpers
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Profile
export const getProfile = (): UserProfile | null => {
  return getItem<UserProfile | null>(KEYS.PROFILE, null);
};

export const createProfile = (alias: string): UserProfile => {
  const profile: UserProfile = {
    id: generateId(),
    alias,
    createdAt: new Date().toISOString(),
  };
  setItem(KEYS.PROFILE, profile);
  return profile;
};

export const updateProfile = (updates: Partial<UserProfile>): void => {
  const profile = getProfile();
  if (profile) {
    setItem(KEYS.PROFILE, { ...profile, ...updates });
  }
};

// Onboarding
export const isOnboarded = (): boolean => {
  return getItem<boolean>(KEYS.ONBOARDED, false);
};

export const setOnboarded = (value: boolean): void => {
  setItem(KEYS.ONBOARDED, value);
};

// Emotional State
export const getEmotionalState = (): EmotionalState => {
  return getItem<EmotionalState>(KEYS.EMOTIONAL_STATE, {
    currentEmotion: null,
    lastUpdated: new Date().toISOString(),
  });
};

export const setEmotionalState = (emotion: EmotionKey): void => {
  setItem(KEYS.EMOTIONAL_STATE, {
    currentEmotion: emotion,
    lastUpdated: new Date().toISOString(),
  });
};

// Diary
export const getDiaryEntries = (): DiaryEntry[] => {
  return getItem<DiaryEntry[]>(KEYS.DIARY_ENTRIES, []);
};

export const addDiaryEntry = (entry: Omit<DiaryEntry, 'id' | 'createdAt'>): DiaryEntry => {
  const entries = getDiaryEntries();
  const newEntry: DiaryEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  setItem(KEYS.DIARY_ENTRIES, [newEntry, ...entries]);
  return newEntry;
};

export const updateDiaryEntry = (id: string, updates: Partial<DiaryEntry>): void => {
  const entries = getDiaryEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    setItem(KEYS.DIARY_ENTRIES, entries);
  }
};

export const deleteDiaryEntry = (id: string): void => {
  const entries = getDiaryEntries();
  setItem(KEYS.DIARY_ENTRIES, entries.filter(e => e.id !== id));
};

// Chat
export const getChatConversations = (): ChatConversation[] => {
  return getItem<ChatConversation[]>(KEYS.CHAT_CONVERSATIONS, []);
};

export const getCurrentConversation = (): ChatConversation | null => {
  const conversations = getChatConversations();
  return conversations[0] || null;
};

export const createConversation = (mode: ChatConversation['mode'] = 'friend'): ChatConversation => {
  const conversations = getChatConversations();
  const newConversation: ChatConversation = {
    id: generateId(),
    messages: [],
    mode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setItem(KEYS.CHAT_CONVERSATIONS, [newConversation, ...conversations]);
  return newConversation;
};

export const addMessageToConversation = (
  conversationId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): ChatMessage => {
  const conversations = getChatConversations();
  const index = conversations.findIndex(c => c.id === conversationId);
  
  const newMessage: ChatMessage = {
    ...message,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  if (index !== -1) {
    conversations[index].messages.push(newMessage);
    conversations[index].updatedAt = new Date().toISOString();
    setItem(KEYS.CHAT_CONVERSATIONS, conversations);
  }

  return newMessage;
};

export const deleteConversation = (id: string): void => {
  const conversations = getChatConversations();
  setItem(KEYS.CHAT_CONVERSATIONS, conversations.filter(c => c.id !== id));
};

// Safe Room Posts
export const getSafeRoomPosts = (room?: string): SafeRoomPost[] => {
  const posts = getItem<SafeRoomPost[]>(KEYS.SAFE_ROOM_POSTS, []);
  return room ? posts.filter(p => p.room === room) : posts;
};

export const addSafeRoomPost = (content: string, room: string): SafeRoomPost => {
  const posts = getSafeRoomPosts();
  const newPost: SafeRoomPost = {
    id: generateId(),
    content,
    room,
    reactions: { understand: 0, notAlone: 0, heart: 0 },
    createdAt: new Date().toISOString(),
  };
  setItem(KEYS.SAFE_ROOM_POSTS, [newPost, ...posts]);
  return newPost;
};

export const addReactionToPost = (
  postId: string,
  reaction: keyof SafeRoomPost['reactions']
): void => {
  const posts = getSafeRoomPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    posts[index].reactions[reaction]++;
    setItem(KEYS.SAFE_ROOM_POSTS, posts);
  }
};

// Ambient Preferences
export interface AmbientPreferences {
  activeSounds: string[];
  volumes: Record<string, number>;
  isPlaying: boolean;
}

export const getAmbientPreferences = (): AmbientPreferences => {
  return getItem<AmbientPreferences>(KEYS.AMBIENT_PREFERENCES, {
    activeSounds: [],
    volumes: {},
    isPlaying: false,
  });
};

export const setAmbientPreferences = (prefs: Partial<AmbientPreferences>): void => {
  const current = getAmbientPreferences();
  setItem(KEYS.AMBIENT_PREFERENCES, { ...current, ...prefs });
};
