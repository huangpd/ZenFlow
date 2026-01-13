import { getDetailedTaskStats } from '@/actions/stats';
import { db } from '@/lib/db';
import { auth } from '@/auth';

jest.mock('@/lib/db', () => ({
  db: {
    taskLog: {
      findMany: jest.fn(),
    },
    meditationSession: {
      aggregate: jest.fn(),
    },
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('getDetailedTaskStats', () => {
  it('merges meditation sessions into task stats', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    
    // Mock TaskLogs
    (db.taskLog.findMany as jest.Mock).mockResolvedValue([]);
    
    // Mock Meditation Aggregates
    // First call is for All Time, Second is for Today
    (db.meditationSession.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { duration: 100 } }) // All Time
      .mockResolvedValueOnce({ _sum: { duration: 30 } }); // Today

    const stats = await getDetailedTaskStats();

    expect(stats.today).toEqual(expect.arrayContaining([
      expect.objectContaining({
        text: '静坐冥想',
        count: 30,
        type: 'meditation'
      })
    ]));

    expect(stats.allTime).toEqual(expect.arrayContaining([
      expect.objectContaining({
        text: '静坐冥想',
        count: 100,
        type: 'meditation'
      })
    ]));
  });
});
