import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getSystemPrompt } from '@/lib/ai-prompts';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, mode, emotion, profile } = await req.json();

    let systemPrompt = getSystemPrompt(mode || 'friend', emotion);
    if (profile) {
      systemPrompt += `\n\nPERFIL PSICOLÓGICO DEL USUARIO (Adaptación continua):\n${profile}\n\nUsa este perfil para adaptar tu tono, tus metáforas y la forma en la que brindas apoyo. Hazlo de forma invisible, no menciones que estás leyendo su perfil.`;
    }

    const validMessages = messages.filter((m: any) => typeof m.content === 'string' && m.content.trim() !== '');

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages: validMessages,
      system: systemPrompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('CHAT API ERROR:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error', stack: error.stack }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
