'use server';

import { auth } from '@/auth';
import { generateChatResponse, getSutraInsight, getDailyGuidance as getGeminiGuidance } from '@/lib/ai/gemini';
import { db } from '@/lib/db';

/**
 * 获取佛经内容的 AI 解析
 * @param sutraContent 佛经文本
 */
export async function getGuidance(sutraContent: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  try {
    const insight = await getSutraInsight(sutraContent);
    return { success: true, insight };
  } catch (error) {
    console.error('AI Error:', error);
    return { success: false, error: 'AI 服务暂时不可用' };
  }
}

/**
 * 获取基于今日修行数据的每日寄语
 */
export async function getDailyGuidance(
  meditationMins: number, 
  tasksCount: number,
  tasksCompleted: number,
  journalCount: number,
  journalCategories: string[]
) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  try {
    return await getGeminiGuidance(
      meditationMins,
      tasksCount,
      tasksCompleted,
      journalCount,
      journalCategories
    );
  } catch (error) {
    console.error('AI Daily Guidance Error:', error);
    return '精进修行，功不唐捐。';
  }
}

/**
 * 与 AI 进行灵性对话
 * @param content 用户输入内容
 */
export async function chat(content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;

  try {
    // 1. 获取历史记录 (最近 10 条)
    const history = await db.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const formattedHistory = history
      .reverse()
      .map((msg) => ({ role: msg.role, content: msg.content }));
    
    formattedHistory.push({ role: 'user', content });

    // 2. 调用 AI
    const responseText = await generateChatResponse(formattedHistory) || "抱歉，我现在无法回答。";

    // 3. 保存到数据库
    await db.chatMessage.createMany({
      data: [
        { userId, role: 'user', content },
        { userId, role: 'assistant', content: responseText },
      ],
    });

    return { success: true, response: responseText };
  } catch (error) {
    console.error('Chat Error Details:', error);
    return { success: false, error: '对话服务暂时不可用' };
  }
}

/**
 * 清除当前用户的聊天历史记录
 */
export async function clearChatHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    await db.chatMessage.deleteMany({
      where: { userId: session.user.id },
    });
    return { success: true };
  } catch (error) {
    console.error('Clear Chat History Error:', error);
    return { success: false, error: '清除失败' };
  }
}
