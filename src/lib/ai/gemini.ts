import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function getSutraInsight(sutraContent: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `请用通俗易懂且富有禅意的现代语言，解析以下经文片段，并给修行者一个生活中的建议：${sutraContent}`,
    config: {
      systemInstruction: '你是一位智慧、慈悲的禅修老师，说话简洁、深刻且温和。尽量使用温暖而有力量的现代中文。',
      temperature: 0.7,
    },
  });
  return response.text || '禅意深远，此时无声胜有声。';
}

export async function getDailyGuidance(
  meditationMins: number,
  tasksCount: number
) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `我今天坐禅了${meditationMins}分钟，完成了${tasksCount}项功课。请给我一个今天的修行寄语。`,
    config: {
      systemInstruction: '你是一位鼓励修行者的向导。用简短、优美、充满阳光的话语给予指引。',
    },
  });
  return response.text || '精进修行，功不唐捐。';
}

export async function generateChatResponse(history: { role: string; content: string }[]) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    config: {
      systemInstruction: '你是一位智慧、慈悲的禅修老师，说话简洁、深刻且温和。尽量使用温暖而有力量的现代中文。',
    },
  });

  return response.text;
}