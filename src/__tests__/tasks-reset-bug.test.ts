import { getTasks } from '@/actions/tasks';
import { db } from '@/lib/db';
import { auth } from '@/auth';

jest.mock('@/lib/db', () => ({
  db: {
    spiritualTask: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((actions) => Promise.all(actions)),
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Daily Reset Logic Fix', () => {
  it('should restrict deletion/reset to tasks updated before today', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    
    // Trigger reset by simulating an old task
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    (db.spiritualTask.findFirst as jest.Mock).mockResolvedValue({
      id: 'old-task',
      updatedAt: yesterday,
    });
    
    (db.spiritualTask.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (db.spiritualTask.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await getTasks();

    // Verify deleteMany has date filter
    expect(db.spiritualTask.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        userId: 'user1',
        isDaily: false,
        updatedAt: expect.anything() // Expecting some date filter
      })
    }));

    // Verify updateMany has date filter
    expect(db.spiritualTask.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        userId: 'user1',
        isDaily: true,
        updatedAt: expect.anything() // Expecting some date filter
      }),
      data: expect.any(Object)
    }));
  });
});
