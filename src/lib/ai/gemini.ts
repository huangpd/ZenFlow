const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;

async function openRouterFetch(messages: any[], systemInstruction?: string) {
  if (!API_KEY) throw new Error('OPENROUTER_API_KEY is not defined');

  const finalMessages = systemInstruction 
    ? [{ role: 'system', content: systemInstruction }, ...messages]
    : messages;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://zenflow.spiritual', // Optional
      'X-Title': 'ZenFlow', // Optional
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: finalMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function getSutraInsight(sutraContent: string) {
  const systemInstruction = '你是一位智慧、慈悲的禅修老师，说话简洁、深刻且温和。尽量使用温暖而有力量的现代中文。';
  const prompt = `请用通俗易懂且富有禅意的现代语言，解析以下经文片段，并给修行者一个生活中的建议：${sutraContent}`;
  
  return openRouterFetch([{ role: 'user', content: prompt }], systemInstruction);
}

export async function getDailyGuidance(meditationMins: number, tasksCount: number) {
  const systemInstruction = '你是一位鼓励修行者的向导。用简短、优美、充满阳光的话语给予指引。';
  const prompt = `我今天坐禅了${meditationMins}分钟，完成了${tasksCount}项功课。请给我一个今天的修行寄语。`;
  
  return openRouterFetch([{ role: 'user', content: prompt }], systemInstruction);
}

export async function generateChatResponse(history: { role: string; content: string }[]) {
  const systemInstruction = '你是一位智慧、慈悲的禅修老师，说话简洁、深刻且温和。尽量使用温暖而有力量的现代中文。';
  
  const messages = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  return openRouterFetch(messages, systemInstruction);
}
