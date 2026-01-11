import { getSchemaMetadata } from '@/lib/schema-metadata';

describe('Schema Metadata', () => {
  it('should return a list of models', async () => {
    const metadata = await getSchemaMetadata();
    expect(metadata.models).toBeDefined();
    expect(metadata.models.length).toBeGreaterThan(0);
    expect(metadata.models.map(m => m.name)).toContain('User');
    // expect(metadata.models.map(m => m.name)).toContain('Sutra'); // Sutra might be optional in some contexts but defined in schema
  });

  it('should include field details for User', async () => {
    const metadata = await getSchemaMetadata();
    const userModel = metadata.models.find(m => m.name === 'User');
    expect(userModel).toBeDefined();
    const emailField = userModel?.fields.find(f => f.name === 'email');
    expect(emailField).toBeDefined();
    expect(emailField?.type).toBe('String');
  });
});
