import { describe, it, expect } from 'vitest';
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
  it('falls back to process.env efficiently when in local dev', async () => {
    process.env.NODE_ENV = 'development';
    process.env.TEST_SECRET = 'LOCAL_VALUE';
    const val = await getSecret('TEST_SECRET');
    expect(val).toBe('LOCAL_VALUE');
  });
});
