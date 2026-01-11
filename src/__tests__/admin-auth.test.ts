import { isAdmin } from '@/lib/auth-utils';

// Mock process.env
const originalEnv = process.env;

describe('Admin Access Control', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return true if email is in ADMIN_EMAILS', () => {
    process.env.ADMIN_EMAILS = 'admin@example.com,super@example.com';
    expect(isAdmin('admin@example.com')).toBe(true);
    expect(isAdmin('super@example.com')).toBe(true);
  });

  it('should return false if email is NOT in ADMIN_EMAILS', () => {
    process.env.ADMIN_EMAILS = 'admin@example.com';
    expect(isAdmin('user@example.com')).toBe(false);
  });

  it('should return false if ADMIN_EMAILS is not set', () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdmin('admin@example.com')).toBe(false);
  });

  it('should handle whitespace in ADMIN_EMAILS', () => {
     process.env.ADMIN_EMAILS = ' admin@example.com , super@example.com ';
     expect(isAdmin('admin@example.com')).toBe(true);
     expect(isAdmin('super@example.com')).toBe(true);
  });

  it('should return false for null or undefined email', () => {
      process.env.ADMIN_EMAILS = 'admin@example.com';
      expect(isAdmin(null as any)).toBe(false);
      expect(isAdmin(undefined as any)).toBe(false);
  });
});
