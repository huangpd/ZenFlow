import { fetchModelData } from '@/actions/admin-data';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  }
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/auth-utils', () => ({
  isAdmin: jest.fn(),
}));

describe('fetchModelData', () => {
  it('fetches data for a valid model', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: 'admin@example.com' } });
    (isAdmin as unknown as jest.Mock).mockReturnValue(true);
    (db.user.findMany as jest.Mock).mockResolvedValue([{ id: '1', name: 'Test' }]);
    (db.user.count as jest.Mock).mockResolvedValue(1);

    const result = await fetchModelData('User', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(db.user.findMany).toHaveBeenCalled();
  });
});