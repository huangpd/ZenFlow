import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const zenQuotes = [
    { content: "一花一世界，一叶一菩提。", author: "《华严经》", source: "" },
    { content: "菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。", author: "六祖慧能", source: "《坛经》" },
    { content: "应无所住，而生其心。", author: "", source: "《金刚经》" },
    { content: "凡所有相，皆是虚妄。若见诸相非相，即见如来。", author: "", source: "《金刚经》" },
    { content: "知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。", author: "孔子", source: "《大学》" },
    { content: "本来无一物，何处惹尘埃。", author: "六祖慧能", source: "《坛经》" },
    { content: "心生种种法生，心灭种种法灭。", author: "", source: "" },
    { content: "万法皆空，因果不空。", author: "", source: "" },
    { content: "一切有为法，如梦幻泡影，如露亦如电，应作如是观。", author: "", source: "《金刚经》" },
    { content: "平常心是道。", author: "马祖道一", source: "" },
    { content: "春有百花秋有月，夏有凉风冬有雪。若无闲事挂心头，便是人间好时节。", author: "慧开禅师", source: "" },
    { content: "身是菩提树，心如明镜台。时时勤拂拭，勿使惹尘埃。", author: "神秀", source: "" },
    { content: "行到水穷处，坐看云起时。", author: "王维", source: "" },
    { content: "不立文字，教外别传；直指人心，见性成佛。", author: "", source: "" },
    { content: "坐亦禅，行亦禅，一花一世界，一叶一如来。", author: "", source: "" },
    { content: "当下一念，即是前缘。", author: "", source: "" },
    { content: "放下屠刀，立地成佛。", author: "", source: "" },
    { content: "苦海无边，回头是岸。", author: "", source: "" },
    { content: "随缘不变，不变随缘。", author: "", source: "" },
    { content: "一念愚即般若绝，一念智即般若生。", author: "六祖慧能", source: "《坛经》" }
];

async function main() {
    console.log('Seeding Zen quotes...');
    for (const quote of zenQuotes) {
        // Upsert avoids duplicates if we run seed multiple times
        // Assuming content is unique enough for this simple seed script- but since we don't have unique constraint on content,
        // we simply create many. To avoid duplicates effectively in a real robust way we'd check existence.
        // For now, let's just use createMany if table is empty, or simple create.

        // To be safe and simple: just create. Ideally we would check if it exists.
        const existing = await prisma.zenQuote.findFirst({
            where: { content: quote.content }
        });

        if (!existing) {
            await prisma.zenQuote.create({
                data: quote
            });
        }
    }
    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
