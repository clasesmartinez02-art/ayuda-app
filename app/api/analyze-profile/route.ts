import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ profile: '' }), { status: 200 });
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: `Eres un psicólogo analítico avanzado. Tu trabajo es leer un historial de conversación reciente entre un usuario y un chatbot de apoyo emocional. 
Tu objetivo es extraer y actualizar el perfil psicológico del usuario de forma clínica pero empática.
Extrae:
- Estado emocional general y detonantes (triggers).
- Estilo de comunicación (ej. habla mucho, respuestas cortas, sarcástico, reflexivo).
- Necesidades subyacentes (ej. busca validación, necesita desahogo sin consejos, requiere anclaje a la realidad).
- Metáforas o palabras clave que usa para conectar mejor con él/ella.

No devuelvas un texto largo. Devuelve un párrafo directo y estructurado de máximo 4-5 oraciones que será inyectado como contexto para el chatbot de apoyo. NO devuelvas el historial de la conversación, solo la conclusión psicológica actual.`,
      prompt: `Analiza esta conversación reciente y genera el perfil psicológico actualizado:\n\n${JSON.stringify(messages.slice(-20))}`
    });

    return new Response(JSON.stringify({ profile: text.trim() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing profile:', error);
    return new Response(JSON.stringify({ profile: '' }), { status: 500 });
  }
}
