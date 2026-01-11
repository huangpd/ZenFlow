import { updateTask } from '@/actions/tasks';
import { db } from '@/lib/db';
import { auth } from '@/auth';

jest.mock('@/lib/db', () => ({
  db: {
    spiritualTask: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('updateTask', () => {
  it('updates task isDaily status', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    (db.spiritualTask.findUnique as jest.Mock).mockResolvedValue({ id: 'task1', userId: 'user1', isDaily: false });
    (db.spiritualTask.update as jest.Mock).mockResolvedValue({ id: 'task1', isDaily: true });

    await updateTask('task1', { isDaily: true });

    expect(db.spiritualTask.update).toHaveBeenCalledWith({
      where: { id: 'task1' },
      data: { isDaily: true },
    });
  });

  it('throws unauthorized if user does not own task', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    (db.spiritualTask.findUnique as jest.Mock).mockResolvedValue({ id: 'task1', userId: 'user2' });

    await expect(updateTask('task1', { isDaily: true })).rejects.toThrow('Forbidden');
  });
});
