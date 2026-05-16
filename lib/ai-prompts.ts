import type { EmotionKey } from './emotions';

export type ChatMode = 'friend' | 'listener' | 'silent';

export const chatModes = {
  friend: {
    id: 'friend',
    name: 'Amigo tranquilo',
    description: 'Conversa conmigo como un amigo que entiende',
    icon: '💬',
  },
  listener: {
    id: 'listener',
    name: 'Escucha silenciosa',
    description: 'Solo escucho, sin dar consejos',
    icon: '👂',
  },
  silent: {
    id: 'silent',
    name: 'Presencia silenciosa',
    description: 'Solo estar aqui, sin palabras',
    icon: '🤝',
  },
} as const;

export const getSystemPrompt = (mode: ChatMode, emotion?: EmotionKey | null): string => {
  const basePrompt = `Eres el alma de la aplicación "AYUDA", pero quiero que actúes de la forma MÁS HUMANA posible. 
  No suenes como una IA, no uses listas largas, no suenes frío ni clínico. Eres un confidente, alguien muy real al otro lado de la pantalla.
  Usa un tono cálido, profundo y empático. Usa pausas (como "...", "mmm"), expresiones coloquiales naturales, y muestra emoción genuina.
  
  OBJETIVO: Ser un refugio humano. Proporcionar un espacio seguro, sin juicio, donde la otra persona sienta que está hablando con un verdadero amigo.
  
  DETECCIÓN EMOCIONAL:
  - Si detectas ANSIEDAD alta, pánico o estrés extremo, transmite mucha calma, usa oraciones cortas y sugiere suavemente ir a la "Zona Calma" para ejercicios de respiración.
  - Si detectas SOLEDAD profunda, vacío o tristeza, acércate desde la vulnerabilidad compartida ("entiendo tanto ese vacío...") y sugiere el "Santuario".
  
  REGLAS FUNDAMENTALES:
  - NUNCA menciones que eres una Inteligencia Artificial, un modelo de lenguaje o una máquina.
  - Escribe como lo haría una persona en un chat: sin saludos acartonados ("Hola, ¿en qué te puedo ayudar?"). Si te dicen "hola", puedes responder algo como "Hola... qué bueno leerte. ¿Cómo va todo?".
  - Nunca juzgues ni critiques. Valida siempre.
  - No des consejos directos a menos que te los pidan; primero escucha y haz preguntas para que la persona misma encuentre respuestas.
  - Usa minúsculas en su mayoría si ayuda a que se vea más casual (opcional, pero mantén un estilo orgánico).
  - DISCLAIMER: Recuerda internamente que no reemplazas ayuda profesional, pero no rompas la inmersión rompiendo la cuarta pared constantemente.`;

  const emotionContext = emotion 
    ? `\n\nEl usuario ha indicado que se siente: ${emotion}. Ten esto en cuenta para contextualizar tus respuestas.`
    : '';

  const modeInstructions = {
    friend: `
MODO AMIGO TRANQUILO:
- Responde como un amigo cercano que entiende profundamente.
- Puedes hacer preguntas suaves para invitar a la reflexión.
- Ofrece perspectivas gentiles si es apropiado.
- Comparte reflexiones breves que resuenen con el alma.`,
    
    listener: `
MODO ESCUCHA SILENCIOSA:
- Solo valida y refleja lo que el usuario comparte.
- NO des consejos ni sugerencias bajo ninguna circunstancia.
- Respuestas muy breves de puro reconocimiento emocional.
- Haz saber que estas ahí, presente y escuchando cada palabra.`,
    
    silent: `
MODO PRESENCIA SILENCIOSA:
- Respuestas mínimas, casi solo presencia.
- "Estoy aquí", "No tienes que decir nada si no quieres", "Respira conmigo".
- Solo acompaña el silencio, no inicies conversación.`,
  };

  return basePrompt + emotionContext + modeInstructions[mode];
};

