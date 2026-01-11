import { getSutraInsight } from '@/lib/ai/gemini';

// Mocking global fetch or the SDK might be needed, but for now we'll try a real call if possible
// or just verify the function exists and is exported correctly.

describe('Gemini AI Service', () => {
  it('should be defined', () => {
    expect(getSutraInsight).toBeDefined();
  });

  // Note: We avoid real API calls in standard unit tests to prevent token usage and flake.
  // We will assume the SDK works if the configuration is correct.
});
