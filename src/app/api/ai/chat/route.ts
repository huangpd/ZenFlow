import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { openRouterFetchStream } from '@/lib/ai/ai-client';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 流式聊天 API
 * 使用 Server-Sent Events 返回 AI 响应
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await req.json();
        if (!content || typeof content !== 'string') {
            return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
        }

        const userId = session.user.id;

        // 获取历史记录 (最近 10 条)
        const history = await db.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const formattedHistory = history
            .reverse()
            .map((msg) => ({ role: msg.role, content: msg.content }));

        formattedHistory.push({ role: 'user', content });

        const systemInstruction = '你是一位智慧、慈悲的禅修老师,说话简洁、深刻且温和。尽量使用温暖而有力量的现代中文。';

        // 调用流式 AI
        const stream = await openRouterFetchStream(formattedHistory, systemInstruction);

        if (!stream) {
            return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        // 创建自定义流
        const customStream = new ReadableStream({
            async start(controller) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n').filter(line => line.trim() !== '');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]') continue;

                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices?.[0]?.delta?.content || '';
                                    if (content) {
                                        fullResponse += content;
                                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
                                    }
                                } catch (e) {
                                    // 忽略解析错误
                                }
                            }
                        }
                    }

                    // 保存到数据库
                    await db.chatMessage.createMany({
                        data: [
                            { userId, role: 'user', content },
                            { userId, role: 'assistant', content: fullResponse || '抱歉,我现在无法回答。' },
                        ],
                    });

                    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    console.error('Stream error:', error);
                    controller.error(error);
                }
            },
        });

        return new Response(customStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
