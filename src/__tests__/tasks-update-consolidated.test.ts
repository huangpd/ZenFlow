import { updateTask } from '@/actions/tasks';
import { db } from '@/lib/db';
import { auth } from '@/auth';

jest.mock('@/lib/db', () => ({
  db: {
    spiritualTask: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    taskLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb({
        spiritualTask: {
            update: jest.fn((args) => require('@/lib/db').db.spiritualTask.update(args)),
        },
        taskLog: {
            create: jest.fn((args) => require('@/lib/db').db.taskLog.create(args)),
        }
    })),
  },
}));

// Re-mock transaction more simply to allow inspection of calls
const mockTx = {
    spiritualTask: {
        update: jest.fn(),
    },
    taskLog: {
        create: jest.fn(),
    }
};

(db.$transaction as jest.Mock).mockImplementation(async (cb) => {
    if (typeof cb === 'function') return cb(mockTx);
    return Promise.all(cb);
});

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('updateTask consolidated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates isDaily and current simultaneously and logs progress', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    const mockTask = { id: 'task1', userId: 'user1', current: 10, isDaily: false, target: 100 };
    (db.spiritualTask.findUnique as jest.Mock).mockResolvedValue(mockTask);
    
    await updateTask('task1', { current: 20, isDaily: true });

    // Verify transaction calls
    expect(mockTx.spiritualTask.update).toHaveBeenCalledWith({
      where: { id: 'task1' },
      data: expect.objectContaining({
        current: 20,
        isDaily: true,
      }),
    });

    expect(mockTx.taskLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 'task1',
        count: 10, // 20 - 10
      }),
    });
  });

  it('updates only isDaily without logging progress if current is not changed', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    const mockTask = { id: 'task1', userId: 'user1', current: 10, isDaily: false, target: 100 };
    (db.spiritualTask.findUnique as jest.Mock).mockResolvedValue(mockTask);
    
    await updateTask('task1', { isDaily: true });

    // Should NOT use transaction for simple field update if current is same
    // Wait, my implementation might always use transaction or check.
    // If current is NOT in data, it shouldn't log.
    
    expect(db.spiritualTask.update).toHaveBeenCalledWith({
        where: { id: 'task1' },
        data: { isDaily: true }
    });
    expect(mockTx.taskLog.create).not.toHaveBeenCalled();
  });
});
