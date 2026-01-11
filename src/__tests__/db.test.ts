import { db } from '@/lib/db';

describe('Database Connection', () => {
  it('should be able to query the database', async () => {
    // Attempt to count users (should be 0 or more, but not fail)
    const userCount = await db.user.count();
    expect(typeof userCount).toBe('number');
  });

  it('should be able to create a test user and delete it', async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    const user = await db.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
      },
    });

    expect(user.email).toBe(testEmail);

    const deletedUser = await db.user.delete({
      where: { id: user.id },
    });

    expect(deletedUser.id).toBe(user.id);
  });
});
