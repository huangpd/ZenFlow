
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), 'scripts', 'zen_day.txt');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    // Split by newline and remove empty lines and extra whitespace
    const lines = fileContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    console.log(`Found ${lines.length} quotes in parsed file.`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const content of lines) {
        // Check for duplicate content to avoid spamming the DB with the same quotes
        // We use findFirst instead of findUnique because content is not @unique in schema yet (it is Text)
        // Note: Prisma Text fields can be searched.
        const existing = await prisma.zenQuote.findFirst({
            where: { content: content }
        });

        if (!existing) {
            await prisma.zenQuote.create({
                data: {
                    content: content,
                    author: null,
                    source: null
                }
            });
            importedCount++;
            // Optional: progress indicator
            if (importedCount % 10 === 0) {
                process.stdout.write(`.`);
            }
        } else {
            skippedCount++;
        }
    }

    console.log(`\nImport completed.`);
    console.log(`Successfully imported: ${importedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
