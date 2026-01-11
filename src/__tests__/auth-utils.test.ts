import bcrypt from 'bcryptjs';

describe('Auth Utilities', () => {
  it('should hash and verify passwords correctly', async () => {
    const password = 'mySecretPassword';
    const hash = await bcrypt.hash(password, 10);
    
    expect(hash).not.toBe(password);
    
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await bcrypt.compare('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});
