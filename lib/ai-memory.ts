import { supabase } from './supabase';

export interface EmotionalContext {
  lastEmotions: string[];
  recentDiarySummary?: string;
  daysActive: number;
}

export async function getUserEmotionalContext(userId: string): Promise<EmotionalContext | null> {
  // Fetch last 5 emotions
  const { data: diaryEntries } = await supabase
    .from('diary_entries')
    .select('emotion, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!diaryEntries || diaryEntries.length === 0) return null;

  const emotions = diaryEntries
    .map(e => e.emotion)
    .filter(Boolean) as string[];

  // Simple summary of the last few entries
  const summary = diaryEntries
    .slice(0, 3)
    .map(e => e.content.substring(0, 100))
    .join(' | ');

  return {
    lastEmotions: emotions,
    recentDiarySummary: summary,
    daysActive: 3, // Mocked for now, can be calculated from created_at
  };
}

export function formatContextForAI(context: EmotionalContext | null): string {
  if (!context) return 'No hay historial emocional previo.';

  return `
HISTORIAL EMOCIONAL DEL USUARIO:
- Emociones recientes: ${context.lastEmotions.join(', ')}
- Resumen de pensamientos recientes: ${context.recentDiarySummary}
- Días usando la plataforma: ${context.daysActive}

INSTRUCCIÓN: Usa esta información de forma sutil. No la repitas literalmente.
Por ejemplo: "He notado que has estado sintiendo [emoción] últimamente, ¿quieres hablar de eso?" 
o "La última vez que hablamos te sentías un poco [emoción], ¿ha cambiado algo?"
`;
}
