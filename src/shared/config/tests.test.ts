import { describe, it, expect, vi } from 'vitest';
import { getDictionary } from '@/shared/lib/i18n';
import { getSecret } from '@/shared/config/secrets';

describe('i18n dictionary functionality', () => {
  it('returns english dictionary accurately', () => {
    const dict = getDictionary('en');
    expect(dict.submit).toBe('Analyze Claim');
    expect(dict.result).toBe('Claim Analysis Result');
  });

  it('returns hindi dictionary accurately', () => {
    const dict = getDictionary('hi');
    expect(dict.submit).toBe('दावे का विश्लेषण करें');
  });
});

describe('secrets proxy configuration', () => {
  it('falls back to environment variables in development correctly', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    process.env.GEMINI_API_KEY = 'test-local-key';
    
    const secret = await getSecret('GEMINI_API_KEY');
    expect(secret).toBe('test-local-key');
    
    vi.unstubAllEnvs();
  });
});
