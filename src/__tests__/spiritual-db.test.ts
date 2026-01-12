import { db } from '@/lib/db';

describe('Spiritual Data Models', () => {
  it('should be able to create and query a JournalEntry', async () => {
    // Create a user first
    const user = await db.user.create({
      data: {
        email: `journal-test-${Date.now()}@example.com`,
        name: 'Journal Tester',
      },
    });

    const entry = await db.journalEntry.create({
      data: {
        userId: user.id,
        content: 'Today was a peaceful day.',
        mood: 'calm',
        tags: 'meditation, reflection',
      },
    });

    expect(entry.content).toBe('Today was a peaceful day.');
    expect(entry.userId).toBe(user.id);

    // Cleanup
    await db.user.delete({ where: { id: user.id } });
  });

  it('should be able to create ChatMessages', async () => {
    const user = await db.user.create({
      data: {
        email: `chat-test-${Date.now()}@example.com`,
        name: 'Chat Tester',
      },
    });

    const message = await db.chatMessage.create({
      data: {
        userId: user.id,
        role: 'user',
        content: 'Hello, I need guidance.',
      },
    });

    expect(message.content).toBe('Hello, I need guidance.');
    expect(message.role).toBe('user');

    await db.user.delete({ where: { id: user.id } });
  });
});
