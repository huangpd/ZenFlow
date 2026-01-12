import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * SQLite High Performance Configuration
 * WAL mode allows concurrent reads and faster writes.
 */
const initDb = async () => {
  try {
    // Using $queryRawUnsafe for PRAGMAs that might return values to avoid "Execute returned results" error
    await prisma.$queryRawUnsafe(`PRAGMA journal_mode=WAL;`);
    await prisma.$queryRawUnsafe(`PRAGMA synchronous=NORMAL;`);
    await prisma.$queryRawUnsafe(`PRAGMA busy_timeout=5000;`);
    await prisma.$queryRawUnsafe(`PRAGMA cache_size=-20000;`); // 20MB cache
    await prisma.$queryRawUnsafe(`PRAGMA foreign_keys=ON;`);
  } catch (e) {
    // Silently fail if not SQLite or during build
    if (process.env.NODE_ENV === 'development') {
      console.error('SQLite optimization failed:', e instanceof Error ? e.message : String(e));
    }
  }
};

// Initialize in background
initDb();

export const db = prisma;