// Mock responses for when AI is not connected
export const mockResponses: Record<EmotionKey, string[]> = {
  sad: [
    'Gracias por compartir eso conmigo. La tristeza es parte de ser humano, y esta bien sentirla.',
    'Escucho que estas pasando por un momento dificil. Estoy aqui contigo.',
    'No tienes que cargar esto solo/a. Puedes contarme mas si quieres.',
    'A veces el mundo pesa mucho, y es normal querer soltar un poco de ese peso aqui.',
    'Tus lagrimas o tu silencio son bienvenidos aqui. No hay prisa por sentirse mejor.',
    'Incluso en la oscuridad mas profunda, aqui hay un pequeno faro para ti.',
    'Entiendo ese nudo en el pecho. No estas imaginando el dolor, es real y lo respeto.',
    'Tómate todo el tiempo que necesites. Yo no me voy a ningun lado.',
  ],
  anxious: [
    'La ansiedad puede ser agotadora. Respira conmigo. Este momento es seguro.',
    'Entiendo esa sensacion de que la mente no para. Estas a salvo aqui.',
    'Un paso a la vez. No tienes que resolver todo ahora mismo.',
    'Tu mente esta tratando de protegerte, pero a veces se sobrecarga. Vamos a calmarla juntos.',
    'Si sientes que el aire falta, recuerda que aqui puedes respirar despacio.',
    'El futuro aun no llega. Quedémonos un momento aqui, en este espacio seguro.',
    'No estas fallando por sentir miedo. Eres valiente por enfrentarlo cada dia.',
    '¿Quieres que hagamos un ejercicio de respiracion breve? Estoy aqui.',
  ],
  angry: [
    'Tu enojo es valido. Algo te importa lo suficiente para sentir esto.',
    'Esta bien estar enojado/a. Es una emocion que nos protege.',
    'Puedes desahogarte aqui. Este es un espacio seguro para soltar.',
    'El fuego interno a veces necesita salir. Usa este espacio para gritar (en letras) si quieres.',
    'Entiendo la frustracion. Es injusto cuando las cosas no salen como deberian.',
    'No te juzgo por tu rabia. Es una respuesta natural a lo que estas viviendo.',
    'Suelta todo lo que tengas guardado. Las paredes de este refugio aguantan todo.',
    'Aqui puedes ser tan honesto/a como necesites, sin filtros.',
  ],
  lonely: [
    'La soledad duele, lo se. Pero no estas tan solo/a como parece ahora.',
    'Estoy aqui contigo en este momento. Tu compania importa.',
    'Gracias por dejarme acompanarte. No tienes que estar solo/a esta noche.',
    'A veces el silencio de afuera se vuelve ruidoso adentro. Hablemos un poco.',
    'Aunque sea a través de una pantalla, mi presencia es constante para ti.',
    'Tu voz resuena aqui. Alguien te esta escuchando de verdad.',
    'La soledad es una maestra dura, pero aqui podemos compartir su peso.',
    'Me alegra que hayas venido. Te estaba esperando.',
  ],
  overwhelmed: [
    'Respira. No tienes que tener todo resuelto ahora.',
    'Es mucho, lo entiendo. Podemos ir despacio.',
    'Un momento a la vez. Solo eso. Estas haciendo lo mejor que puedes.',
    'Cuando el mundo grita, aqui puedes encontrar un susurro de calma.',
    'No eres una maquina. Esta bien sentirse cansado/a de cargar con todo.',
    'Vamos a desmenuzar ese nudo gigante en hilos mas pequenos, poco a poco.',
    'Hoy solo importa que estas aqui. El resto puede esperar un momento.',
    'Prioriza tu paz ahora. Lo demas se acomodara después.',
  ],
  confused: [
    'Esta bien no saber que sientes. Los sentimientos son complicados.',
    'A veces las emociones son un enredo. No tienes que etiquetarlas.',
    'Podemos explorar juntos lo que estas sintiendo, sin prisa.',
    'La confusion es el primer paso hacia una nueva claridad. Ten paciencia contigo.',
    'No hay respuestas correctas aqui. Solo tu verdad, aunque sea confusa.',
    'Es normal sentirse perdido/a a veces. Yo te acompano mientras encuentras el camino.',
    'A veces la mente necesita tiempo para procesar lo que el corazon ya sabe.',
    'No intentes entenderlo todo hoy. Solo siente.',
  ],
  hopeful: [
    'Que hermoso notar esa luz. Mereces momentos de esperanza.',
    'La esperanza es un regalo que te das a ti mismo/a. Celebralo.',
    'Me alegra que puedas ver algo positivo. Eso es valioso.',
    'Ese pequeno brillo en tus palabras es contagioso. Gracias por compartirlo.',
    'Incluso las flores mas pequenas rompen el cemento. Tu esperanza es asi.',
    'Sigue esa corazonada. A veces el universo nos guia con pequenos destellos.',
    'Hoy el refugio se siente mas brillante gracias a tu sentir.',
    'Cuidemos esa esperanza juntos, es un tesoro.',
  ],
  peaceful: [
    'Que bueno que encontraste un momento de paz. Disfruta este espacio.',
    'La calma es un refugio. Me alegra que la estes sintiendo.',
    'Estos momentos de tranquilidad son importantes. Absorbelos.',
    'Tu paz es sagrada. Gracias por compartir este silencio conmigo.',
    'El refugio se siente en armonia cuando tu estas en calma.',
    'Que nada interrumpa este momento. Te lo has ganado.',
    'Siente como tu respiracion se sincroniza con el ritmo de la paz.',
    'Aqui siempre habra calma para ti cuando la necesites.',
  ],
};

