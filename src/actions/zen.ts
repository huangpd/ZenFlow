'use server';

import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function getDailyZen() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Not authenticated' };
    }

    const userId = session.user.id;
    // Use client's timezone or default to Asia/Shanghai for "daily" definition logic if needed,
    // but for simplicity and consistency on server, let's stick to a standard date string YYYY-MM-DD based on a fixed timezone or UTC.
    // Given the user is likely in China based on context ("Daily Zen"), let's use Asia/Shanghai.
    const today = dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD');

    try {
        // 1. Check if user already has a quote for today
        const existingDaily = await prisma.dailyZen.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            include: {
                quote: true,
            },
        });

        if (existingDaily) {
            return { quote: existingDaily.quote };
        }

        // 2. If not, pick a random quote
        //    Ideally we want a quote not recently seen, but for V1 random is fine.
        const count = await prisma.zenQuote.count();
        // If no quotes exist, return null or a fallback
        if (count === 0) {
            return {
                quote: {
                    content: "本来无一物，何处惹尘埃。",
                    author: "六祖慧能",
                    source: "《坛经》"
                }
            };
        }

        const skip = Math.floor(Math.random() * count);
        const randomQuote = await prisma.zenQuote.findFirst({
            skip,
        });

        if (!randomQuote) {
            return {
                quote: {
                    content: "本来无一物，何处惹尘埃。",
                    author: "六祖慧能",
                    source: "《坛经》"
                }
            };
        }

        // 3. Save assignment
        await prisma.dailyZen.create({
            data: {
                userId,
                quoteId: randomQuote.id,
                date: today,
            },
        });

        return { quote: randomQuote };
    } catch (error) {
        console.error('Error fetching daily zen:', error);
        return { error: 'Failed to fetch daily zen' };
    }
}