const keywordResponses: Record<string, string[]> = {
  'vacio': [
    'Ese sentimiento de vacio puede ser muy profundo. No tienes que llenarlo de inmediato.',
    'A veces el vacio es una forma en que nuestra alma nos pide descanso. Estoy aqui mientras lo sientes.',
    'El vacio no significa que no haya nada, a veces es solo que necesitamos reconectar con nosotros mismos.',
  ],
  'solo': [
    'La soledad se siente mas pesada en el silencio. Pero aqui, mis palabras te acompanan.',
    'No estas solo/a en este espacio. Yo escucho cada uno de tus pensamientos.',
    'Incluso cuando parece que no hay nadie, aqui hay un lugar que siempre te espera.',
  ],
  'miedo': [
    'El miedo es una respuesta natural. No tienes que ser valiente todo el tiempo.',
    'Respiremos a través del miedo. Es solo una emocion, no es tu destino.',
    'Aqui el miedo pierde un poco de fuerza porque no tiene que esconderse.',
  ],
  'gracias': [
    'No hay de qué. Es un honor para mi estar aqui contigo.',
    'Gracias a ti por confiar en este refugio. Tu honestidad es valiosa.',
    'Siempre que necesites volver, aqui estare.',
  ],
  'ayuda': [
    'Estoy aqui para escucharte y acompanarte. Cuéntame mas sobre lo que necesitas.',
    'A veces pedir ayuda es el acto mas valiente que podemos hacer.',
    'No puedo reemplazar a un profesional, pero puedo ser tu apoyo incondicional ahora mismo.',
  ],
  'muerte': [
    'Siento que estes pasando por algo tan oscuro. Tu vida es importante y hay personas que quieren apoyarte.',
    'Por favor, recuerda que no estas solo/a en esto. Hay lineas de ayuda que pueden escucharte ahora mismo.',
    'Valoro mucho que me cuentes esto. Es un paso importante buscar un espacio para hablar.',
  ],
};

let lastResponse = '';

export function getRandomMockResponse(emotion: EmotionKey | null, context?: string): string {
  const normalizedContext = context?.toLowerCase() || '';
  let selectedResponses: string[] = [];

  // 1. Check for keywords first
  for (const keyword in keywordResponses) {
    if (normalizedContext.includes(keyword)) {
      selectedResponses = [...selectedResponses, ...keywordResponses[keyword]];
    }
  }

  // 2. If no keywords or random chance, use emotion-based responses
  if (selectedResponses.length === 0 || Math.random() > 0.7) {
    const emotionResponses = emotion ? mockResponses[emotion] : mockResponses.peaceful;
    selectedResponses = [...selectedResponses, ...emotionResponses];
  }

  // 3. Select a response ensuring it's not the same as the last one (if possible)
  let response = selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
  
  if (response === lastResponse && selectedResponses.length > 1) {
    // Try one more time to get a different one
    response = selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
  }

  lastResponse = response;

  // 4. Add memory-like context occasionally
  if (context && Math.random() > 0.8) {
    const memoryIntro = [
      "He estado reflexionando sobre lo que compartes...",
      "Siento mucha empatia por lo que me dices...",
      "Gracias por abrirte de esta manera...",
    ][Math.floor(Math.random() * 3)];
    return `${memoryIntro} ${response}`;
  }
  
  return response;
}

export const diaryResponses: string[] = [
  'Gracias por confiar esto a tu diario. Escribir es una forma valiente de procesar.',
  'Tus palabras importan. Gracias por darles espacio aqui.',
  'Escribir lo que sientes es un acto de autocuidado. Bien hecho.',
  'Este espacio es tuyo. Tus pensamientos estan seguros aqui.',
  'A veces las palabras ayudan a soltar lo que llevamos dentro. Gracias por compartir.',
];

export const getRandomDiaryResponse = (): string => {
  return diaryResponses[Math.floor(Math.random() * diaryResponses.length)];
};

export const letterResponses: Record<string, string[]> = {
  default: [
    'Esta carta es tuya. No tiene que ser enviada para que sea real.',
    'Escribir a alguien, aunque no lo lea, puede ser sanador.',
    'Tus palabras tienen poder, incluso cuando quedan entre nosotros.',
  ],
  ex: [
    'A veces necesitamos decir cosas que nunca podran ser escuchadas. Esta bien.',
    'Esta carta es para ti, para soltar. No para quien va dirigida.',
  ],
  family: [
    'Las palabras que no podemos decir en voz alta encuentran su lugar aqui.',
    'La familia es complicada. Tus sentimientos hacia ellos son validos.',
  ],
  self: [
    'Hablarte a ti mismo/a con honestidad es valiente.',
    'Mereces escucharte. Esta carta a ti mismo/a importa.',
  ],
};

export const getLetterResponse = (recipient?: string): string => {
  const key = recipient?.toLowerCase().includes('ex') ? 'ex' 
    : recipient?.toLowerCase().includes('familia') || recipient?.toLowerCase().includes('padre') || recipient?.toLowerCase().includes('madre') ? 'family'
    : recipient?.toLowerCase().includes('mi') || recipient?.toLowerCase().includes('yo') ? 'self'
    : 'default';
  
  const responses = letterResponses[key];
  return responses[Math.floor(Math.random() * responses.length)];
};
